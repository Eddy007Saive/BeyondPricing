import axios from 'axios';

// Configuration Airtable pour les notifications
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_NOTIFICATIONS_TABLE_NAME = import.meta.env.VITE_APP_AIRTABLE_NOTIFICATIONS_TABLE_NAME || 'Notification';
const AIRTABLE_API_KEY = import.meta.env.VITE_APP_AIRTABLE_API_KEY || 'your_api_key';

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});


// Ajouter ces fonctions à votre service existant
import { emitNotificationEvent } from '@/utils/NotificationProvider';

// Fonction utilitaire pour déclencher les événements
const triggerNotificationUpdate = () => {
  // Déclencher un événement personnalisé pour mettre à jour le compteur
  console.log("gfgvcvcv");
  
  emitNotificationEvent('notificationUpdated');
};



// Récupérer toutes les notifications avec pagination et filtres
export const getNotifications = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      statusFilter = '',
      workflowFilter = '',
      readFilter = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = params;

    let airtableParams = {
      maxRecords: limit * 2, // On récupère plus pour gérer le filtrage côté client si nécessaire
      pageSize: limit * 2,
    };

    // Tri
    if (sortBy) {
      const direction = sortOrder === 'DESC' ? 'desc' : 'asc';
      airtableParams.sort = [{ field: mapNotificationFieldName(sortBy), direction }];
    }

    // Construction du filtre
    let filters = [];

    // Recherche
    if (search) {
      filters.push(`OR(
        SEARCH(LOWER("${search}"), LOWER({message})),
        SEARCH(LOWER("${search}"), LOWER({workfow}))
      )`);
    }

    // Filtre par statut
    if (statusFilter) {
      filters.push(`{status} = "${statusFilter}"`);
    }

    // Filtre par workfow
    if (workflowFilter) {
      filters.push(`{workfow} = "${workflowFilter}"`);
    }

    // Filtre par statut de lecture
    if (readFilter === 'read') {
      filters.push(`{Read} = TRUE()`);
    } else if (readFilter === 'unread') {
      filters.push(`{Read} = FALSE()`);
    }

    // Combiner tous les filtres
    if (filters.length > 0) {
      airtableParams.filterByFormula = filters.length > 1 ? `AND(${filters.join(', ')})` : filters[0];
    }

    const response = await airtableClient.get(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}`, {
      params: airtableParams
    });

    console.log(response);

    // Transformer les données pour correspondre au format attendu
    const transformedRecords = response.data.records.map(record => ({
      id: record.id,
      workfow: record.fields['workfow'] || '',
      status: record.fields['status'] || 'info',
      message: record.fields['message'] || '',
      data: record.fields['data'] || '',
      created_at: record.fields['created_at'] || new Date().toISOString(),
      read: record.fields['Read'] || false,
    }));

    // Pagination côté client (Airtable ne supporte pas la pagination classique)
    const totalItems = transformedRecords.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = transformedRecords.slice(startIndex, endIndex);

    return {
      data: {
        notifications: paginatedRecords,
        totalItems,
        totalPages,
        currentPage: page
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

// Récupérer une notification par ID
export const getNotificationById = async (id) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}/${id}`);
    
    const record = response.data;
    return {
      data: {
        id: record.id,
        workfow: record.fields['workfow'] || '',
        status: record.fields['status'] || 'info',
        message: record.fields['message'] || '',
        data: record.fields['data'] || '',
        created_at: record.fields['created_at'] || new Date().toISOString(),
        read: record.fields['Read'] || false
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la notification:', error);
    throw error;
  }
};

// Mettre à jour une notification
export const updateNotification = async (id, notificationData) => {
  try {
    const updateFields = {};
    
    if (notificationData.workfow !== undefined) updateFields['workfow'] = notificationData.workfow;
    if (notificationData.status !== undefined) updateFields['status'] = notificationData.status;
    if (notificationData.message !== undefined) updateFields['message'] = notificationData.message;
    if (notificationData.data !== undefined) updateFields['data'] = typeof notificationData.data === 'object' ? JSON.stringify(notificationData.data) : notificationData.data;
    if (notificationData.read !== undefined) updateFields['Read'] = notificationData.read;
    if (notificationData.type !== undefined) updateFields['Type'] = notificationData.type;

    const response = await airtableClient.patch(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}/${id}`, {
      fields: updateFields
    });

    return {
      success: true,
      message: 'Notification mise à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour de la notification'
        }
      }
    };
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (id) => {
  try {
     const result=await updateNotification(id, { read: true });
      triggerNotificationUpdate();
    return result

  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    throw error;
  }
};

// Marquer une notification comme non lue
export const markNotificationAsUnread = async (id) => {
  try {
     const result=await updateNotification(id, { read: false });
      triggerNotificationUpdate();
      return result
  } catch (error) {
    console.error('Erreur lors du marquage comme non lu:', error);
    throw error;
  }
};

// Marquer plusieurs notifications comme lues
export const markMultipleNotificationsAsRead = async (ids) => {
  try {
    const promises = ids.map(id => markNotificationAsRead(id));
    const results = await Promise.allSettled(promises);
    triggerNotificationUpdate();

    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      success: true,
      message: `${successful} notifications marquées comme lues${failed > 0 ? `, ${failed} échecs` : ''}`,
      successful,
      failed
    };
  } catch (error) {
    console.error('Erreur lors du marquage multiple comme lu:', error);
    throw error;
  }
};

// Marquer plusieurs notifications comme non lues
export const markMultipleNotificationsAsUnread = async (ids) => {
  try {
    const promises = ids.map(id => markNotificationAsUnread(id));
    const results = await Promise.allSettled(promises);
    triggerNotificationUpdate();

    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      success: true,
      message: `${successful} notifications marquées comme non lues${failed > 0 ? `, ${failed} échecs` : ''}`,
      successful,
      failed
    };
  } catch (error) {
    console.error('Erreur lors du marquage multiple comme non lu:', error);
    throw error;
  }
};

// Supprimer une notification
export const deleteNotification = async (id) => {
  try {
    await airtableClient.delete(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}/${id}`);
    
    return {
      success: true,
      message: 'Notification supprimée avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression de la notification'
        }
      }
    };
  }
};

