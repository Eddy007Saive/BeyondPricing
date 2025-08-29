import React, { useEffect, useState } from "react";
import { createContact, createMultipleContacts, getContacts } from "@/services/Contact";
import { getCampagnes } from "@/services/Campagne";
import toastify from "@/utils/toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ContactSchema } from "@/validations/ContactSchema";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserPlusIcon,
  DocumentArrowUpIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export function CreateContact() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || "");
  const [addMode, setAddMode] = useState("single"); // "single" ou "multiple"
  const [multipleContacts, setMultipleContacts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id:"",
    nom: "",
    email: "",
    telephone: "",
    localisation: "",
    posteActuel: "",
    entrepriseActuelle: "",
    url: "",
    statut: "À contacter",
    secteurs: "",
    parcours: "",
    parcoursEducation: "",
    messagePersonnalise: "",
    connection: "",
    notes: "",
    profilImage: ""
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
    "À contacter",
    "Message envoyé", 
    "Répondu",
    "Pas intéressé",
    "Rendez-vous pris",
    "Non intéressé",
    "À recontacter"
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
      setCampagnes(response.data?.campagnes || response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des campagnes:", error);
      toastify.error("Erreur lors du chargement des campagnes");
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

  const handleBack = () => {
    if (campaignId) {
      navigate(`/dashboard/campagne/detail/${campaignId}`);
    } else {
      navigate('/dashboard/contacts');
    }
  };

  const onSubmitSingle = async () => {
    try {
      setIsSubmitting(true);

      // Préparer les données pour la base de données (format unifié)
      const contactData = {
        "ID_CONTACT":formData.id,
        "Nom": formData.nom,
        "Email": formData.email,
        "Téléphone": formData.telephone,
        "Localisation": formData.localisation,
        "Poste actuel": formData.posteActuel,
        "Entreprise actuelle": formData.entrepriseActuelle,
        "URL": formData.url,
        "Statut": formData.statut,
        "Secteurs": formData.secteurs,
        "Parcours": formData.parcours,
        "ParcoursEducation": formData.parcoursEducation,
        "Message Personnalisé": formData.messagePersonnalise,
        "connection": formData.connection,
        "Notes": formData.notes,
        "profilImage": formData.profilImage,
        "Campagne": selectedCampaign ? [selectedCampaign] : []
      };

      const response = await createContact(contactData);
      
      toastify.success(response.message || "Contact créé avec succès");
      fetchContacts(); 
      reset();
      setFormData({
        id:"",
        nom: "",
        email: "",
        telephone: "",
        localisation: "",
        posteActuel: "",
        entrepriseActuelle: "",
        url: "",
        statut: "Non contacté",
        secteurs: "",
        parcours: "",
        parcoursEducation: "",
        messagePersonnalise: "",
        connection: "",
        dateMessage: "",
        reponseRecue: "",
        dateReponse: "",
        notes: "",
        profilImage: ""
      });
      navigate(-1)
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const addContactToMultiple = () => {
    if (!formData.nom || !formData.email || !formData.posteActuel) {
      toastify.warning("Veuillez remplir au minimum le nom, l'email et le poste");
      return;
    }

    const newContact = { ...formData, id: Date.now() };
    setMultipleContacts([...multipleContacts, newContact]);
    
    // Reset du formulaire pour le prochain contact
    setFormData({
      id:"",
      nom: "",
      email: "",
      telephone: "",
      localisation: "",
      posteActuel: "",
      entrepriseActuelle: "",
      url: "",
      statut: "À contacter",
      secteurs: "",
      parcours: "",
      parcoursEducation: "",
      messagePersonnalise: "",
      connection: "",
      dateMessage: "",
      reponseRecue: "",
      dateReponse: "",
      notes: "",
      profilImage: ""
    });
    reset();
  };

  const removeContactFromMultiple = (contactId) => {
    setMultipleContacts(multipleContacts.filter(contact => contact.id !== contactId));
  };

  const onSubmitMultiple = async () => {
    if (multipleContacts.length === 0) {
      toastify.warning("Aucun contact à créer");
      return;
    }

    try {
      setIsSubmitting(true);

      // Préparer les données pour la base de données
      const contactsData = multipleContacts.map(contact => ({
        "ID_CONTACT":contact.id,
        "Nom": contact.nom,
        "Email": contact.email,
        "Téléphone": contact.telephone,
        "Localisation": contact.localisation,
        "Poste actuel": contact.posteActuel,
        "Entreprise actuelle": contact.entrepriseActuelle,
        "URL": contact.url,
        "Statut": contact.statut,
        "Secteurs": contact.secteurs,
        "Parcours": contact.parcours,
        "ParcoursEducation": contact.parcoursEducation,
        "Message Personnalisé": contact.messagePersonnalise,
        "Connection": contact.connection,
        "Date du message": contact.dateMessage || null,
        "Réponse reçue": contact.reponseRecue,
        "Date de réponse": contact.dateReponse || null,
        "Notes": contact.notes,
        "profilImage": contact.profilImage,
        "Campagne": selectedCampaign ? [selectedCampaign] : []
      }));

      await createMultipleContacts(contactsData);
      toastify.success(`${multipleContacts.length} contacts créés avec succès`);
      
      setMultipleContacts([]);
      fetchContacts();

    } catch (error) {
      console.error("Erreur lors de la création multiple des contacts:", error);
      const errorMessage = error.response?.data?.errors || "Erreur lors de la création des contacts";
      toastify.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 p-4 min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Ajouter des Contacts
                </h1>
                {campaignId && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Pour la campagne sélectionnée
                  </p>
                )}
              </div>
            </div>
            
            {/* Sélecteur de mode */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setAddMode("single")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  addMode === "single"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <UserPlusIcon className="h-4 w-4 inline mr-2" />
                Contact unique
              </button>
              <button
                onClick={() => setAddMode("multiple")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  addMode === "multiple"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <UserGroupIcon className="h-4 w-4 inline mr-2" />
                Contacts multiples
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {addMode === "single" ? "Informations du contact" : "Ajouter un contact à la liste"}
              </h2>

              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(addMode === "single" ? onSubmitSingle : addContactToMultiple)}>
                  {/* Sélection de campagne */}
                  {!campaignId && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Campagne associée (optionnel)
                      </label>
                      <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Aucune campagne</option>
                        {campagnes.map((campagne) => (
                          <option key={campagne.id} value={campagne.id}>
                            {campagne.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations de base */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nom complet *
                      </label>
                      <input
                        {...register("nom")}
                        name="nom"
                        type="text"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Benjamin Roger"
                      />
                      {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        identifiant linkedin
                      </label>
                      <input
                        {...register("id")}
                        name="id"
                        type="text"
                        value={formData.id}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: ACoAABKK3OkBasO-okja9BV9WYedyaxnNkWqkn0"
                      />
                      {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        {...register("email")}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="contact@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Téléphone
                      </label>
                      <input
                        {...register("telephone")}
                        name="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="+33 1 23 45 67 89"
                      />
                      {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Localisation
                      </label>
                      <select
                        name="localisation"
                        {...register("localisation")}
                        onChange={handleChange}
                        value={formData.localisation}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une localisation</option>
                        {localisations.map((localisation) => (
                          <option key={localisation} value={localisation}>
                            {localisation}
                          </option>
                        ))}
                      </select>
                      {errors.localisation && <p className="text-red-500 text-xs mt-1">{errors.localisation.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Poste actuel
                      </label>
                      <input
                        {...register("posteActuel")}
                        name="posteActuel"
                        type="text"
                        value={formData.posteActuel}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Regional Manager - Francophone Africa"
                      />
                      {errors.posteActuel && <p className="text-red-500 text-xs mt-1">{errors.posteActuel.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Entreprise actuelle
                      </label>
                      <input
                        {...register("entrepriseActuelle")}
                        name="entrepriseActuelle"
                        type="text"
                        value={formData.entrepriseActuelle}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Polycea (ex Polyconseil)"
                      />
                      {errors.entrepriseActuelle && <p className="text-red-500 text-xs mt-1">{errors.entrepriseActuelle.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL LinkedIn
                      </label>
                      <input
                        {...register("url")}
                        name="url"
                        type="url"
                        value={formData.url}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.linkedin.com/in/..."
                      />
                      {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL Photo de profil
                      </label>
                      <input
                        name="profilImage"
                        type="url"
                        value={formData.profilImage}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Secteur
                      </label>
                      <select
                        name="secteurs"
                        {...register("secteurs")}
                        onChange={handleChange}
                        value={formData.secteurs}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un secteur</option>
                        {secteurs.map((secteur) => (
                          <option key={secteur} value={secteur}>
                            {secteur}
                          </option>
                        ))}
                      </select>
                      {errors.secteurs && <p className="text-red-500 text-xs mt-1">{errors.secteurs.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Statut
                      </label>
                      <select
                        name="statut"
                        {...register("statut")}
                        onChange={handleChange}
                        value={formData.statut}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        {statutOptions.map((statut) => (
                          <option key={statut} value={statut}>
                            {statut}
                          </option>
                        ))}
                      </select>
                      {errors.statut && <p className="text-red-500 text-xs mt-1">{errors.statut.message}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type de connexion
                      </label>
                      <select
                        name="connection"
                        {...register("connection")}
                        onChange={handleChange}
                        value={formData.connection}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner le type</option>
                        {connectionTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.connection && <p className="text-red-500 text-xs mt-1">{errors.connection.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parcours professionnel
                      </label>
                      <textarea
                        {...register("parcours")}
                        name="parcours"
                        value={formData.parcours}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Résumé du parcours professionnel..."
                      />
                      {errors.parcours && <p className="text-red-500 text-xs mt-1">{errors.parcours.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parcours éducation
                      </label>
                      <textarea
                        {...register("parcoursEducation")}
                        name="parcoursEducation"
                        value={formData.parcoursEducation}
                        onChange={handleChange}
                        rows={2}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Formation et éducation..."
                      />
                      {errors.parcoursEducation && <p className="text-red-500 text-xs mt-1">{errors.parcoursEducation.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message personnalisé
                      </label>
                      <textarea
                        {...register("messagePersonnalise")}
                        name="messagePersonnalise"
                        value={formData.messagePersonnalise}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Message d'approche personnalisé..."
                      />
                      {errors.messagePersonnalise && <p className="text-red-500 text-xs mt-1">{errors.messagePersonnalise.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes
                      </label>
                      <textarea
                        {...register("notes")}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Notes et commentaires..."
                      />
                      {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                        addMode === "single" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-green-600 hover:bg-green-700"
                      } ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting 
                        ? "Traitement..." 
                        : addMode === "single" 
                          ? "Créer le contact" 
                          : "Ajouter à la liste"
                      }
                    </button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>

          {/* Panneau latéral pour les contacts multiples */}
          {addMode === "multiple" && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contacts à créer
                  </h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full">
                    {multipleContacts.length}
                  </span>
                </div>

                {multipleContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Aucun contact ajouté pour le moment
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                      {multipleContacts.map((contact) => (
                        <div key={contact.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {contact.nom}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">
                                {contact.posteActuel}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {contact.entrepriseActuelle}
                              </p>
                              {contact.email && (
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                  {contact.email}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeContactFromMultiple(contact.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={onSubmitMultiple}
                      disabled={isSubmitting}
                      className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting 
                        ? "Création en cours..." 
                        : `Créer ${multipleContacts.length} contact${multipleContacts.length > 1 ? 's' : ''}`
                      }
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer />
    </section>
  );
}

export default CreateContact;