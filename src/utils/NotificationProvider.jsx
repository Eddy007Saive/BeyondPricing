import React, { useState, useEffect, useRef, useCallback } from "react";
import { getUnreadNotificationsCount } from "@/services/Notification"; // Ajustez le chemin

// Context pour partager l'état des notifications dans toute l'app
export const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const isDocumentVisible = useRef(true);

  // Fonction pour récupérer le compteur
const fetchUnreadCount = useCallback(async () => {

}, []);

  // Fonction pour forcer la mise à jour
  const refreshCount = useCallback(() => {
  }, [fetchUnreadCount]);

  // Fonction pour marquer comme lu et rafraîchir
  const markAsReadAndRefresh = useCallback(async (markAsReadFunction) => {
    try {

    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }, [fetchUnreadCount]);

  // Gestion de la visibilité de la page (pause quand l'onglet n'est pas actif)
  useEffect(() => {
   

  }, [fetchUnreadCount]);

  // Fonction pour démarrer le polling
  const startPolling = useCallback(() => {

  }, [fetchUnreadCount]);




  const value = {
    unreadCount,
    isLoading,
    refreshCount,
    markAsReadAndRefresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le context
export const useUnreadNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useUnreadNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};

// Hook alternatif avec WebSocket (optionnel - si vous avez un serveur WebSocket)
export const useWebSocketNotifications = (wsUrl) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    // Récupération initiale
    const fetchInitialCount = async () => {
      try {
      } catch (error) {
        console.error('Erreur lors de la récupération initiale:', error);
        setIsLoading(false);
      }
    };

    fetchInitialCount();

    // WebSocket pour les mises à jour en temps réel
    if (wsUrl) {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification_count_update') {
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      wsRef.current.onerror = (error) => {
      };

      wsRef.current.onclose = () => {
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            wsRef.current = new WebSocket(wsUrl);
          }
        }, 5000);
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl]);

  const refreshCount = useCallback(async () => {
    try {
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  }, []);

  return { unreadCount, isLoading, refreshCount };
};

// Hook avec événements personnalisés pour la communication entre composants
export const useNotificationEvents = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setIsLoading(true);
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

// ... dans NotificationProvider, après les autres useEffect
useEffect(() => {
  const onUpdate = (e) => {
    fetchUnreadCount();
  };


  return () => {
    window.removeEventListener('notificationUpdated', onUpdate);
  };
}, [fetchUnreadCount]);


  const refreshCount = useCallback(() => {
  }, [fetchUnreadCount]);

  return { unreadCount, isLoading, refreshCount };
};

// Fonctions utilitaires pour déclencher les événements
export const emitNotificationEvent = (eventType, detail = {}) => {
  const event = new CustomEvent(eventType, { detail });
  window.dispatchEvent(event);
};

// Exemple d'utilisation dans vos fonctions de service
export const markNotificationAsReadWithEvent = async (id, markAsReadFunction) => {
  try {
    // Déclencher l'événement pour mettre à jour le compteur partout
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    throw error;
  }
};