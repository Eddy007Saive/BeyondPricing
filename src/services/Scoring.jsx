import axios from "axios";

// Configuration Airtable
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "Logs_calcul"; // <-- nom exact fourni
const AIRTABLE_API_KEY =
  import.meta.env.VITE_APP_AIRTABLE_API_KEY || "your_api_key";

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// ---------------------------
// Create
// ---------------------------
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

// ---------------------------
// Utilitaires : tri & filtre côté client
// ---------------------------
const mapFieldName = (fieldName) => {
  // map des clefs "logiques" vers les noms réels dans Logs_calcul
  const fieldMapping = {
    // clés usuelles utilisées dans le front / API
    date: "date",
    prixMarche: "prix_calcule",
    prixActuel: "prix_actuel",
    tension: "tension_marche",
    meteo: "meteo_score",
    tauxOccupation: "occupation_secteur",
    evenement: "intensite_evenement",
    tarifIA: "prix_applique",
    promoIA: "promo",
    idLogement: "Beds24",
    minPrice: "min_stay",
    idBeds24: "id_beds24",
    action: "action_push",
    weekEnd: "is_holydays",
    facteursRisque: "erreur",
    joursFerie: "is_ferier",
    impactMeteo: "meteo_score",
    confiance: "S_base",
    strategie: "M_details",
    run_id: "run_id",
    horodatage: "horodatage",
    Ville: "Ville",
    Famille: "Famille",
  };

  return fieldMapping[fieldName] || fieldName;
};

const sortRecords = (records, sortBy, sortOrder) => {
  if (!sortBy) return records;

  return records.sort((a, b) => {
    const field = mapFieldName(sortBy);
    const aValue = a.fields?.[field];
    const bValue = b.fields?.[field];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;

    // Gérer les dates (si le champ ressemble à une date ISO)
    const maybeDateA = typeof aValue === "string" && /^\d{4}-\d{2}-\d{2}/.test(aValue);
    const maybeDateB = typeof bValue === "string" && /^\d{4}-\d{2}-\d{2}/.test(bValue);

    if (maybeDateA && maybeDateB) {
      comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
    } else if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortOrder === "DESC" ? -comparison : comparison;
  });
};

const filterRecords = (records, search) => {
  if (!search) return records;

  const searchLower = search.toLowerCase();

  return records.filter((record) => {
    const f = record.fields || {};

    const searchFields = [
      f["Beds24"],
      f["id_beds24"],
      f["Famille"],
      f["Ville"],
      f["M_details"],
      f["action_push"],
      f["raison_skip"],
      f["erreur"],
    ];

    return searchFields.some((field) =>
      field && String(field).toLowerCase().includes(searchLower)
    );
  });
};

// ---------------------------
// getScorings : récupération complète + tri/recherche/pagination côté client
// ---------------------------
export const getScorings = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "date",
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

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams,
      });

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    // Recherche côté client
    let filteredRecords = filterRecords(allRecords, search);

    // Tri côté client
    let sortedRecords = sortRecords(filteredRecords, sortBy, sortOrder);

    // Pagination côté client
    const totalItems = sortedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = sortedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      run_id: record.fields["run_id"] ?? "",
      horodatage: record.fields["horodatage"] ?? "",
      date: record.fields["date"] ?? "",
      Beds24: record.fields["Beds24"] ?? "",
      id_beds24: record.fields["id_beds24"] ?? "",
      Famille: record.fields["Famille"] ?? "",
      Ville: record.fields["Ville"] ?? "",
      S_base: record.fields["S_base"] ?? "",
      M_details: record.fields["M_details"] ?? "",
      prix_actuel: record.fields["prix_actuel"] ?? 0,
      prix_calcule: record.fields["prix_calcule"] ?? 0,
      prix_applique: record.fields["prix_applique"] ?? 0,
      min_stay: record.fields["min_stay"] ?? 0,
      promo: record.fields["promo"] ?? "",
      action_push: record.fields["action_push"] ?? "",
      raison_skip: record.fields["raison_skip"] ?? "",
      occupation_secteur: record.fields["occupation_secteur"] ?? "",
      tension_marche: record.fields["tension_marche"] ?? "",
      intensite_evenement: record.fields["intensite_evenement"] ?? "",
      meteo_score: record.fields["meteo_score"] ?? "",
      erreur: record.fields["erreur"] ?? "",
      is_holydays: record.fields["is_holydays"] ?? "",
      is_ferier: record.fields["is_ferier"] ?? "",
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

