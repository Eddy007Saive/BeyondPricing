import axios from "axios";

// Configuration Airtable
const AIRTABLE_BASE_ID =import.meta.env.VITE_APP_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Table_Scoring_Journalier'
const AIRTABLE_API_KEY =
  import.meta.env.VITE_APP_AIRTABLE_API_KEY || "your_api_key";

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Créer un nouvel enregistrement
export const createScoring = async (scoringData) => {
  try {
    const response = await airtableClient.post(`/${AIRTABLE_TABLE_NAME}`, {
      fields: scoringData,
    });

    return {
      success: true,
      message: "Enregistrement créé avec succès",
      data: response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    throw {
      response: {
        data: {
          errors:
            error.response?.data?.error?.message ||
            "Erreur lors de la création de l'enregistrement",
        },
      },
    };
  }
};

// Fonction de tri côté client
const sortRecords = (records, sortBy, sortOrder) => {
  if (!sortBy) return records;

  return records.sort((a, b) => {
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
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // Conversion en string pour autres types
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortOrder === "DESC" ? -comparison : comparison;
  });
};

// Fonction de recherche côté client
const filterRecords = (records, search) => {
  if (!search) return records;

  const searchLower = search.toLowerCase();
  return records.filter((record) => {
    const searchFields = [
      record.fields["Id_logement"],
      record.fields["ID Beds24 (from Id_logement)"],
      record.fields["Justification"],
      record.fields["action"],
      record.fields["strategie"]
    ];

    return searchFields.some((field) => 
      field && String(field).toLowerCase().includes(searchLower)
    );
  });
};

// Récupérer avec pagination / recherche / tri (gère +100 enregistrements)
export const getScorings = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "Date",
      sortOrder = "ASC",
    } = params;

    let allRecords = [];
    let offset = "";

    // Récupérer TOUS les enregistrements sans tri côté serveur
    do {
      let airtableParams = {
        pageSize: 100,
        ...(offset && { offset }),
      };

      // On enlève le tri et la recherche côté serveur pour éviter l'erreur PRO
      // Le tri et la recherche se feront côté client

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams,
      });

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    // Appliquer la recherche côté client
    let filteredRecords = filterRecords(allRecords, search);

    // Appliquer le tri côté client
    let sortedRecords = sortRecords(filteredRecords, sortBy, sortOrder);

    // Pagination côté client
    const totalItems = sortedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = sortedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      date: record.fields["Date"] || "",
      prixMarche: record.fields["Prix moyen marché"] || 0,
      tension: record.fields["Tension marché"] || "",
      meteo: record.fields["Météo"] || "",
      tauxOccupation: record.fields["Taux occupation marché"] || "",
      evenement: record.fields["Événement"] || "",
      tarifIA: record.fields["Tarif IA recommandé"] || 0,
      promoIA: record.fields["Promo IA"] || "",
      idLogement: record.fields["Id_logement"] || "",
      minPrice: record.fields["MinPrice"] || 0,
      idBeds24: record.fields["ID Beds24 (from Id_logement)"] || "",
      justification: record.fields["Justification"] || "",
      weekEnd: record.fields["week_end"] || "",
      facteursRisque: record.fields["facteurs_risque"] || "",
      action: record.fields["action"] || "",
      joursFerie: record.fields["Jours_ferie"] || "",
      impactMeteo: record.fields["impact_météo"] || "",
      confiance: record.fields["confiance"] || "",
      strategie: record.fields["strategie"] || "",
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        scorings: transformedRecords,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    throw error;
  }
};

