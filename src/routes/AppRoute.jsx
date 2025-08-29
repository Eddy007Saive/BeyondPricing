import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Home } from "@/pages/dashboard/home";
import {Calendrier} from "@/pages/Campagne";


import { SignIn, SignUp } from "@/pages/auth";

export function AppRoute() {
  return (
    <Routes>
      {/* Routes Dashboard avec Outlet */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="home" element={<Home />} />

        <Route path="calendrier" element={<Calendrier />} />








        {/* Redirection par défaut vers home */}
        <Route index element={<Navigate to="home" replace />} />
      </Route>
      {/* Routes Auth avec Outlet */}
      <Route path="/auth" element={<Auth />}>


        {/* Redirection par défaut vers sign-in */}
        <Route index element={<Navigate to="sign-in" replace />} />
      </Route>

      {/* Redirection globale */}
      <Route path="*" element={<Navigate to="/dashboard/calendrier" replace />} />
    </Routes>
  );
}