import React, { useState, useEffect } from "react";
import Select from "react-select";
import {  getProduits } from "../services/Campagne";

const ProduitSelect = ({ onSelectChange }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Remplace cette requête par celle qui récupère tous les employés
        const response = await getProduits();
        let produits=response.data.produits;

        // Formatage des options pour react-select
        const formattedOptions = produits.map((prod) => ({
          id: prod.id,
          label: prod.nom,
          prix:prod.prix
        }));

        setOptions(formattedOptions);
      } catch (error) {
        console.error("Erreur de récupération:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (selected) => {
    setSelectedOption(selected);
    onSelectChange(selected); // Appelle la fonction passée en prop
  };

  return (
    <div>
      <h2>Produit :</h2>
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Sélectionner un Produit..."
      />
    </div>
  );
};

export default ProduitSelect;
