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
  onNotificationClick,
  bottomCircleImg, // Nouvelle prop pour l'image du cercle
  bottomCircleAlt, // Nouvelle prop pour l'alt text
  onBottomCircleClick // Nouvelle prop pour le click handler
}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  return (
    <aside
      className={`${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-all duration-300 xl:translate-x-0 bg-gradient-background backdrop-blur-md border-2 border-bleu-neon/20 shadow-neon-gradient flex flex-col`}
    >
      <div className="relative border-b border-bleu-neon/20 pb-4 flex-shrink-0">
        <Link to="/" className="py-6 px-8 text-center flex items-center justify-center gap-2 group">
          <div className="relative">
            <img 
              src={brandImg} 
              alt="Logo"
              className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(0,207,255,0.8)]"
            />
            <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-bleu-neon/50 transition-all duration-300"></div>
          </div>
          <Typography
            variant="h6"
            className="text-blanc-pur font-bold group-hover:text-bleu-neon transition-all duration-300 group-hover:animate-glow"
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          size="sm"
          ripple={false}
          className="absolute right-4 top-4 grid rounded-lg xl:hidden text-blanc-pur hover:text-bleu-neon hover:bg-bleu-neon/10 transition-all duration-300 hover:shadow-neon-blue border border-transparent hover:border-bleu-neon/30"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      <div className="flex-1 m-4 overflow-y-auto scrollbar-thin scrollbar-thumb-bleu-neon/30 scrollbar-track-transparent">
        <div className={bottomCircleImg ? "pb-44" : "pb-4"}>
          {routes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-6 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-3">
                  <Typography
                    variant="small"
                    className="font-black uppercase text-violet-plasma opacity-90 tracking-wider text-xs"
                  >
                    {title}
                  </Typography>
                  <div className="mt-1 h-px bg-gradient-primary opacity-30"></div>
                </li>
              )}
              {pages.map(({ icon, name, path, badge, hasUnreadNotifications }) => (
                <li key={name} className="relative">
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "filled" : "text"}
                        className={`flex items-center gap-4 px-4 capitalize relative group transition-all duration-300 mb-1 ${
                          isActive
                            ? "bg-gradient-primary text-noir-absolu shadow-neon-gradient border-2 border-bleu-neon"
                            : "text-blanc-pur hover:text-bleu-neon hover:bg-bleu-neon/5 border-2 border-transparent hover:border-bleu-neon/30"
                        }`}
                        fullWidth
                        onClick={path === "/notification" ? onNotificationClick : undefined}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className={`transition-all duration-300 ${
                              isActive 
                                ? "text-noir-absolu drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]" 
                                : "text-blanc-pur group-hover:text-bleu-neon group-hover:drop-shadow-[0_0_8px_rgba(0,207,255,0.8)]"
                            }`}>
                              {icon}
                            </div>
                            <Typography
                              className={`font-medium capitalize transition-all duration-300 ${
                                isActive 
                                  ? "text-noir-absolu font-bold" 
                                  : "text-blanc-pur group-hover:text-bleu-neon"
                              }`}
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
                        
                        {/* Effet de lueur sur le côté pour l'élément actif */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-primary rounded-r-full shadow-neon-blue"></div>
                        )}
                        
                        {/* Effet de survol */}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        )}
                      </Button>
                    )}
                  </NavLink>
                  
                  {/* Indicateur visuel pour les notifications non lues */}
                  {hasUnreadNotifications && (
                    <div className="ml-12 mt-1 mb-2">
                      <div className="flex items-center text-xs">
                        <div className="w-2 h-2 bg-gradient-to-r from-violet-plasma to-bleu-neon rounded-full mr-2 animate-pulse shadow-neon-violet"></div>
                        <Typography
                          variant="small"
                          className="font-normal text-violet-plasma opacity-80 text-xs animate-pulse"
                        >
                          Nouvelles notifications
                        </Typography>
                      </div>
                    </div>
                  )}
                  
                  {/* Effet de particules pour les notifications */}
                  {hasUnreadNotifications && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-violet-plasma rounded-full animate-ping"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-violet-plasma rounded-full animate-pulse"></div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

{bottomCircleImg && (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex-shrink-0">
    <div
      className="relative w-[60%] max-w-[140px] aspect-square rounded-full overflow-hidden border-2 border-bleu-neon/50 group cursor-pointer transition-all duration-300"
      onClick={onBottomCircleClick}
    >
      <img
        src={bottomCircleImg}
        alt={bottomCircleAlt || "Profile"}
        className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
      />

      {/* Effet de lueur au survol */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>

      {/* Points lumineux autour du cercle */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-bleu-neon rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-violet-plasma rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
    </div>
  </div>
)}


      {/* Effet de bordure lumineuse en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-50 rounded-b-xl"></div>
      
      {/* Points décoratifs */}
      <div className="absolute top-20 right-4 w-1 h-1 bg-bleu-neon rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute top-32 right-6 w-0.5 h-0.5 bg-violet-plasma rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-44 right-3 w-0.5 h-0.5 bg-bleu-neon rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo.png",
  brandName: "Prospectra",
  unreadCount: 0,
  isLoadingNotifications: false,
  onNotificationClick: () => {},
  bottomCircleImg: "/img/photo_5954299465697445759_x.jpg",
  bottomCircleAlt: "Profile",
  onBottomCircleClick: () => {},
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  unreadCount: PropTypes.number,
  isLoadingNotifications: PropTypes.bool,
  onNotificationClick: PropTypes.func,
  bottomCircleImg: PropTypes.string,
  bottomCircleAlt: PropTypes.string,
  onBottomCircleClick: PropTypes.func,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;