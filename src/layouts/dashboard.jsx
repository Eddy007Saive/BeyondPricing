import { Routes, Route, Outlet } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import { routeS, AppRoute } from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useUnreadNotifications, getRoutesWithNotifications } from "@/routes";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  
  // Utiliser le contexte des notifications
  const { unreadCount, isLoading, refreshCount } = useUnreadNotifications();
  
  // Obtenir les routes avec le comptage des notifications
  const routesWithNotifications = getRoutesWithNotifications(unreadCount, isLoading);

  return (
    <div className="bg-gradient-background">
      <Sidenav
        routes={routesWithNotifications}
        brandName="Zéro Homme"
        unreadCount={unreadCount}
        isLoadingNotifications={isLoading}
        onNotificationClick={refreshCount}
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar 
          unreadCount={unreadCount}
          isLoadingNotifications={isLoading}
          onNotificationClick={refreshCount}
        />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        
        <Outlet />
        
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;