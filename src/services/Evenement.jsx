import axios from 'axios';

// Configuration Airtable pour les événements
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_APP_AIRTABLE_EVENEMENTS_TABLE_NAME || 'Jours_ferié';
const AIRTABLE_API_KEY = import.meta.env.VITE_APP_AIRTABLE_API_KEY || 'your_api_key';

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Mapping des noms de champs
const mapFieldName = (fieldName) => {
  const fieldMapping = {
    'id': 'ID',
    'nom_ferie': 'nom_férié',
    'date': 'date',
    'zone': 'Zone',
    'intensite': 'Intensité'
  };
  
  return fieldMapping[fieldName] || fieldName;
};

// Créer un nouvel événement
export const createEvenement = async (evenementData) => {
  try {
    const response = await airtableClient.post(`/${AIRTABLE_TABLE_NAME}`, {
      fields: {
        'nom_férié': evenementData.nom_ferie,
        'date': evenementData.date,
        'Zone': evenementData.zone,
        'Intensité': evenementData.intensite
      }
    });

    return {
      success: true,
      message: 'Événement créé avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la création de l\'événement'
        }
      }
    };
  }
};

// Récupérer tous les événements avec pagination et filtres
// Récupérer tous les événements avec pagination et filtres
export const getEvenements = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,  // Changé de 100 à 10 pour la pagination
      search = '',
      sortBy = 'date',
      sortOrder = 'ASC'
    } = params;

    let airtableParams = {
      pageSize: 100,  // Récupère 100 records par requête Airtable
    };

    // Tri
    if (sortBy) {
      const direction = sortOrder === 'DESC' ? 'desc' : 'asc';
      airtableParams.sort = [{ field: mapFieldName(sortBy), direction }];
    }

    // Recherche/Filtrage
    if (search) {
      airtableParams.filterByFormula = `OR(
        SEARCH(LOWER("${search}"), LOWER({nom_férié})),
        SEARCH(LOWER("${search}"), LOWER({Zone})),
        SEARCH(LOWER("${search}"), LOWER({Intensité}))
      )`;
    }

    // Récupérer TOUS les enregistrements avec pagination Airtable
    let allRecords = [];
    let airtableOffset = '';
    
    do {
      const tempParams = { ...airtableParams };
      if (airtableOffset) {
        tempParams.offset = airtableOffset;
      }
      
      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: tempParams
      });
      
      allRecords = [...allRecords, ...response.data.records];
      airtableOffset = response.data.offset;
    } while (airtableOffset);

    // Transformer les données
    const transformedRecords = allRecords.map(record => ({
      id: record.id,
      nom_ferie: record.fields['nom_férié'] || '',
      date: record.fields['date'] || '',
      zone: record.fields['Zone'] || '',
      intensite: record.fields['Intensité'] || ''
    }));

    // Calculer la pagination
    const totalItems = transformedRecords.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Découper les résultats pour la page demandée
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = transformedRecords.slice(startIndex, endIndex);

    return {
      data: {
        evenements: paginatedRecords,
        totalItems,
        totalPages,
        currentPage: page
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
};

// Récupérer un événement par ID
export const getEvenementById = async (id) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}/${id}`);
    
    const record = response.data;
    return {
      data: {
        id: record.id,
        nom_ferie: record.fields['nom_férié'] || '',
        date: record.fields['date'] || '',
        zone: record.fields['Zone'] || '',
        intensite: record.fields['Intensité'] || ''
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    throw error;
  }
};

// Mettre à jour un événement
export const updateEvenement = async (id, evenementData) => {
  try {
    const fields = {};
    
    if (evenementData.nom_ferie !== undefined) fields['nom_férié'] = evenementData.nom_ferie;
    if (evenementData.date !== undefined) fields['date'] = evenementData.date;
    if (evenementData.zone !== undefined) fields['Zone'] = evenementData.zone;
    if (evenementData.intensite !== undefined) fields['Intensité'] = evenementData.intensite;

    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${id}`, {
      fields
    });

    return {
      success: true,
      message: 'Événement mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour de l\'événement'
        }
      }
    };
  }
};

// Supprimer un événement
export const deleteEvenement = async (id) => {
  try {
    await airtableClient.delete(`/${AIRTABLE_TABLE_NAME}/${id}`);
    
    return {
      success: true,
      message: 'Événement supprimé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression de l\'événement'
        }
      }
    };
  }
};

// Récupérer tous les événements (sans pagination)
export const getAllEvenements = async () => {
  try {
    let allRecords = [];
    let offset = '';

    do {
      const params = {
        pageSize: 100,
        ...(offset && { offset })
      };

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, { params });
      
      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    const transformedRecords = allRecords.map(record => ({
      id: record.id,
      nom_ferie: record.fields['nom_férié'] || '',
      date: record.fields['date'] || '',
      zone: record.fields['Zone'] || '',
      intensite: record.fields['Intensité'] || ''
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les événements:', error);
    throw error;
  }
};

// Récupérer les événements par zone
export const getEvenementsByZone = async (zone) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
      params: {
        filterByFormula: `{Zone} = "${zone}"`
      }
    });

    const transformedRecords = response.data.records.map(record => ({
      id: record.id,
      nom_ferie: record.fields['nom_férié'] || '',
      date: record.fields['date'] || '',
      zone: record.fields['Zone'] || '',
      intensite: record.fields['Intensité'] || ''
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des événements par zone:', error);
    throw error;
  }
};

// Récupérer les événements par période
export const getEvenementsByPeriode = async (dateDebut, dateFin) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
      params: {
        filterByFormula: `AND(IS_AFTER({date}, "${dateDebut}"), IS_BEFORE({date}, "${dateFin}"))`
      }
    });

    const transformedRecords = response.data.records.map(record => ({
      id: record.id,
      nom_ferie: record.fields['nom_férié'] || '',
      date: record.fields['date'] || '',
      zone: record.fields['Zone'] || '',
      intensite: record.fields['Intensité'] || ''
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des événements par période:', error);
    throw error;
  }
};