// Version optimisée pour les grosses bases de données
export const getScoringsOptimized = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "Date",
      sortOrder = "ASC",
    } = params;

    let allRecords = [];
    let offset = "";
    
    // Limiter le nombre d'enregistrements récupérés si on a une recherche
    const maxRecords = search ? 1000 : limit * 10; // Récupérer plus si recherche

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
      processedRecords = filterRecords(processedRecords, search);
    }
    
    if (sortBy) {
      processedRecords = sortRecords(processedRecords, sortBy, sortOrder);
    }

    // Pagination
    const totalItems = processedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = processedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      date: record.fields["Date"] || "",
      prixMarche: record.fields["Prix moyen marché"] || 0,
      tension: record.fields["Tension marché"] || "",
      meteo: record.fields["Météo"] || "",
      tauxOccupation: record.fields["Taux occupation marché"] || "",
      evenement: record.fields["Événement"] || "",
      tarifIA: record.fields["Tarif IA recommandé"] || 0,
      promoIA: record.fields["Promo IA"] || "",
      idLogement: record.fields["Id_logement"] || "",
      minPrice: record.fields["MinPrice"] || 0,
      idBeds24: record.fields["ID Beds24 (from Id_logement)"] || "",
      justification: record.fields["Justification"] || "",
      weekEnd: record.fields["week_end"] || "",
      facteursRisque: record.fields["facteurs_risque"] || "",
      action: record.fields["action"] || "",
      joursFerie: record.fields["Jours_ferie"] || "",
      impactMeteo: record.fields["impact_météo"] || "",
      confiance: record.fields["confiance"] || "",
      strategie: record.fields["strategie"] || "",
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        scorings: transformedRecords,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération optimisée :", error);
    throw error;
  }
};

