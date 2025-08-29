import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ 
  brandImg, 
  brandName, 
  routes, 
  unreadCount, 
  isLoadingNotifications, 
  onNotificationClick 
}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className={`relative`}>
        <Link to="/" className="py-6 px-8 text-center flex items-center justify-center gap-2">
          <img 
            src={brandImg} 
            alt="Logo"
            className="w-10 h-10"
          />
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path, badge, hasUnreadNotifications }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                      }
                      className="flex items-center gap-4 px-4 capitalize relative"
                      fullWidth
                      onClick={path === "/notification" ? onNotificationClick : undefined}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </div>
                        {badge && (
                          <div className="flex-shrink-0 ml-auto">
                            {badge}
                          </div>
                        )}
                      </div>
                    </Button>
                  )}
                </NavLink>
                
                {/* Indicateur visuel pour les notifications non lues */}
                {hasUnreadNotifications && (
                  <div className="ml-12 mt-1 mb-2">
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      <Typography
                        variant="small"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="font-normal opacity-70 text-xs"
                      >
                        Nouvelles notifications
                      </Typography>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo.png",
  brandName: "Prospectra",
  unreadCount: 0,
  isLoadingNotifications: false,
  onNotificationClick: () => {},
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  unreadCount: PropTypes.number,
  isLoadingNotifications: PropTypes.bool,
  onNotificationClick: PropTypes.func,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;