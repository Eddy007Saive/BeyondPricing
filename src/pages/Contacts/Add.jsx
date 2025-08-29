import React, { useEffect, useState } from "react";
import { createContact, getContacts } from "@/services/Contact";
import { getCampagnes } from "@/services/Campagne";
import toastify from "@/utils/toastify"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ContactSchema } from "@/validations/ContactSchema";
import { useParams, useNavigate } from "react-router-dom";

export function CreateContact() {
  const { campaignId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const navigate = useNavigate();

  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || "");
  const [addMode, setAddMode] = useState("single"); // "single" ou "multiple"
  const [multipleContacts, setMultipleContacts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    localisation: "",
    posteActuel: "",
    entrepriseActuelle: "",
    url: "",
    statut: "Non contacté",
    campagne: "",
    secteurs: "",
    parcours: "",
    parcoursEducation: "",
    messagePersonnalise: "",
    connection: "",
    email: "",
    telephone: "",
    dateMessage: "",
    reponseRecue: "",
    dateReponse: "",
    notes: ""
  });

  // Options prédéfinies
  const localisations = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", 
    "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", 
    "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble",
    "Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", 
    "Occitanie", "Hauts-de-France", "Grand Est", "Pays de la Loire", 
    "Bretagne", "Normandie", "Bourgogne-Franche-Comté", 
    "Centre-Val de Loire", "Corse", "Provence-Alpes-Côte d'Azur", 
    "International", "Remote"
  ];

  const secteurs = [
    "Information Technology & Services", "Informatique", "Finance", 
    "Marketing", "Ressources Humaines", "Vente", "Ingénierie", 
    "Santé", "Éducation", "Juridique", "Logistique", "Construction", 
    "Automobile", "Aéronautique", "Pharmaceutique", "Agroalimentaire", 
    "Textile", "Énergie", "Télécommunications", "Média", "Tourisme", 
    "Immobilier", "Consulting", "Design", "Architecture", 
    "Recherche & Développement"
  ];

  const statutOptions = [
    "Non contacté",
    "Message envoyé", 
    "Réponse reçue",
    "En attente",
    "Intéressé",
    "Non intéressé",
    "À relancer"
  ];

  const connectionTypes = [
    "1st", "2nd", "3rd", "Out of network"
  ];

  useEffect(() => {
    fetchContacts();
    fetchCampagnes();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await getContacts();
      setContacts(response.data);
      console.log(response);
    } catch (error) {
      console.error("Erreur lors du chargement des contacts:", error);
    }
  };

  const fetchCampagnes = async () => {
    try {
      const response = await getCampagnes();
      setCampagnes(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des campagnes:", error);
    }
  };

  const methods = useForm({
    resolver: yupResolver(ContactSchema),
  });

  const { register, handleSubmit, reset, formState: { errors } } = methods;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    try {
        // Préparer les données pour la base de données
        const contactData = {
          "Nom": formData.nom,
          "Localisation": formData.localisation,
          "Poste actuel": formData.posteActuel,
          "Entreprise actuelle": formData.entrepriseActuelle,
          "URL": formData.url,
          "Statut": formData.statut,
          "Campagne": formData.campagne,
          "Secteurs": formData.secteurs,
          "Parcours": formData.parcours,
          "ParcoursEducation": formData.parcoursEducation,
          "Message Personnalisé": formData.messagePersonnalise,
          "Connection": formData.connection,
          "Email": formData.email,
          "Téléphone": formData.telephone,
          "Date du message": formData.dateMessage || null,
          "Réponse reçue": formData.reponseRecue,
          "Date de réponse": formData.dateReponse || null,
          "Notes": formData.notes,
        };

        const response = await createContact(contactData);
        
        toastify.success(response.message || "Contact créé avec succès");
        fetchContacts(); 
        reset();
        setFormData({
          nom: "",
          localisation: "",
          posteActuel: "",
          entrepriseActuelle: "",
          url: "",
          statut: "Non contacté",
          campagne: "",
          secteurs: "",
          parcours: "",
          parcoursEducation: "",
          messagePersonnalise: "",
          connection: "",
          email: "",
          telephone: "",
          dateMessage: "",
          reponseRecue: "",
          dateReponse: "",
          notes: ""
        });
    } catch (error) {
        console.error("Erreur lors de la soumission :", error);

        if (error.response) {
            const errorMessage = error.response.data.errors || "Une erreur s'est produite";
            toastify.error(errorMessage);
        } else if (error.request) {
            toastify.error("Le serveur ne répond pas. Vérifiez votre connexion.");
        } else {
            toastify.error(error.message);
        }
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 p-4">
      <div className="mx-auto lg:py-8">
        <div className="shadow-lg p-4">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Ajouter un Contact
          </h2>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-6">
                
                {/* Informations de base */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Nom complet *</label>
                    <input
                      {...register("nom")}
                      value={formData.nom}
                      name="nom"
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Ex: Benjamin Roger"
                    />
                    {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Localisation</label>
                    <select
                      name="localisation"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("localisation")}
                      onChange={handleChange}
                      value={formData.localisation}
                    >
                      <option value="">Sélectionner une localisation</option>
                      {localisations.map((localisation) => (
                        <option key={localisation} value={localisation}>
                          {localisation}
                        </option>
                      ))}
                    </select>
                    {errors.localisation && <p className="text-red-500 text-xs">{errors.localisation.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Poste actuel</label>
                    <input
                      {...register("posteActuel")}
                      value={formData.posteActuel}
                      name="posteActuel"
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Ex: Regional Manager - Francophone Africa"
                    />
                    {errors.posteActuel && <p className="text-red-500 text-xs">{errors.posteActuel.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Entreprise actuelle</label>
                    <input
                      {...register("entrepriseActuelle")}
                      value={formData.entrepriseActuelle}
                      name="entrepriseActuelle"
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Ex: Polycea (ex Polyconseil)"
                    />
                    {errors.entrepriseActuelle && <p className="text-red-500 text-xs">{errors.entrepriseActuelle.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">URL LinkedIn</label>
                    <input
                      {...register("url")}
                      value={formData.url}
                      name="url"
                      type="url"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="https://www.linkedin.com/in/..."
                    />
                    {errors.url && <p className="text-red-500 text-xs">{errors.url.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Secteur</label>
                    <select
                      name="secteurs"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("secteurs")}
                      onChange={handleChange}
                      value={formData.secteurs}
                    >
                      <option value="">Sélectionner un secteur</option>
                      {secteurs.map((secteur) => (
                        <option key={secteur} value={secteur}>
                          {secteur}
                        </option>
                      ))}
                    </select>
                    {errors.secteurs && <p className="text-red-500 text-xs">{errors.secteurs.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Statut</label>
                    <select
                      name="statut"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("statut")}
                      onChange={handleChange}
                      value={formData.statut}
                    >
                      {statutOptions.map((statut) => (
                        <option key={statut} value={statut}>
                          {statut}
                        </option>
                      ))}
                    </select>
                    {errors.statut && <p className="text-red-500 text-xs">{errors.statut.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Campagne associée</label>
                    <select
                      name="campagne"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("campagne")}
                      onChange={handleChange}
                      value={formData.campagne}
                    >
                      <option value="">Sélectionner une campagne</option>
                      {campagnes.map((campagne) => (
                        <option key={campagne.id} value={campagne.id}>
                          {campagne.nom}
                        </option>
                      ))}
                    </select>
                    {errors.campagne && <p className="text-red-500 text-xs">{errors.campagne.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Type de connexion</label>
                    <select
                      name="connection"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("connection")}
                      onChange={handleChange}
                      value={formData.connection}
                    >
                      <option value="">Sélectionner le type</option>
                      {connectionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.connection && <p className="text-red-500 text-xs">{errors.connection.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
                      {...register("email")}
                      value={formData.email}
                      name="email"
                      type="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="contact@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Téléphone</label>
                    <input
                      {...register("telephone")}
                      value={formData.telephone}
                      name="telephone"
                      type="tel"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="+33 1 23 45 67 89"
                    />
                    {errors.telephone && <p className="text-red-500 text-xs">{errors.telephone.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Date du message</label>
                    <input
                      {...register("dateMessage")}
                      value={formData.dateMessage}
                      name="dateMessage"
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.dateMessage && <p className="text-red-500 text-xs">{errors.dateMessage.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Réponse reçue</label>
                    <select
                      name="reponseRecue"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("reponseRecue")}
                      onChange={handleChange}
                      value={formData.reponseRecue}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Oui">Oui</option>
                      <option value="Non">Non</option>
                    </select>
                    {errors.reponseRecue && <p className="text-red-500 text-xs">{errors.reponseRecue.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Date de réponse</label>
                    <input
                      {...register("dateReponse")}
                      value={formData.dateReponse}
                      name="dateReponse"
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.dateReponse && <p className="text-red-500 text-xs">{errors.dateReponse.message}</p>}
                  </div>
                </div>

                {/* Champs texte longs */}
                <div className="grid gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Parcours professionnel</label>
                    <textarea
                      {...register("parcours")}
                      value={formData.parcours}
                      name="parcours"
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Résumé du parcours professionnel..."
                    />
                    {errors.parcours && <p className="text-red-500 text-xs">{errors.parcours.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Parcours éducation</label>
                    <textarea
                      {...register("parcoursEducation")}
                      value={formData.parcoursEducation}
                      name="parcoursEducation"
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Formation et éducation..."
                    />
                    {errors.parcoursEducation && <p className="text-red-500 text-xs">{errors.parcoursEducation.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Message personnalisé</label>
                    <textarea
                      {...register("messagePersonnalise")}
                      value={formData.messagePersonnalise}
                      name="messagePersonnalise"
                      rows="4"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Message d'approche personnalisé..."
                    />
                    {errors.messagePersonnalise && <p className="text-red-500 text-xs">{errors.messagePersonnalise.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Notes</label>
                    <textarea
                      {...register("notes")}
                      value={formData.notes}
                      name="notes"
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                      placeholder="Notes et commentaires..."
                    />
                    {errors.notes && <p className="text-red-500 text-xs">{errors.notes.message}</p>}
                  </div>
                </div>
              </div>

              {/* Bouton Submit */}
              <div className="flex justify-center mt-6">
                <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
                  Ajouter le contact
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <ToastContainer/>
    </section>
  );
}

export default CreateContact;