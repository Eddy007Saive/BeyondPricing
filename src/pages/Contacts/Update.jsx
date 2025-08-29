import React, { useEffect, useState } from "react";
import { updateProduit, getProduitById } from "@/services/Campagne";
import { getFournisseurs, getCategories } from "@/services";
import toastify from "@/utils/toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProduitSchema } from "@/validations/ProduitSchema";
import { useParams, useNavigate } from "react-router-dom";

export function Update() {
  const [fournisseurs, setFournisseur] = useState([]);
  const [categories, setCategorie] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prix: "",
    description: "",
    fournisseurId: "",
    categorieId: "",
    image: "",
    qte: "",
    seuilAlerte: 0
  });

  useEffect(() => {
    if (id) {
      fetchProduit(id);
      fetchFournisseurs();
      fetchCategories();
    }
  }, [id]);

  const fetchProduit = async (id) => {
    try {
      const response = await getProduitById(id);
      setFormData({
        nom: response.nom,
        prix: response.prix,
        description: response.description,
        fournisseurId: response.fournisseurId,
        categorieId: response.categorieId,
        image: response.image,
        qte: response.totalQuantite,
        seuilAlerte: response.seuilAlerte
      });
      
      // Définir l'aperçu de l'image existante
      if (response.image) {
        setImagePreview(`http://localhost:3000/${response.image}`);
      }
    } catch (error) {
      toastify.error("Erreur lors de la récupération du produit");
      console.error(error);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await getFournisseurs();
      setFournisseur(response.data);
    } catch (error) {
      toastify.error("Erreur lors de la récupération des fournisseurs");
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategorie(response.data);
    } catch (error) {
      toastify.error("Erreur lors de la récupération des catégories");
      console.error(error);
    }
  };

  const methods = useForm({
    resolver: yupResolver(ProduitSchema),
    defaultValues: formData
  });

  useEffect(() => {
    methods.reset(formData);
  }, [formData, methods]);

  const { register, handleSubmit, reset, formState: { errors } } = methods;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Créer un aperçu de l'image sélectionnée
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const onSubmit = async () => {
    try {
      const form = new FormData();
      
      // N'ajouter l'image que si une nouvelle a été sélectionnée
      if (image) {
        form.append("image", image);
      }
      
      // Ajouter tous les autres champs du formulaire
      for (let key in formData) {
        form.append(key, formData[key]);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const response = await updateProduit(id, form, config);
      
      toastify.success(response.message || "Produit mis à jour avec succès");
      // Redirection vers la liste des produits après la mise à jour
      setTimeout(() => {
        navigate("/produits"); // Ajustez le chemin selon votre routage
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);

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
      <div className="mx-auto max-w-6xl lg:py-8 grid grid-cols-1 gap-8">
        <div className="shadow-lg p-4 rounded-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Modifier un Produit
          </h2>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <div className="grid grid-cols-1 gap-6">
                {/* Image Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-lg border border-gray-300">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Aperçu du produit"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!imagePreview && formData.image && (
                      <img
                        src={`http://localhost:3000/${formData.image}`}
                        alt="Produit"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!imagePreview && !formData.image && (
                      <div className="flex items-center justify-center h-full w-full">
                        <span className="text-gray-500">Aucune image</span>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="image"
                    className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Image (laissez vide pour conserver l'image actuelle)
                  </label>
                  <input
                    onChange={handleImageChange}
                    type="file"
                    id="image"
                    name="image"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    accept="image/*"
                  />
                </div>

                {/* Champs du formulaire */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Nom du produit</label>
                    <input
                      {...register("nom")}
                      value={formData.nom}
                      name="nom"
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Fournisseur</label>
                    <select
                      name="fournisseurId"
                      id="fournisseurId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("fournisseurId")}
                      onChange={handleChange}
                      value={formData.fournisseurId}
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {fournisseurs.map((fournisseur) => (
                        <option key={fournisseur.id} value={fournisseur.id}>
                          {fournisseur.nom}
                        </option>
                      ))}
                    </select>
                    {errors.fournisseurId && <p className="text-red-500 text-xs">{errors.fournisseurId.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Catégorie</label>
                    <select
                      name="categorieId"
                      id="categorieId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      {...register("categorieId")}
                      onChange={handleChange}
                      value={formData.categorieId}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((categorie) => (
                        <option key={categorie.id} value={categorie.id}>
                          {categorie.nom}
                        </option>
                      ))}
                    </select>
                    {errors.categorieId && <p className="text-red-500 text-xs">{errors.categorieId.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Prix</label>
                    <input
                      {...register("prix")}
                      value={formData.prix}
                      name="prix"
                      type="number"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.prix && <p className="text-red-500 text-xs">{errors.prix.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Seuil d'alerte</label>
                    <input
                      {...register("seuilAlerte")}
                      value={formData.seuilAlerte}
                      name="seuilAlerte"
                      type="number"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.seuilAlerte && <p className="text-red-500 text-xs">{errors.seuilAlerte.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Quantité</label>
                    <input
                      {...register("qte")}
                      value={formData.qte}
                      name="qte"
                      type="number"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.qte && <p className="text-red-500 text-xs">{errors.qte.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium">Description</label>
                    <textarea
                      {...register("description")}
                      value={formData.description}
                      name="description"
                      rows="3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      onChange={handleChange}
                    />
                    {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/produits")}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
        <div className="hidden md:block">
          {/* Vous pourriez ajouter une prévisualisation du produit ici */}
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}

export default Update;