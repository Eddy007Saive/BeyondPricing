import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  MegaphoneIcon,
  GlobeAmericasIcon,
  UserGroupIcon,
  BookOpenIcon,
  BellAlertIcon
} from "@heroicons/react/24/solid";
import { getUnreadNotificationsCount } from "@/services/Notification"; // Ajustez le chemin

// Configuration des icônes partagée
const iconConfig = {
  className: "w-5 h-5 text-inherit",
};

// Hook personnalisé pour gérer le comptage des notifications non lues
export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      const response = await getUnreadNotificationsCount();
      console.log("rerer",response);
      
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Optionnel : actualiser périodiquement le compteur
    const interval = setInterval(fetchUnreadCount, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  return { unreadCount, isLoading, refreshCount: fetchUnreadCount };
};

// Composant pour afficher le badge de notification
const NotificationBadge = ({ count, isLoading }) => {
  if (isLoading) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-medium text-white bg-gray-400 rounded-full animate-pulse">
        •
      </span>
    );
  }

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px]">
      {count > 99 ? '99+' : count}
    </span>
  );
};

// Configuration des routes organisée par sections
export const createRoutes = (unreadCount = 0, isLoadingNotifications = false) => [
  {
    title: "Navigation principale",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...iconConfig} />,
        name: "Accueil",
        path: "/home",
        description: "Page d'accueil du dashboard"
      },
      {
        icon: <MegaphoneIcon {...iconConfig} />,
        name: "Campagnes",
        path: "/campagne",
        description: "Gestion des campagnes marketing"
      },
      {
        icon: <UserGroupIcon {...iconConfig} />,
        name: "Contacts",
        path: "/contacts",
        description: "Gestion des contacts"
      }
    ],
  },
  {
    title: "Paramètres",
    layout: "dashboard",
    pages: [
      {
        icon: <GlobeAmericasIcon {...iconConfig} />,
        name: "Configuration",
        path: "/configuration",
        description: "Configuration générale de l'application"
      },
      {
        icon: <BookOpenIcon {...iconConfig} />,
        name: "Aide",
        path: "/guide",
        description: "Documentation et aide"
      },
      {
        icon: <BellAlertIcon {...iconConfig} />,
        name: "Notifications",
        path: "/notification",
        description: "Gestion des notifications",
        badge: <NotificationBadge count={unreadCount} isLoading={isLoadingNotifications} />,
        hasUnreadNotifications: unreadCount > 0
      },
    ],
  },
];

// Routes statiques par défaut (sans badge)
export const routeS = createRoutes();

// Export par défaut
export default routeS;

// Utilitaires pour faciliter l'utilisation
export const getAllRoutes = (routes = routeS) => {
  return routes.flatMap(section => section.pages);
};

export const getRoutesByLayout = (layout, routes = routeS) => {
  return routes
    .filter(section => section.layout === layout)
    .flatMap(section => section.pages);
};

export const findRouteByPath = (path, routes = routeS) => {
  const allRoutes = getAllRoutes(routes);
  return allRoutes.find(route => route.path === path);
};

// Fonction utilitaire pour obtenir les routes avec notifications
export const getRoutesWithNotifications = (unreadCount, isLoading = false) => {
  return createRoutes(unreadCount, isLoading);
};