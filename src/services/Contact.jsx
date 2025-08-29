import axios from 'axios';

// Configuration Airtable
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_APP_AIRTABLE_CONTACT_TABLE_NAME || 'Contacts';
const AIRTABLE_API_KEY = import.meta.env.VITE_APP_AIRTABLE_API_KEY || 'your_api_key';
const AIRTABLE_CAMPAIGNS_TABLE='Campagnes'

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Créer un nouveau contact
export const createContact = async (contactData) => {
  try {
    console.log(contactData)
    const response = await airtableClient.post(`/${AIRTABLE_TABLE_NAME}`, {
      fields: contactData
    });

    return {
      success: true,
      message: 'Contact créé avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la création du contact:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la création du contact'
        }
      }
    };
  }
};

// Récupérer tous les contacts avec pagination et filtres
export const getContacts = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = '',
      sortOrder = 'DESC',
      statut = '',
      campagne = '',
      profil = ''
    } = params;

    let airtableParams = {
      pageSize: 100, // Maximum pour Airtable
      fields: [
        'ID_CONTACT',
        'Nom',
        'Localisation', 
        'Poste actuel',
        'Entreprise actuelle',
        'URL',
        'Statut',
        'Campagne',
        'Nom de la campagne (from Campagne)',
        'Notes',
        'Secteurs',
        'Parcours',
        'ParcoursEducation',
        'Message Personnalisé',
        'connection',
        'Email',
        'Téléphone',
        'Date du message',
        'Réponse reçue',
        'Date de réponse',
        'profilImage',
        'Profil'  // Nouveau champ ajouté
      ]
    };

    // Tri - seulement si explicitement demandé et valide
    if (sortBy && mapFieldName(sortBy)) {
      const direction = sortOrder === 'DESC' ? 'desc' : 'asc';
      airtableParams.sort = [{ field: mapFieldName(sortBy), direction }];
    }

    // Construction des filtres
    let filters = [];
    
    // Recherche par nom, email, entreprise, poste
    if (search) {
      filters.push(`OR(
        SEARCH(LOWER("${search}"), LOWER({Nom})),
        SEARCH(LOWER("${search}"), LOWER({Email })),
        SEARCH(LOWER("${search}"), LOWER({Entreprise actuelle})),
        SEARCH(LOWER("${search}"), LOWER({Poste actuel})),
        SEARCH(LOWER("${search}"), LOWER({Nom de la campagne (from Campagne)}))
      )`);
    }

    // Filtre par statut
    if (statut) {
      filters.push(`{Statut} = "${statut}"`);
    }

    // Filtre par profil
    if (profil) {
      filters.push(`{Profil} = "${profil}"`);
    }

    // Filtre par campagne - utiliser le nom de la campagne
    if (campagne) {
      filters.push(`{Nom de la campagne (from Campagne)} = "${campagne}"`);
    }

    // Combiner les filtres
    if (filters.length > 0) {
      airtableParams.filterByFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(', ')})`;
    }

    
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams
    });

    console.log("all",response.data.records);    
    const transformedRecords = response.data.records.map(record => {
        // Utiliser le champ lookup pour le nom de la campagne
        const campagneNom = record.fields['Nom de la campagne (from Campagne)'];
        const campagneId = record.fields['Campagne'];
        
      return {
        id: record.id,
        ID_CONTACT: record.fields['ID_CONTACT'] ,
        image: record.fields['profilImage'] || '',
        airtableId: record.fields['ID_CONTACT'] || '',
        nom: record.fields['Nom'] || '',
        localisation: record.fields['Localisation'] || '',
        posteActuel: record.fields['Poste actuel'] || '',
        entrepriseActuelle: record.fields['Entreprise actuelle'] || '',
        url: record.fields['URL'] || '',
        statut: record.fields['Statut'] || 'Non contacté',
        campagne: Array.isArray(campagneNom) ? campagneNom[0] : campagneNom || '',
        campagneId: Array.isArray(campagneId) ? campagneId[0] : campagneId || '',
        secteurs: record.fields['Secteurs'] || '',
        parcours: record.fields['Parcours'] || '',
        parcoursEducation: record.fields['ParcoursEducation'] || '',
        messagePersonnalise: record.fields['Message Personnalisé'] || '',
        connection: record.fields['connection'] || '', // Note: minuscule dans votre CSV
        email: record.fields['Email'] || '', // Note: espace à la fin dans votre CSV
        telephone: record.fields['Téléphone'] || '',
        dateMessage: record.fields['Date du message'] || '',
        reponseRecue: record.fields['Réponse reçue'] || '',
        dateReponse: record.fields['Date de réponse'] || '',
        notes: record.fields['Notes'] || '', // Note: espace à la fin dans votre CSV
        profil: record.fields['Profil'] || 'En attente' // Nouveau champ
      };
    });

    // Simulation de pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = transformedRecords.slice(startIndex, endIndex);
    const totalItems = transformedRecords.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        contacts: paginatedRecords,
        totalItems,
        totalPages,
        currentPage: page
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    throw error;
  }
};

// Récupérer un contact par ID_CONTACT
export const getContactById = async (ID_CONTACT) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`);
    
    const record = response.data;
    const campagneNom = record.fields['Nom de la campagne (from Campagne)'];
    const campagneId = record.fields['Campagne'];
    
    return {
      data: {
        ID_CONTACT: record.ID_CONTACT,
        airtableId: record.fields['ID_CONTACT'] || '',
        image: record.fields['profilImage'] || '',
        nom: record.fields['Nom'] || '',
        localisation: record.fields['Localisation'] || '',
        posteActuel: record.fields['Poste actuel'] || '',
        entrepriseActuelle: record.fields['Entreprise actuelle'] || '',
        url: record.fields['URL'] || '',
        statut: record.fields['Statut'] || 'Non contacté',
        campagne: Array.isArray(campagneNom) ? campagneNom[0] : campagneNom || '',
        campagneId: Array.isArray(campagneId) ? campagneId[0] : campagneId || '',
        secteurs: record.fields['Secteurs'] || '',
        parcours: record.fields['Parcours'] || '',
        parcoursEducation: record.fields['ParcoursEducation'] || '',
        messagePersonnalise: record.fields['Message Personnalisé'] || '',
        connection: record.fields['connection'] || '',
        email: record.fields['Email'] || '',
        telephone: record.fields['Téléphone'] || '',
        dateMessage: record.fields['Date du message'] || '',
        reponseRecue: record.fields['Réponse reçue'] || '',
        dateReponse: record.fields['Date de réponse'] || '',
        notes: record.fields['Notes'] || '',
        profil: record.fields['Profil'] || 'En attente'
      }
    };
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un contact
export const updateContact = async (ID_CONTACT, contactData) => {
  try {
    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`, {
      fields: contactData
    });

    return {
      success: true,
      message: 'Contact mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du contact'
        }
      }
    };
  }
};

// Supprimer un contact
export const deleteContact = async (ID_CONTACT) => {
  
  try {
    await airtableClient.delete(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`);
    
    return {
      success: true,
      message: 'Contact supprimé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du contact:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression du contact'
        }
      }
    };
  }
};

