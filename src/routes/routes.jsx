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
import { Calendar1Icon } from "lucide-react";
import { HomeModernIcon } from "@heroicons/react/24/outline";

// Configuration des icônes partagée
const iconConfig = {
  className: "w-5 h-5 text-inherit",
};

// Hook personnalisé pour gérer le comptage des notifications non lues
export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);


  return {};
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
        icon: <Calendar1Icon {...iconConfig} />,
        name: "Calendrier",
        path: "/calendrier",
        description: "Gestion des campagnes marketing"
      },

       {
        icon: <HomeModernIcon {...iconConfig} />,
        name: "Logement",
        path: "/logement",
        description: "Gestion des campagnes marketing"
      }
    ],
  }
 
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