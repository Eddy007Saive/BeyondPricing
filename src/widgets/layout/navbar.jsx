import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Collapse,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="white"
          className="capitalize"
        >
          <Link
            to={path}
            className="group flex items-center gap-1 p-1 font-bold text-blanc-pur hover:text-bleu-neon transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,207,255,0.8)] relative"
          >
            {icon &&
              React.createElement(icon, {
                className:
                  "w-[18px] h-[18px] opacity-70 mr-1 text-blanc-pur group-hover:text-bleu-neon transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,207,255,0.8)]",
              })}
            {name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4 bg-gradient-background backdrop-blur-md border-none shadow-neon-gradient">
      <div className="flex items-center justify-between text-blanc-pur">
        <Link to="/">
          <Typography
            className="mr-4 ml-2 cursor-pointer py-1.5 font-bold text-xl text-blanc-pur hover:text-bleu-neon transition-all duration-300 hover:animate-glow"
          >
            {brandName}
          </Typography>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="mr-4 hidden lg:block">{navList}</div>
          
          <div className="flex items-center gap-x-1">
            {React.cloneElement(action, {
              className:
                "hidden lg:inline-block bg-gradient-primary text-noir-absolu font-bold px-6 py-2 rounded-lg hover:scale-105 shadow-neon-blue hover:shadow-neon-gradient transition-all duration-300 border-2 border-transparent hover:border-bleu-neon",
            })}
          </div>
          
          <IconButton
            size="sm"
            color="white"
            variant="text"
            onClick={() => setOpenNav(!openNav)}
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden hover:text-bleu-neon transition-all duration-300"
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>
        </div>
      </div>
      
      <Collapse open={openNav} className="overflow-scroll">
        <div className="container mx-auto bg-gradient-to-b from-bleu-fonce to-noir-absolu rounded-lg mt-3 p-4 border border-bleu-neon/20">
          {navList}
          {React.cloneElement(action, {
            className:
              "w-full block lg:hidden bg-gradient-primary text-noir-absolu font-bold py-3 px-6 rounded-lg hover:scale-105 shadow-neon-blue hover:shadow-neon-gradient transition-all duration-300 mt-4 border-2 border-transparent hover:border-bleu-neon",
          })}
        </div>
      </Collapse>
    </MTNavbar>
  );
}

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;