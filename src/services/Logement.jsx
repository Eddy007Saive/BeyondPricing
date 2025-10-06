import axios from "axios";

// Configuration Airtable
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Table_Logements'; 
const AIRTABLE_API_KEY =
  import.meta.env.VITE_APP_AIRTABLE_API_KEY || "your_api_key";

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Créer un nouveau logement
export const createLogement = async (logementData) => {
  try {
    const response = await airtableClient.post(`/${AIRTABLE_TABLE_NAME}`, {
      fields: logementData,
    });

    return {
      success: true,
      message: "Logement créé avec succès",
      data: response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la création du logement :", error);
    throw {
      response: {
        data: {
          errors:
            error.response?.data?.error?.message ||
            "Erreur lors de la création du logement",
        },
      },
    };
  }
};

// Fonction de tri côté client
const sortLogements = (logements, sortBy, sortOrder) => {
  if (!sortBy) return logements;

  return logements.sort((a, b) => {
    const aValue = a.fields[mapFieldName(sortBy)];
    const bValue = b.fields[mapFieldName(sortBy)];

    // Gestion des valeurs nulles/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Comparaison selon le type
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Conversion en string pour autres types
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortOrder === "DESC" ? -comparison : comparison;
  });
};

// Fonction de recherche côté client
const filterLogements = (logements, search) => {
  if (!search) return logements;

  const searchLower = search.toLowerCase();
  return logements.filter((logement) => {
    const searchFields = [
      logement.fields["Nom"],
      logement.fields["Ville"],
      logement.fields["Typologie"],
      logement.fields["country"],
      logement.fields["state"],
      logement.fields["Adresse"],
      logement.fields["roomType"]
    ];

    return searchFields.some((field) => 
      field && String(field).toLowerCase().includes(searchLower)
    );
  });
};

// Récupérer avec pagination / recherche / tri
export const getLogements = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "Nom",
      sortOrder = "ASC",
    } = params;

    let allRecords = [];
    let offset = "";

    // Récupérer TOUS les enregistrements
    do {
      let airtableParams = {
        pageSize: 100,
        ...(offset && { offset }),
      };

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams,
      });

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    // Appliquer la recherche côté client
    let filteredRecords = filterLogements(allRecords, search);

    // Appliquer le tri côté client
    let sortedRecords = sortLogements(filteredRecords, sortBy, sortOrder);

    // Pagination côté client
    const totalItems = sortedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = sortedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      idBeds24: record.fields["ID Beds24"] || "",
      nom: record.fields["Nom"] || "",
      ville: record.fields["Ville"] || "",
      typologie: record.fields["Typologie"] || "",
      latitude: record.fields["Latitude"] || 0,
      longitude: record.fields["Logitude"] || 0,
      adresse: record.fields["Adresse"] || "",
      capacite: record.fields["Capacité"] || 0,
      country: record.fields["country"] || "",
      state: record.fields["state"] || "",
      nbrLit: record.fields["Nbr_lit"] || 0,
      tableScoringJournalier: record.fields["Logs_calcul"] || "",
      roomType: record.fields["roomType"] || "",
      nbrChambre: record.fields["Nbr_chambre"] || 0,
      minStay: record.fields["minStay"] || 0,
      maxStay: record.fields["maxStay"] || 0,
      minPrice: record.fields["MinPrice"] || 0,
      analyser: record.fields["analyser"] || "",
      scrape: record.fields["Scrape"] || "En attente",
      predit: record.fields["predit"] || "Non",
      maxPrice:record.fields["MaxPrice"] || 0,
      offset:record.fields["Offset"] * 100  || 0,
      basePrice:record.fields["BasePrice"]|| 0,
      famille:record.fields["Famille"],
      etat:record.fields["Etat"] || false,


    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        logements: transformedRecords,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des logements :", error);
    throw error;
  }
};

// Version optimisée pour les grosses bases de données
export const getLogementsOptimized = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "Nom",
      sortOrder = "ASC",
    } = params;

    let allRecords = [];
    let offset = "";
    
    // Limiter le nombre d'enregistrements récupérés si on a une recherche
    const maxRecords = search ? 1000 : limit * 10;

    do {
      let airtableParams = {
        pageSize: 100,
        ...(offset && { offset }),
      };

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams,
      });

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset && allRecords.length < maxRecords);

    // Traitement côté client
    let processedRecords = allRecords;
    
    if (search) {
      processedRecords = filterLogements(processedRecords, search);
    }
    
    if (sortBy) {
      processedRecords = sortLogements(processedRecords, sortBy, sortOrder);
    }

    // Pagination
    const totalItems = processedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = processedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      idBeds24: record.fields["ID Beds24"] || "",
      nom: record.fields["Nom"] || "",
      ville: record.fields["Ville"] || "",
      typologie: record.fields["Typologie"] || "",
      latitude: record.fields["Latitude"] || 0,
      longitude: record.fields["Logitude"] || 0,
      adresse: record.fields["Adresse"] || "",
      capacite: record.fields["Capacité"] || 0,
      country: record.fields["country"] || "",
      state: record.fields["state"] || "",
      nbrLit: record.fields["Nbr_lit"] || 0,
      tableScoringJournalier: record.fields["Table_Scoring_Journalier"] || "",
      roomType: record.fields["roomType"] || "",
      nbrChambre: record.fields["Nbr_chambre"] || 0,
      minStay: record.fields["minStay"] || 0,
      maxStay: record.fields["maxStay"] || 0,
      minPrice: record.fields["MinPrice"] || 0,
      offset: record.fields["Offset"] || 0,
      analyser: record.fields["analyser"] || "",
      scrape: record.fields["Scrape"] || "En attente",
      predit: record.fields["predit"] || "Non",
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        logements: transformedRecords,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération optimisée des logements :", error);
    throw error;
  }
};

