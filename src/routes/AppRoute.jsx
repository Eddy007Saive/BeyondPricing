import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Home } from "@/pages/dashboard/home";
import { Create as NewProduit, liste as Produit, CampaignDetailDashboard, CampaignContactsInterface ,EditCampaign} from "@/pages/Campagne";
import { CreateContact as NewContact, listeContacts as Contacts} from "@/pages/Contacts";
import { LinkedInConfigInterface,UserGuideInterface ,NotificationsInterface} from "@/pages/Configuration";

import { SignIn, SignUp } from "@/pages/auth";

export function AppRoute() {
  return (
    <Routes>
      {/* Routes Dashboard avec Outlet */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="home" element={<Home />} />

        <Route path="campagne" element={<Produit />} />
        <Route path="nouvelle/campagne" element={<NewProduit />} />
        <Route path="campagne/contacts/create/:campaignId" element={<NewContact />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="campagne/:id" element={<CampaignDetailDashboard />} />
        <Route path="configuration" element={<LinkedInConfigInterface />} />
        <Route path="campagne/contacts/:id" element={<CampaignContactsInterface />} />
        <Route path="campagne/edit/:id" element={<EditCampaign />} />
        <Route path="guide" element={<UserGuideInterface />} />
        <Route path="Notification" element={<NotificationsInterface />} />








        {/* Redirection par défaut vers home */}
        <Route index element={<Navigate to="home" replace />} />
      </Route>
      {/* Routes Auth avec Outlet */}
      <Route path="/auth" element={<Auth />}>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />

        {/* Redirection par défaut vers sign-in */}
        <Route index element={<Navigate to="sign-in" replace />} />
      </Route>

      {/* Redirection globale */}
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}