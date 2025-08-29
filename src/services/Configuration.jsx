import axios from 'axios';

// Configuration Airtable
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_CONFIG_TABLE = 'configuration_cookies';
const AIRTABLE_QUOTA_TABLE = 'Quota par jours';
const AIRTABLE_API_KEY = import.meta.env.VITE_APP_AIRTABLE_API_KEY || 'your_api_key';

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});


// Récupérer la configuration actuelle (toujours le premier enregistrement)
export const getConfiguration = async () => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_CONFIG_TABLE}`, {
      params: {
        maxRecords: 1,
        pageSize: 1
      }
    });

    if (response.data.records.length === 0) {
      // Si aucune configuration n'existe, créer une configuration par défaut
      return await createDefaultConfiguration();
    }

    const record = response.data.records[0];
    return {
      success: true,
      data: {
        id: record.id,
        nom: record.fields['Nom'] || '',
        valeur: record.fields['Valeur'] || '',
        email: record.fields['Email'] || '',
        derniereMiseAJour: record.fields['Dernière mise à jour'] || '',
        status: record.fields['Status'] || 'Inactif',
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    throw error;
  }
};

// Créer une configuration par défaut
const createDefaultConfiguration = async () => {
  try {
    const defaultConfig = {
      'Nom': 'LinkedIn Cookies',
      'Valeur': '',
      'Email': '',
      'Status': 'Inactif',
    };

    const response = await airtableClient.post(`/${AIRTABLE_CONFIG_TABLE}`, {
      fields: defaultConfig
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        nom: defaultConfig['Nom'],
        valeur: defaultConfig['Valeur'],
        email: defaultConfig['Email'],
        status: defaultConfig['Status'],
        delayBetweenActions: defaultConfig['Delay Between Actions'],
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création de la configuration par défaut:', error);
    throw error;
  }
};

// Mettre à jour la configuration (toujours le premier enregistrement)
export const updateConfiguration = async (configData) => {
  try {
    // D'abord récupérer l'ID de la configuration existante
    const currentConfig = await getConfiguration();
    
    if (!currentConfig.success) {
      throw new Error('Configuration non trouvée');
    }

    const updateData = {
      'Nom': configData.nom || 'LinkedIn Cookies',
      'Valeur': configData.valeur || configData.liAt || '', // Support pour les deux formats
      'Email': configData.email || '',
      'Status': configData.status || 'Actif',
      'User_agent': configData.userAgent || '',

    };

    const response = await airtableClient.patch(`/${AIRTABLE_CONFIG_TABLE}/${currentConfig.data.id}`, {
      fields: updateData
    });

    return {
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: {
        id: response.data.id,
        nom: updateData['Nom'],
        valeur: updateData['Valeur'],
        email: updateData['Email'],
        status: updateData['Status'],
        userAgent: updateData['User_agent'],

      }
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour de la configuration'
        }
      }
    };
  }
};

// Valider la configuration des cookies et de l'email
export const validateConfiguration = async () => {
  try {
    const config = await getConfiguration();
    
    if (!config.success) {
      return {
        success: false,
        valid: false,
        message: 'Configuration non trouvée'
      };
    }

    const { valeur, email, status } = config.data;
    
    // Validation du cookie li_at
    const isValidCookie = valeur && valeur.length > 50 && valeur.startsWith('AQEDA');
    
    // Validation de l'email (regex simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email && emailRegex.test(email);
    
    const isActive = status === 'Actif';

    const isFullyValid = isValidCookie && isValidEmail && isActive;

    return {
      success: true,
      valid: isFullyValid,
      message: isFullyValid 
        ? 'Configuration complète et valide' 
        : getValidationMessage(isValidCookie, isValidEmail, isActive),
      details: {
        cookieValid: isValidCookie,
        emailValid: isValidEmail,
        statusActive: isActive,
        cookieLength: valeur ? valeur.length : 0,
        email: email || ''
      }
    };
  } catch (error) {
    console.error('Erreur lors de la validation de la configuration:', error);
    return {
      success: false,
      valid: false,
      message: 'Erreur lors de la validation'
    };
  }
};

// Fonction helper pour générer le message de validation
const getValidationMessage = (isValidCookie, isValidEmail, isActive) => {
  const issues = [];
  
  if (!isValidCookie) issues.push('Cookie invalide ou manquant');
  if (!isValidEmail) issues.push('Email invalide ou manquant');
  if (!isActive) issues.push('Configuration inactive');
  
  return issues.join(', ');
};

// ========== GESTION QUOTAS ==========

// Récupérer le quota actuel (toujours le premier enregistrement)
export const getQuota = async () => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_QUOTA_TABLE}`, {
      params: {
        maxRecords: 1,
        pageSize: 1
      }
    });

    if (response.data.records.length === 0) {
      // Si aucun quota n'existe, créer un quota par défaut
      return await createDefaultQuota();
    }

    const record = response.data.records[0];
    return {
      success: true,
      data: {
        id: record.id,
        quotaRestant: record.fields['Quota restant'] || 0,
        derniereMiseAJour: record.fields['Dernière mise à jour'] || '',
        idCampagneActive: record.fields['ID Campagne active'] || ''
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du quota:', error);
    throw error;
  }
};