// Récupérer par ID
export const getLogementById = async (id) => {
  try {
    const response = await airtableClient.get(
      `/${AIRTABLE_TABLE_NAME}/${id}`
    );

    const record = response.data;
    return {
      data: {
        id: record.id,
        idBeds24: record.fields["ID Beds24"] || "",
        nom: record.fields["Nom"] || "",
        ville: record.fields["Ville"] || "",
        typologie: record.fields["Typologie"] || "",
        latitude: record.fields["Latitude"] || 0,
        longitude: record.fields["Logitude"] || 0,
        adresse: record.fields["Adresse"] || "",
        capacite: record.fields["Capacité"] || 0,
        country: record.fields["country"] || "",
        state: record.fields["state"] || "",
        nbrLit: record.fields["Nbr_lit"] || 0,
        tableScoringJournalier: record.fields["Table_Scoring_Journalier"] || "",
        roomType: record.fields["roomType"] || "",
        nbrChambre: record.fields["Nbr_chambre"] || 0,
        minStay: record.fields["minStay"] || 0,
        maxStay: record.fields["maxStay"] || 0,
        minPrice: record.fields["MinPrice"] || 0,
        offset: record.fields["Offset"] || 0,
        analyser: record.fields["analyser"] || "",
        scrape: record.fields["Scrape"] || "En attente",
        predit: record.fields["predit"] || "Non",
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du logement par ID :", error);
    throw error;
  }
};

// Mettre à jour un logement
export const updateLogement = async (id, logementData) => {
  try {
    const response = await airtableClient.patch(
      `/${AIRTABLE_TABLE_NAME}/${id}`,
      {
        fields: logementData,
      }
    );

    return {
      success: true,
      message: "Logement mis à jour avec succès",
      data: response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du logement :", error);
    throw {
      response: {
        data: {
          errors:
            error.response?.data?.error?.message ||
            "Erreur lors de la mise à jour du logement",
        },
      },
    };
  }
};

// Supprimer un logement
export const deleteLogement = async (id) => {
  try {
    await airtableClient.delete(`/${AIRTABLE_TABLE_NAME}/${id}`);

    return {
      success: true,
      message: "Logement supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du logement :", error);
    throw {
      response: {
        data: {
          errors:
            error.response?.data?.error?.message ||
            "Erreur lors de la suppression du logement",
        },
      },
    };
  }
};

// Récupérer les logements par ville
export const getLogementsByVille = async (ville) => {
  try {
    const response = await getLogements({ search: ville });
    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération par ville :", error);
    throw error;
  }
};

// Récupérer les logements par pays
export const getLogementsByCountry = async (country) => {
  try {
    const response = await getLogements({ search: country });
    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération par pays :", error);
    throw error;
  }
};

// Récupérer les logements par typologie
export const getLogementsByTypologie = async (typologie) => {
  try {
    const response = await getLogements({ search: typologie });
    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération par typologie :", error);
    throw error;
  }
};

// Récupérer les logements qui ont été scrapés
export const getLogementsScraped = async (params = {}) => {
  try {
    const response = await getLogements(params);
    
    // Filtrer pour ne garder que les logements scrapés (Fait)
    const scrapedLogements = response.data.logements.filter(
      logement => logement.scrape === "Fait"
    );

    return {
      data: {
        ...response.data,
        logements: scrapedLogements,
        totalItems: scrapedLogements.length,
        totalPages: Math.ceil(scrapedLogements.length / (params.limit || 100))
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des logements scrapés :", error);
    throw error;
  }
};

// Récupérer les logements avec prédiction activée
export const getLogementsWithPrediction = async (params = {}) => {
  try {
    const response = await getLogements(params);
    
    // Filtrer pour ne garder que les logements avec prédiction (Oui)
    const predictedLogements = response.data.logements.filter(
      logement => logement.predit === "Oui"
    );

    return {
      data: {
        ...response.data,
        logements: predictedLogements,
        totalItems: predictedLogements.length,
        totalPages: Math.ceil(predictedLogements.length / (params.limit || 100))
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des logements avec prédiction :", error);
    throw error;
  }
};

// Récupérer les logements par ID Beds24
export const getLogementByBeds24Id = async (idBeds24) => {
  try {
    const response = await getLogements({ search: idBeds24.toString() });
    
    // Trouver le logement exact par ID Beds24
    const logement = response.data.logements.find(
      l => l.idBeds24.toString() === idBeds24.toString()
    );

    if (!logement) {
      throw new Error(`Logement avec ID Beds24 ${idBeds24} introuvable`);
    }

    return { data: logement };
  } catch (error) {
    console.error("Erreur lors de la récupération par ID Beds24 :", error);
    throw error;
  }
};

// Mapping pour les tris
const mapFieldName = (fieldName) => {
  const fieldMapping = {
    idBeds24: "ID Beds24",
    nom: "Nom",
    ville: "Ville",
    typologie: "Typologie",
    latitude: "Latitude",
    longitude: "Logitude",
    adresse: "Adresse",
    capacite: "Capacité",
    country: "country",
    state: "state",
    nbrLit: "Nbr_lit",
    tableScoringJournalier: "Table_Scoring_Journalier",
    roomType: "roomType",
    nbrChambre: "Nbr_chambre",
    minStay: "minStay",
    maxStay: "maxStay",
    minPrice: "MinPrice",
    offset: "Offset",
    analyser: "analyser",
    scrape: "Scrape",
    predit: "predit",
  };

  return fieldMapping[fieldName] || fieldName;
};

// Récupérer les logements par statut
export const getLogementsByStatus = async (status, params = {}) => {
  try {
    // Récupérer tous les logements avec les params de base
    const response = await getLogements(params);
    
    if (status === 'all') {
      return response;
    }

    // Filtrer selon le statut
    const filteredLogements = response.data.logements.filter((logement) => {
      switch (status) {
        case 'actif':
          return logement.etat === true;
        case 'inactif':
          return logement.etat === false;
        case 'optimized':
          return logement.scrape === 'Fait' && logement.predit === 'Oui';
        case 'analyzed':
          return logement.scrape === 'Fait' && logement.predit === 'Non';
        case 'pending':
          return logement.scrape === 'En attente';
        default:
          return true;
      }
    });

    return {
      data: {
        ...response.data,
        logements: filteredLogements,
        totalItems: filteredLogements.length,
        totalPages: Math.ceil(filteredLogements.length / (params.limit || 100))
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des logements par statut :", error);
    throw error;
  }
};

// Récupérer les logements depuis une vue Airtable spécifique
export const getLogementsByView = async (viewName, params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "",
      sortOrder = "ASC",
    } = params;

    let allRecords = [];
    let offset = "";

    // Récupérer tous les enregistrements depuis la vue
    do {
      let airtableParams = {
        pageSize: 100,
        view: viewName, // Nom de la vue Airtable
        ...(offset && { offset }),
      };

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams,
      });

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    // Appliquer la recherche côté client si nécessaire
    let filteredRecords = search ? filterLogements(allRecords, search) : allRecords;

    // Appliquer le tri côté client si nécessaire
    let sortedRecords = sortBy ? sortLogements(filteredRecords, sortBy, sortOrder) : filteredRecords;

    // Pagination côté client
    const totalItems = sortedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = sortedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      idBeds24: record.fields["ID Beds24"] || "",
      nom: record.fields["Nom"] || "",
      ville: record.fields["Ville"] || "",
      typologie: record.fields["Typologie"] || "",
      latitude: record.fields["Latitude"] || 0,
      longitude: record.fields["Logitude"] || 0,
      adresse: record.fields["Adresse"] || "",
      capacite: record.fields["Capacité"] || 0,
      country: record.fields["country"] || "",
      state: record.fields["state"] || "",
      nbrLit: record.fields["Nbr_lit"] || 0,
      tableScoringJournalier: record.fields["Logs_calcul"] || "",
      roomType: record.fields["roomType"] || "",
      nbrChambre: record.fields["Nbr_chambre"] || 0,
      minStay: record.fields["minStay"] || 0,
      maxStay: record.fields["maxStay"] || 0,
      minPrice: record.fields["MinPrice"] || 0,
      analyser: record.fields["analyser"] || "",
      scrape: record.fields["Scrape"] || "En attente",
      predit: record.fields["predit"] || "Non",
      maxPrice: record.fields["MaxPrice"] || 0,
      offset: record.fields["Offset"] * 100 || 0,
      basePrice: record.fields["BasePrice"] || 0,
      famille: record.fields["Famille"],
      etat: record.fields["Etat"] || false,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        logements: transformedRecords,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération depuis la vue ${viewName} :`, error);
    throw error;
  }
};