// Récupérer par ID
export const getScoringById = async (id) => {
  try {
    const response = await airtableClient.get(
      `/${AIRTABLE_TABLE_NAME}/${id}`
    );

    const record = response.data;
    return {
      data: {
        id: record.id,
        date: record.fields["Date"] || "",
        prixMarche: record.fields["Prix moyen marché"] || 0,
        tension: record.fields["Tension marché"] || "",
        meteo: record.fields["Météo"] || "",
        tauxOccupation: record.fields["Taux occupation marché"] || "",
        evenement: record.fields["Événement"] || "",
        tarifIA: record.fields["Tarif IA recommandé"] || 0,
        promoIA: record.fields["Promo IA"] || "",
        idLogement: record.fields["Id_logement"] || "",
        minPrice: record.fields["MinPrice"] || 0,
        idBeds24: record.fields["ID Beds24 (from Id_logement)"] || "",
        justification: record.fields["Justification"] || "",
        weekEnd: record.fields["week_end"] || "",
        facteursRisque: record.fields["facteurs_risque"] || "",
        action: record.fields["action"] || "",
        joursFerie: record.fields["Jours_ferie"] || "",
        impactMeteo: record.fields["impact_météo"] || "",
        confiance: record.fields["confiance"] || "",
        strategie: record.fields["strategie"] || "",
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération par ID :", error);
    throw error;
  }
};

// Mettre à jour
export const updateScoring = async (id, scoringData) => {
  try {
    const response = await airtableClient.patch(
      `/${AIRTABLE_TABLE_NAME}/${id}`,
      {
        fields: scoringData,
      }
    );

    return {
      success: true,
      message: "Enregistrement mis à jour avec succès",
      data: response.data,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    throw {
      response: {
        data: {
          errors:
            error.response?.data?.error?.message ||
            "Erreur lors de la mise à jour",
        },
      },
    };
  }
};

// Supprimer
export const deleteScoring = async (id) => {
  try {
    await airtableClient.delete(`/${AIRTABLE_TABLE_NAME}/${id}`);

    return {
      success: true,
      message: "Enregistrement supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    throw {
      response: {
        data: {
          errors:
            error.response?.data?.error?.message ||
            "Erreur lors de la suppression",
        },
      },
    };
  }
};

// Mapping pour les tris
const mapFieldName = (fieldName) => {
  const fieldMapping = {
    date: "Date",
    prixMarche: "Prix moyen marché",
    tension: "Tension marché",
    meteo: "Météo",
    tauxOccupation: "Taux occupation marché",
    evenement: "Événement",
    tarifIA: "Tarif IA recommandé",
    promoIA: "Promo IA",
    idLogement: "Id_logement",
    minPrice: "MinPrice",
    idBeds24: "ID Beds24 (from Id_logement)",
    justification: "Justification",
    weekEnd: "week_end",
    facteursRisque: "facteurs_risque",
    action: "action",
    joursFerie: "Jours_ferie",
    impactMeteo: "impact_météo",
    confiance: "confiance",
    strategie: "strategie",
  };

  return fieldMapping[fieldName] || fieldName;
};

// Ajouter cette fonction dans le service scoring.js

export const getScoringsByLogement = async (logementId, params = {}) => {
  try {
    const {
      search = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'Date',
      sortOrder = 'ASC'
    } = params;

    // Construire les filtres Airtable
    let filters = [];

    // Filtre principal par logement (recherche dans les deux champs possibles)
    filters.push(`OR(
      {Id_logement} = "${logementId}",
      FIND("${logementId}", ARRAYJOIN({ID Beds24 (from Id_logement)}))
    )`);

    // Filtre par recherche générale
    if (search) {
      filters.push(`OR(
        SEARCH(LOWER("${search}"), LOWER({Justification})),
        SEARCH(LOWER("${search}"), LOWER({strategie})),
        SEARCH(LOWER("${search}"), LOWER({action})),
        SEARCH(LOWER("${search}"), LOWER({Tension marché}))
      )`);
    }

    // Filtre par plage de dates
    if (dateFrom) {
      filters.push(`{Date} >= "${dateFrom}"`);
    }
    if (dateTo) {
      filters.push(`{Date} <= "${dateTo}"`);
    }

    let airtableParams = {
      pageSize: 100,
      view: "TriePardate",
      fields: [
        'Date',
        'Prix moyen marché',
        'Tension marché',
        'Météo',
        'Taux occupation marché',
        'Événement',
        'Tarif IA recommandé',
        'Promo IA',
        'Id_logement',
        'MinPrice',
        'ID Beds24 (from Id_logement)',
        'Justification',
        'week_end',
        'facteurs_risque',
        'action',
        'Jours_ferie',
        'impact_météo',
        'confiance',
        'strategie'
      ],
      filterByFormula: filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`
    };

    // Tri
    if (sortBy && mapFieldName(sortBy)) {
      const direction = sortOrder === 'DESC' ? 'desc' : 'asc';
      airtableParams.sort = [{ field: mapFieldName(sortBy), direction }];
    }

    // Récupérer tous les enregistrements avec pagination
    let allRecords = [];
    let offset = '';

    do {
      if (offset) {
        airtableParams.offset = offset;
      }

      console.log('Fetching with params:', airtableParams);
      

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams
      });
      console.log("data",response.data);
      

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
      delete airtableParams.offset;
    } while (offset);

    // Transformation des données
    const transformedRecords = allRecords.map((record) => ({
      id: record.id,
      date: record.fields["Date"] || "",
      prixMarche: record.fields["Prix moyen marché"] || 0,
      tension: record.fields["Tension marché"] || "",
      meteo: record.fields["Météo"] || "",
      tauxOccupation: record.fields["Taux occupation marché"] || "",
      evenement: record.fields["Événement"] || "",
      tarifIA: record.fields["Tarif IA recommandé"] || 0,
      promoIA: record.fields["Promo IA"] || "",
      idLogement: record.fields["Id_logement"] || "",
      minPrice: record.fields["MinPrice"] || 0,
      idBeds24: record.fields["ID Beds24 (from Id_logement)"] || "",
      justification: record.fields["Justification"] || "",
      weekEnd: record.fields["week_end"] || "",
      facteursRisque: record.fields["facteurs_risque"] || "",
      action: record.fields["action"] || "",
      joursFerie: record.fields["Jours_ferie"] || "",
      impactMeteo: record.fields["impact_météo"] || "",
      confiance: record.fields["confiance"] || "",
      strategie: record.fields["strategie"] || "",
    }));

    console.log(`Scorings trouvés pour le logement ${logementId}:`, transformedRecords.length);

    return {
      data: {
        scorings: transformedRecords,
        totalItems: transformedRecords.length,
        logementId: logementId
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des scorings par logement:', error);
    throw error;
  }
};

// Version encore plus optimisée avec cache
let scoringCache = new Map();

export const getScoringsByLogementCached = async (logementId, params = {}) => {
  const cacheKey = `${logementId}-${JSON.stringify(params)}`;
  
  // Vérifier le cache (valide pendant 5 minutes)
  if (scoringCache.has(cacheKey)) {
    const cached = scoringCache.get(cacheKey);
    const now = new Date().getTime();
    if (now - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
      console.log('Données récupérées depuis le cache');
      return cached.data;
    }
  }

  // Récupérer les données
  const result = await getScoringsByLogement(logementId, params);
  
  // Mettre en cache
  scoringCache.set(cacheKey, {
    data: result,
    timestamp: new Date().getTime()
  });

  return result;
};

// Fonction pour nettoyer le cache
export const clearScoringCache = () => {
  scoringCache.clear();
};