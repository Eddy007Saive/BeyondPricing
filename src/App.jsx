import { AppRoute } from "@/routes/AppRoute";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  // Vérifie si la route est "Home" ("/")
  const isHome = location.pathname === "/";

  return (
    <div
      className={`bg-gradient-background`}
    >
      <AppRoute />
    </div>
  );
}

export default App;