// Créer un quota par défaut
const createDefaultQuota = async () => {
  try {
    const defaultQuota = {
      'Quota restant': 50,
      'Dernière mise à jour': new Date().toLocaleDateString('fr-FR'),
      'ID Campagne active': ''
    };

    const response = await airtableClient.post(`/${AIRTABLE_QUOTA_TABLE}`, {
      fields: defaultQuota
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        quotaRestant: defaultQuota['Quota restant'],
        derniereMiseAJour: defaultQuota['Dernière mise à jour'],
        idCampagneActive: defaultQuota['ID Campagne active']
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création du quota par défaut:', error);
    throw error;
  }
};

// Mettre à jour le quota
export const updateQuota = async (quotaData) => {
  try {
    // D'abord récupérer l'ID du quota existant
    const currentQuota = await getQuota();
    
    if (!currentQuota.success) {
      throw new Error('Quota non trouvé');
    }

    const updateData = {
      'Quota restant': quotaData.quotaRestant || 0,
      'Dernière mise à jour': new Date().toLocaleDateString('fr-FR'),
      'ID Campagne active': quotaData.idCampagneActive || ''
    };

    const response = await airtableClient.patch(`/${AIRTABLE_QUOTA_TABLE}/${currentQuota.data.id}`, {
      fields: updateData
    });

    return {
      success: true,
      message: 'Quota mis à jour avec succès',
      data: {
        id: response.data.id,
        quotaRestant: updateData['Quota restant'],
        derniereMiseAJour: updateData['Dernière mise à jour'],
        idCampagneActive: updateData['ID Campagne active']
      }
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quota:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du quota'
        }
      }
    };
  }
};

// Décrémenter le quota (utilisé lors du lancement d'une campagne)
export const decrementQuota = async (amount = 1) => {
  try {
    const currentQuota = await getQuota();
    
    if (!currentQuota.success) {
      throw new Error('Quota non trouvé');
    }

    const newQuota = Math.max(0, currentQuota.data.quotaRestant - amount);
    
    return await updateQuota({
      quotaRestant: newQuota,
      idCampagneActive: currentQuota.data.idCampagneActive
    });
  } catch (error) {
    console.error('Erreur lors de la décrémentation du quota:', error);
    throw error;
  }
};

// Réinitialiser le quota quotidien (à appeler chaque jour)
export const resetDailyQuota = async (newQuota = 50) => {
  try {
    return await updateQuota({
      quotaRestant: newQuota,
      idCampagneActive: ''
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du quota:', error);
    throw error;
  }
};

// ========== FONCTIONS UTILITAIRES ==========

// Vérifier si on peut lancer une campagne (quota disponible + configuration valide)
export const canLaunchCampaign = async () => {
  try {
    const [quotaResult, configResult] = await Promise.all([
      getQuota(),
      validateConfiguration()
    ]);

    const hasQuota = quotaResult.success && quotaResult.data.quotaRestant > 0;
    const hasValidConfig = configResult.success && configResult.valid;

    return {
      success: true,
      canLaunch: hasQuota && hasValidConfig,
      reasons: {
        quota: hasQuota ? 'OK' : 'Quota épuisé',
        configuration: hasValidConfig ? 'OK' : configResult.message
      },
      quotaRestant: quotaResult.success ? quotaResult.data.quotaRestant : 0
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des prérequis:', error);
    return {
      success: false,
      canLaunch: false,
      reasons: {
        error: 'Erreur lors de la vérification'
      }
    };
  }
};

// Obtenir le statut complet du système
export const getSystemStatus = async () => {
  try {
    const [quotaResult, configResult, validationResult] = await Promise.all([
      getQuota(),
      getConfiguration(),
      validateConfiguration()
    ]);

    return {
      success: true,
      data: {
        quota: quotaResult.success ? quotaResult.data : null,
        configuration: configResult.success ? configResult.data : null,
        validation: validationResult,
        systemReady: validationResult.valid && quotaResult.success && quotaResult.data.quotaRestant > 0
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du statut système:', error);
    throw error;
  }
};