// ---------------------------
// Version optimisée (limite en cas de recherche) pour grosses bases
// ---------------------------
export const getScoringsOptimized = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sortBy = "date",
      sortOrder = "ASC",
    } = params;

    let allRecords = [];
    let offset = "";

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

    let processedRecords = allRecords;

    if (search) {
      processedRecords = filterRecords(processedRecords, search);
    }

    if (sortBy) {
      processedRecords = sortRecords(processedRecords, sortBy, sortOrder);
    }

    const totalItems = processedRecords.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = processedRecords.slice(start, end);

    const transformedRecords = paginatedRecords.map((record) => ({
      id: record.id,
      run_id: record.fields["run_id"] ?? "",
      horodatage: record.fields["horodatage"] ?? "",
      date: record.fields["date"] ?? "",
      Beds24: record.fields["Beds24"] ?? "",
      id_beds24: record.fields["id_beds24"] ?? "",
      Famille: record.fields["Famille"] ?? "",
      Ville: record.fields["Ville"] ?? "",
      S_base: record.fields["S_base"] ?? "",
      M_details: record.fields["M_details"] ?? "",
      prix_actuel: record.fields["prix_actuel"] ?? 0,
      prix_calcule: record.fields["prix_calcule"] ?? 0,
      prix_applique: record.fields["prix_applique"] ?? 0,
      min_stay: record.fields["min_stay"] ?? 0,
      promo: record.fields["promo"] ?? "",
      action_push: record.fields["action_push"] ?? "",
      raison_skip: record.fields["raison_skip"] ?? "",
      occupation_secteur: record.fields["occupation_secteur"] ?? "",
      tension_marche: record.fields["tension_marche"] ?? "",
      intensite_evenement: record.fields["intensite_evenement"] ?? "",
      meteo_score: record.fields["meteo_score"] ?? "",
      erreur: record.fields["erreur"] ?? "",
      is_holydays: record.fields["is_holydays"] ?? "",
      is_ferier: record.fields["is_ferier"] ?? "",
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

// ---------------------------
// getById
// ---------------------------
export const getScoringById = async (id) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}/${id}`);

    const record = response.data;
    return {
      data: {
        id: record.id,
        run_id: record.fields["run_id"] ?? "",
        horodatage: record.fields["horodatage"] ?? "",
        date: record.fields["date"] ?? "",
        Beds24: record.fields["Beds24"] ?? "",
        id_beds24: record.fields["id_beds24"] ?? "",
        Famille: record.fields["Famille"] ?? "",
        Ville: record.fields["Ville"] ?? "",
        S_base: record.fields["S_base"] ?? "",
        M_details: record.fields["M_details"] ?? "",
        prix_actuel: record.fields["prix_actuel"] ?? 0,
        prix_calcule: record.fields["prix_calcule"] ?? 0,
        prix_applique: record.fields["prix_applique"] ?? 0,
        min_stay: record.fields["min_stay"] ?? 0,
        promo: record.fields["promo"] ?? "",
        action_push: record.fields["action_push"] ?? "",
        raison_skip: record.fields["raison_skip"] ?? "",
        occupation_secteur: record.fields["occupation_secteur"] ?? "",
        tension_marche: record.fields["tension_marche"] ?? "",
        intensite_evenement: record.fields["intensite_evenement"] ?? "",
        meteo_score: record.fields["meteo_score"] ?? "",
        erreur: record.fields["erreur"] ?? "",
        is_holydays: record.fields["is_holydays"] ?? "",
        is_ferier: record.fields["is_ferier"] ?? "",
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération par ID :", error);
    throw error;
  }
};

// ---------------------------
// update
// ---------------------------
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

// ---------------------------
// delete
// ---------------------------
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


export const getScoringsByLogement = async (logementId, params = {}) => {
  console.log(logementId);
  
  try {
    const {
      search = "",
      dateFrom = "",
      dateTo = "",
      sortBy = "date",
      sortOrder = "ASC",
    } = params;

    let filters = [];

    filters.push(`
      FIND("${logementId}", ARRAYJOIN({Beds24}))
    `);

    // Filtre recherche générale (champ 'recherche', action_push, M_details, raison_skip)
    if (search) {
      filters.push(
        `OR(
          SEARCH(LOWER("${search}"), LOWER({action_push})),
          SEARCH(LOWER("${search}"), LOWER({raison_skip}))
        )`
      );
    }

    // Filtre par dates
    if (dateFrom) {
      filters.push(`{date} >= "${dateFrom}"`);
    }
    if (dateTo) {
      filters.push(`{date} <= "${dateTo}"`);
    }

    let airtableParams = {
      pageSize: 100,
      view: "Grid view",
      fields: [
        "run_id",
        "horodatage",
        "date",
        "Beds24",
        "id_beds24",
        "Famille",
        "Ville",
        "S_base",
        "M_details",
        "prix_actuel",
        "prix_calcule",
        "prix_applique",
        "min_stay",
        "promo",
        "action_push",
        "raison_skip",
        "occupation_secteur",
        "tension_marche",
        "intensite_evenement",
        "meteo_score",
        "erreur",
        "is_holydays",
        "is_ferier",
      ],
      filterByFormula:
        filters.length === 1 ? filters[0] : `AND(${filters.join(", ")})`,
    };

    // Tri
    if (sortBy && mapFieldName(sortBy)) {
      const direction = sortOrder === "DESC" ? "desc" : "asc";
      airtableParams.sort = [{ field: mapFieldName(sortBy), direction }];
    }

    // Pagination serveur + récupération
    let allRecords = [];
    let offset = "";

    do {
      if (offset) {
        airtableParams.offset = offset;
      }

      console.log("Fetching with params:", airtableParams);

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
        params: airtableParams,
      });
      console.log("data", response.data);

      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
      delete airtableParams.offset;
    } while (offset);

    const transformedRecords = allRecords.map((record) => ({
      id: record.id,
      run_id: record.fields["run_id"] ?? "",
      horodatage: record.fields["horodatage"] ?? "",
      date: record.fields["date"] ?? "",
      Beds24: record.fields["Beds24"] ?? "",
      id_beds24: record.fields["id_beds24"] ?? "",
      Famille: record.fields["Famille"] ?? "",
      Ville: record.fields["Ville"] ?? "",
      S_base: record.fields["S_base"] ?? "",
      M_details: JSON.parse(record.fields.M_details) ?? "",
      prix_actuel: record.fields["prix_actuel"] ?? 0,
      prix_calcule: record.fields["prix_calcule"] ?? 0,
      prix_applique: record.fields["prix_applique"] ?? 0,
      min_stay: record.fields["min_stay"] ?? 0,
      promo: record.fields["promo"] ?? 0,
      action_push: record.fields["action_push"] ?? false,
      raison_skip: record.fields["raison_skip"] ?? "",
      occupation_secteur: record.fields["occupation_secteur"] ?? 0,
      tension_marche: record.fields["tension_marche"] ?? 0,
      intensite_evenement: record.fields["intensite_evenement"] ?? 0,
      meteo_score: record.fields["meteo_score"] ?? "",
      erreur: record.fields["erreur"] ?? "",
      is_holydays: record.fields["is_holydays"] ?? false,
      is_ferier: record.fields["is_ferier"] ?? false,
      jour_semaine: record.fields["jour_semaine"] ?? "",


    }));

    console.log(
      `Scorings trouvés pour le logement ${logementId}:`,
      transformedRecords.length
    );

    return {
      data: {
        scorings: transformedRecords,
        totalItems: transformedRecords.length,
        logementId: logementId,
      },
    };
  } catch (error) {
    console.log(
      "Erreur lors de la récupération des scorings par logement:",
      error
    );
    throw error;
  }
};

// ---------------------------
// Cache + getScoringsByLogementCached
// ---------------------------
let scoringCache = new Map();

export const getScoringsByLogementCached = async (logementId, params = {}) => {
  const cacheKey = `${logementId}-${JSON.stringify(params)}`;

  if (scoringCache.has(cacheKey)) {
    const cached = scoringCache.get(cacheKey);
    const now = new Date().getTime();
    if (now - cached.timestamp < 5 * 60 * 1000) {
      console.log("Données récupérées depuis le cache");
      return cached.data;
    }
  }

  const result = await getScoringsByLogement(logementId, params);

  scoringCache.set(cacheKey, {
    data: result,
    timestamp: new Date().getTime(),
  });

  return result;
};

export const clearScoringCache = () => {
  scoringCache.clear();
};