// Mettre à jour le statut d'un contact
export const updateContactStatus = async (ID_CONTACT, statut) => {
  try {
    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`, {
      fields: {
        'Statut': statut
      }
    });

    return {
      success: true,
      message: 'Statut du contact mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du statut'
        }
      }
    };
  }
};

// Mettre à jour le statut de profil d'un contact
export const updateContactProfile = async (ID_CONTACT, profil) => {
  try {
    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`, {
      fields: {
        'Profil': profil
      }
    });

    return {
      success: true,
      message: 'Profil du contact mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du profil'
        }
      }
    };
  }
};

// Tri et retri automatique des profils
export const autoSortProfiles = async (campaignId, criteria = 'auto') => {
  try {
    const response = await fetch(`https://n8n.srv903010.hstgr.cloud/webhook/trier/profils`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: campaignId
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return {
      success: true,
      message: 'Tri automatique des profils lancé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors du tri automatique des profils:', error);
    throw error;
  }
};

// Fonction pour faire le tri manuel des profils
export const manualSortProfiles = async (campaignId) => {
  try {
    const response = await fetch(`https://n8n.srv903010.hstgr.cloud/webhook/retrier/profils`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: campaignId
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return {
      success: true,
      message: 'Retri des profils lancé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors du retri des profils:', error);
    throw error;
  }
};

// Récupérer tous les contacts avec les noms des campagnes
export const getContactsWithCampagneNames = async (params = {}) => {
  try {
    // D'abord récupérer les contacts
    const contactsResponse = await getContacts(params);
    
    // Ensuite récupérer toutes les campagnes pour faire le mapping
    const { getCampagnes } = await import('./Campagne');
    const campagnesResponse = await getCampagnes();
    
    // Créer un mapping ID_CONTACT -> Nom de campagne
    const campagneMap = {};
    if (campagnesResponse.data && campagnesResponse.data.campagnes) {
      campagnesResponse.data.campagnes.forEach(campagne => {
        campagneMap[campagne.ID_CONTACT] = campagne.nom;
      });
    }
    
    // Mettre à jour les contacts avec les noms des campagnes
    const contactsWithNames = contactsResponse.data.contacts.map(contact => ({
      ...contact,
      campagne: campagneMap[contact.campagne] || contact.campagne || ''
    }));
    
    return {
      data: {
        ...contactsResponse.data,
        contacts: contactsWithNames
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts avec noms de campagnes:', error);
    throw error;
  }
};

export const getContactsByCampagne = async (campagneId) => {
  try {
    const airtableParams = {
      filterByFormula: `{Campagne} = "${campagneId}"`
    };

    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
      params: airtableParams
    });

    const transformedRecords = response.data.records.map(record => ({
      ID_CONTACT: record.ID_CONTACT,
      nom: record.fields['Nom'] || '',
      email: record.fields['Email'] || '',
      statut: record.fields['Statut'] || 'Non contacté',
      profil: record.fields['Profil'] || 'En attente',
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts par campagne:', error);
    throw error;
  }
};

// Récupérer les statistiques des contacts
export const getContactsStats = async () => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`);
    const contacts = response.data.records;

    const stats = {
      total: contacts.length,
      nonContacte: 0,
      messageEnvoye: 0,
      reponseRecue: 0,
      interesse: 0,
      nonInteresse: 0,
      aRelancer: 0,
      // Nouveaux stats pour les profils
      profilsGardes: 0,
      profilsRejetes: 0,
      profilsEnAttente: 0
    };

    contacts.forEach(contact => {
      const statut = contact.fields['Statut'] || 'Non contacté';
      const profil = contact.fields['Profil'] || 'En attente';
      
      // Stats par statut
      switch (statut) {
        case 'Non contacté':
          stats.nonContacte++;
          break;
        case 'Message envoyé':
          stats.messageEnvoye++;
          break;
        case 'Réponse reçue':
          stats.reponseRecue++;
          break;
        case 'Intéressé':
          stats.interesse++;
          break;
        case 'Non intéressé':
          stats.nonInteresse++;
          break;
        case 'À relancer':
          stats.aRelancer++;
          break;
      }

      // Stats par profil
      switch (profil) {
        case 'GARDE':
          stats.profilsGardes++;
          break;
        case 'REJETE':
          stats.profilsRejetes++;
          break;
        case 'En attente':
        default:
          stats.profilsEnAttente++;
          break;
      }
    });

    return {
      data: stats
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Fonction utilitaire pour mapper les noms de champs
const mapFieldName = (fieldName) => {
  const fieldMapping = {
    'nom': 'Nom',
    'localisation': 'Localisation',
    'posteActuel': 'Poste actuel',
    'entrepriseActuelle': 'Entreprise actuelle',
    'url': 'URL',
    'statut': 'Statut',
    'campagne': 'Nom de la campagne (from Campagne)',
    'secteurs': 'Secteurs',
    'email': 'Email',
    'telephone': 'Téléphone',
    'dateMessage': 'Date du message',
    'dateReponse': 'Date de réponse',
    'connection': 'connection',
    'notes': 'Notes',
    'ID_CONTACT': 'ID_CONTACT',
    'image': 'profilImage',
    'profil': 'Profil'
  };
  
  return fieldMapping[fieldName] || null;
};

// Fonction utilitaire pour récupérer tous les contacts (sans pagination)
export const getAllContacts = async () => {
  try {
    let allRecords = [];
    let offset = '';

    do {
      const params = {
        pageSize: 100, // Maximum pour Airtable
        fields: [
          'ID_CONTACT',
          'Nom',
          'Localisation',
          'Poste actuel',
          'Entreprise actuelle',
          'URL',
          'Statut',
          'Campagne',
          'Notes',
          'Secteurs',
          'Parcours',
          'ParcoursEducation',
          'Message Personnalisé',
          'connection',
          'Email',
          'Téléphone',
          'Date du message',
          'Réponse reçue',
          'Date de réponse',
          'profilImage',
          'Profil'
        ],
        ...(offset && { offset })
      };

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, { params });
      
      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    console.log(allRecords);
    
    const transformedRecords = allRecords.map(record => ({
      ID_CONTACT: record.ID_CONTACT,
      nom: record.fields['Nom'] || '',
      image: record.fields['profilImage'] || '',
      localisation: record.fields['Localisation'] || '',
      posteActuel: record.fields['Poste actuel'] || '',
      entrepriseActuelle: record.fields['Entreprise actuelle'] || '',
      url: record.fields['URL'] || '',
      statut: record.fields['Statut'] || 'Non contacté',
      campagne: record.fields['Campagne'] || '',
      secteurs: record.fields['Secteurs'] || '',
      parcours: record.fields['Parcours'] || '',
      parcoursEducation: record.fields['ParcoursEducation'] || '',
      messagePersonnalise: record.fields['Message Personnalisé'] || '',
      connection: record.fields['Connection'] || '',
      email: record.fields['Email'] || '',
      telephone: record.fields['Téléphone'] || '',
      dateMessage: record.fields['Date du message'] || '',
      reponseRecue: record.fields['Réponse reçue'] || '',
      dateReponse: record.fields['Date de réponse'] || '',
      notes: record.fields['Notes'] || '',
      profil: record.fields['Profil'] || 'En attente'
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les contacts:', error);
    throw error;
  }
};

// Fonction pour créer plusieurs contacts en une fois (batch)
export const createMultipleContacts = async (contactsData) => {
  try {
    const records = contactsData.map(contact => ({
      fields: contact
    }));

    // Airtable limite à 10 enregistrements par requête pour les créations multiples
    const batches = [];
    for (let i = 0; i < records.length; i += 10) {
      batches.push(records.slice(i, i + 10));
    }

    const results = [];
    for (const batch of batches) {
      const response = await airtableClient.post(`/${AIRTABLE_TABLE_NAME}`, {
        records: batch
      });
      results.push(...response.data.records);
    }

    return {
      success: true,
      message: `${results.length} contacts créés avec succès`,
      data: results
    };
  } catch (error) {
    console.error('Erreur lors de la création multiple de contacts:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la création multiple de contacts'
        }
      }
    };
  }
};

// Récupérer tous les contacts d'une campagne spécifique
export const getContactsByCampaignId = async (campaignId, params = {}) => {
  try {
    // Étape 1 — Récupérer la campagne pour obtenir l'ID ou autres infos
    const campaignResponse = await airtableClient.get(`/${AIRTABLE_CAMPAIGNS_TABLE}/${campaignId}`);
    const campaignRecord = campaignResponse.data;

    // Si le champ qui contient l'ID recherché s'appelle "ID", on le prend ici
    const campaignRecordId = campaignRecord.fields.ID; 
    console.log(campaignRecordId)

    const {
      search = '',
      statusFilter = '',
      profileFilter = '',
      sortBy = 'nom',
      sortOrder = 'ASC'
    } = params;

    // Construire les filtres Airtable
    let filters = [];

    // Filtre principal par campagne (avec l'ID récupéré)
    filters.push(`FIND("${campaignRecordId}", ARRAYJOIN({Campagne}))`);

    // Filtre de recherche
    if (search) {
      filters.push(`OR(
        SEARCH(LOWER("${search}"), LOWER({Nom})),
        SEARCH(LOWER("${search}"), LOWER({Email })),
        SEARCH(LOWER("${search}"), LOWER({Entreprise actuelle})),
        SEARCH(LOWER("${search}"), LOWER({Poste actuel}))
      )`);
    }

    // Filtre par statut
    if (statusFilter) {
      filters.push(`{Statut} = "${statusFilter}"`);
    }

    // Filtre par profil
    if (profileFilter) {
      filters.push(`{Profil} = "${profileFilter}"`);
    }

    let airtableParams = {
      pageSize: 100,
      fields: [
        'ID_CONTACT',
        'Nom',
        'Localisation',
        'Poste actuel',
        'Entreprise actuelle',
        'URL',
        'Statut',
        'Campagne',
        'Notes',
        'Secteurs',
        'Parcours',
        'ParcoursEducation',
        'Message Personnalisé',
        'connection',
        'Email',
        'Téléphone',
        'Date du message',
        'Réponse reçue',
        'Date de réponse',
        'profilImage',
        'Profil'
      ],
      filterByFormula: filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`
    };

    // Tri
    if (sortBy && mapFieldName(sortBy)) {
      const direction = sortOrder === 'DESC' ? 'desc' : 'asc';
      airtableParams.sort = [{ field: mapFieldName(sortBy), direction }];
    }

    // Récupérer tous les enregistrements
    let allRecords = [];
    let offset = '';

    do {
      if (offset) {
        airtableParams.offset = offset;
      }

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams
      });

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
      delete airtableParams.offset;
    } while (offset);

    // Transformation
    const transformedRecords = allRecords.map(record => ({
      id: record.id,
      ID_CONTACT: record.fields['ID_CONTACT'] || record.id,
      image: record.fields['profilImage'] || '',
      nom: record.fields['Nom'] || '',
      localisation: record.fields['Localisation'] || '',
      posteActuel: record.fields['Poste actuel'] || '',
      entrepriseActuelle: record.fields['Entreprise actuelle'] || '',
      url: record.fields['URL'] || '',
      statut: record.fields['Statut'] || 'Non contacté',
      campagneId: record.fields['Campagne'] || '',
      secteurs: record.fields['Secteurs'] || '',
      parcours: record.fields['Parcours'] || '',
      parcoursEducation: record.fields['ParcoursEducation'] || '',
      messagePersonnalise: record.fields['Message Personnalisé'] || '',
      connection: record.fields['connection'] || '',
      email: record.fields['Email'] || '',
      telephone: record.fields['Téléphone'] || '',
      dateMessage: record.fields['Date du message'] || '',
      reponseRecue: record.fields['Réponse reçue'] || '',
      dateReponse: record.fields['Date de réponse'] || '',
      notes: record.fields['Notes'] || '',
      dateCreation: record.createdTime || '',
      profil: record.fields['Profil'] || 'En attente'
    }));

    console.log(transformedRecords);

    return {
      data: transformedRecords,
      totalItems: transformedRecords.length
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts par campagne:', error);
    throw error;
  }
};