// Supprimer plusieurs notifications
export const deleteMultipleNotifications = async (ids) => {
  try {
    // Airtable permet de supprimer jusqu'à 10 enregistrements à la fois
    const batchSize = 10;
    let deletedCount = 0;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      
      try {
        await airtableClient.delete(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}`, {
          params: {
            records: batch
          }
        });
        
        deletedCount += batch.length;
      } catch (batchError) {
        console.error(`Erreur lors de la suppression du batch ${i / batchSize + 1}:`, batchError);
        // Continuer avec les autres batches même si un échoue
      }
    }

    return {
      success: true,
      message: `${deletedCount} notifications supprimées avec succès`,
      deletedCount
    };

  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression multiple'
        }
      }
    };
  }
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async () => {
  try {
    // Récupérer toutes les notifications non lues
    let allUnreadNotifications = [];
    let offset = '';

    do {
      const params = {
        pageSize: 100,
        filterByFormula: '{Read} = FALSE()',
        ...(offset && { offset })
      };

      const response = await airtableClient.get(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}`, { params });
      
      allUnreadNotifications = [...allUnreadNotifications, ...response.data.records.map(record => record.id)];
      offset = response.data.offset;
    } while (offset);

    if (allUnreadNotifications.length === 0) {
      return {
        success: true,
        message: 'Aucune notification non lue trouvée',
        updatedCount: 0
      };
    }

    // Marquer toutes comme lues
    const result = await markMultipleNotificationsAsRead(allUnreadNotifications);
    
    return {
      success: true,
      message: `${result.successful} notifications marquées comme lues`,
      updatedCount: result.successful
    };

  } catch (error) {
    console.error('Erreur lors du marquage global comme lu:', error);
    throw error;
  }
};

// Obtenir le nombre de notifications non lues
export const getUnreadNotificationsCount = async () => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}`, {
      params: {
        filterByFormula: '{Read} = FALSE()',
        fields: ['Read'] // On récupère seulement le champ Read pour optimiser
      }
    });

    return {
      data: {
        count: response.data.records.length
      }
    };
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    throw error;
  }
};

// Nettoyer les anciennes notifications (supprimer les notifications de plus de X jours)
export const cleanOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    let allOldNotifications = [];
    let offset = '';

    do {
      const params = {
        pageSize: 100,
        filterByFormula: `IS_BEFORE({created_at}, "${cutoffISO}")`,
        ...(offset && { offset })
      };

      const response = await airtableClient.get(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}`, { params });
      
      const notificationIds = response.data.records.map(record => record.id);
      allOldNotifications = [...allOldNotifications, ...notificationIds];
      
      offset = response.data.offset;
    } while (offset);

    if (allOldNotifications.length === 0) {
      return {
        success: true,
        message: `Aucune notification de plus de ${daysOld} jours trouvée`,
        deletedCount: 0
      };
    }

    const result = await deleteMultipleNotifications(allOldNotifications);
    
    return {
      success: true,
      message: `${result.deletedCount} anciennes notifications supprimées`,
      deletedCount: result.deletedCount
    };

  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes notifications:', error);
    throw error;
  }
};

// Fonction utilitaire pour mapper les noms de champs
const mapNotificationFieldName = (fieldName) => {
  const fieldMapping = {
    'id': 'ID',
    'workfow': 'workfow',
    'status': 'status',
    'message': 'message',
    'data': 'data',
    'created_at': 'created_at',
    'read': 'Read'
  };
  
  return fieldMapping[fieldName] || fieldName;
};

// Récupérer toutes les notifications (sans pagination)
export const getAllNotifications = async () => {
  try {
    let allRecords = [];
    let offset = '';

    do {
      const params = {
        pageSize: 100, // Maximum pour Airtable
        sort: [{ field: 'created_at', direction: 'desc' }],
        ...(offset && { offset })
      };

      const response = await airtableClient.get(`/${AIRTABLE_NOTIFICATIONS_TABLE_NAME}`, { params });
      
      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    const transformedRecords = allRecords.map(record => ({
      id: record.id,
      workfow: record.fields['worklow'] || '',
      status: record.fields['status'] || 'info',
      message: record.fields['message'] || '',
      data: record.fields['data'] || '',
      created_at: record.fields['created_at'] || new Date().toISOString(),
      read: record.fields['Read'] || false
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les notifications:', error);
    throw error;
  }
};

// Statistiques des notifications
export const getNotificationsStats = async () => {
  try {
    const allNotifications = await getAllNotifications();
    const notifications = allNotifications.data;

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      read: notifications.filter(n => n.read).length,
      byStatus: {
        success: notifications.filter(n => n.status === 'success').length,
        warning: notifications.filter(n => n.status === 'warning').length,
        error: notifications.filter(n => n.status === 'error').length,
        info: notifications.filter(n => n.status === 'info').length
      },
      byWorkflow: notifications.reduce((acc, notification) => {
        acc[notification.workfow] = (acc[notification.workfow] || 0) + 1;
        return acc;
      }, {}),
      today: notifications.filter(n => {
        const today = new Date().toDateString();
        const notifDate = new Date(n.created_at).toDateString();
        return today === notifDate;
      }).length
    };

    return {
      data: stats
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
};