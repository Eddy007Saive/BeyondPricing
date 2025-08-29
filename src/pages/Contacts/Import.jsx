import React, { useState, useEffect } from "react";
import { getProduits, getFournisseurs, getCategories,importFile } from "@/services";
import * as XLSX from "xlsx";
import { parse } from "papaparse";
import toastify from "@/utils/toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ImportProduits() {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Preview, 3: Mapping, 4: Complete
  const [columnMapping, setColumnMapping] = useState({
    nom: "",
    prix: "",
    description: "",
    categorieId: "",
    qte: "",
    seuilAlerte: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Définir les champs requis pour l'importation
  const requiredFields = ["nom", "prix", "qte"];
  const allFields = [...Object.keys(columnMapping)];

  useEffect(() => {
    fetchProduits();
    fetchFournisseurs();
    fetchCategories();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await getProduits();
      setProduits(response.data);
    } catch (error) {
      toastify.error("Erreur lors du chargement des produits");
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await getFournisseurs();
      setFournisseurs(response.data);
    } catch (error) {
      toastify.error("Erreur lors du chargement des fournisseurs");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      toastify.error("Erreur lors du chargement des catégories");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (selectedFile) => {
    setIsProcessing(true);

    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'csv') {
      parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          handleParsedData(results.data);
          setIsProcessing(false);
        },
        error: (error) => {
          toastify.error("Erreur lors de l'analyse du fichier CSV");
          setIsProcessing(false);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExt)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);
          handleParsedData(parsedData);
        } catch (error) {
          toastify.error("Erreur lors de l'analyse du fichier Excel");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      toastify.error("Format de fichier non supporté. Veuillez utiliser CSV, XLS ou XLSX.");
      setIsProcessing(false);
    }
  };

  const handleParsedData = (data) => {
    if (data && data.length > 0) {
      // Prendre les 5 premières lignes pour l'aperçu
      setPreviewData(data.slice(0, 5));
      
      // Passer à l'étape de prévisualisation
      setImportStep(2);
      
      // Auto-mapper les colonnes si les noms correspondent
      const firstRow = data[0];
      const availableColumns = Object.keys(firstRow);
      
      const newMapping = { ...columnMapping };
      
      // Tentative de mappage automatique basé sur les noms de colonnes
      Object.keys(newMapping).forEach(fieldName => {
        // Recherche exacte
        const exactMatch = availableColumns.find(col => 
          col.toLowerCase() === fieldName.toLowerCase()
        );
        
        // Recherche avec contient
        const partialMatch = !exactMatch ? availableColumns.find(col => 
          col.toLowerCase().includes(fieldName.toLowerCase())
        ) : null;
        
        if (exactMatch) {
          newMapping[fieldName] = exactMatch;
        } else if (partialMatch) {
          newMapping[fieldName] = partialMatch;
        }
      });
      
      setColumnMapping(newMapping);
    } else {
      toastify.error("Le fichier est vide ou son format est incorrect");
    }
  };

  const handleMappingChange = (field, column) => {
    setColumnMapping({
      ...columnMapping,
      [field]: column
    });
  };

  const validateMapping = () => {
    // Vérifier si tous les champs requis sont mappés
    const unmappedRequiredFields = requiredFields.filter(field => !columnMapping[field]);
    
    if (unmappedRequiredFields.length > 0) {
      toastify.error(`Veuillez mapper les champs requis: ${unmappedRequiredFields.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const proceedToDataMapping = () => {
    setImportStep(3);
  };

  const processImport = async () => {
    if (!validateMapping()) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(columnMapping));
      const response = await importFile(formData,config);
      toastify.success("Importation réussie");
      setImportStep(4);
      setIsProcessing(false);
      
    } catch (error) {
      toastify.error("Erreur lors de l'importation des produits");
      console.log(error);
      
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setImportStep(1);
    setColumnMapping({
      nom: "",
      prix: "",
      description: "",
      categorieId: "",
      qte: "",
      seuilAlerte: ""
    });
    setIsProcessing(false);
  };

  // Fonction pour obtenir les colonnes disponibles du fichier
  const getAvailableColumns = () => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  // Fonction pour générer un modèle de fichier d'importation
  const generateTemplate = () => {
    const templateData = [
      {
        nom: "Exemple Produit",
        prix: 100,
        description: "Description du produit",
        categorieId: categories[0]?.id || "",
        qte: 10,
        seuilAlerte: 5
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");
    XLSX.writeFile(workbook, "modele_import_produits.xlsx");
  };

  return (
    <section className="bg-white dark:bg-gray-900 p-4">
      <div className="mx-auto lg:py-8 md:grid-cols-1 gap-8">
        <div className="shadow-lg p-6 rounded-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Importation de Produits
          </h2>

          {/* Étape 1: Téléchargement du fichier */}
          {importStep === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Cliquez pour importer</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  XLSX, XLS ou CSV (Max. 10MB)
                </p>
                
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                
                <label
                  htmlFor="file-upload"
                  className="mt-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Sélectionner un fichier
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={generateTemplate}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Télécharger un modèle
                </button>
                
                <div className="text-xs text-gray-500">
                  <p>Formats acceptés: XLSX, XLS, CSV</p>
                  <p>Champs requis: Nom, Prix, Quantité</p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Prévisualisation des données */}
          {importStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Aperçu des données</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vérifiez que vos données sont correctement importées avant de continuer.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {previewData[0] && Object.keys(previewData[0]).map((header, index) => (
                          <th 
                            key={index}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((cell, cellIndex) => (
                            <td 
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={resetImport}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
                >
                  Annuler
                </button>
                
                <button
                  onClick={proceedToDataMapping}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Mapping des colonnes */}
          {importStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Mapper les colonnes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Associez les colonnes de votre fichier aux champs du système. Les champs avec * sont obligatoires.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  {allFields.map(field => (
                    <div key={field} className="flex items-center">
                      <div className="w-1/3">
                        <label className="block text-sm font-medium text-gray-700">
                          {field} {requiredFields.includes(field) && <span className="text-red-500">*</span>}
                        </label>
                      </div>
                      <div className="w-2/3">
                        <select
                          value={columnMapping[field]}
                          onChange={(e) => handleMappingChange(field, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="">-- Sélectionner une colonne --</option>
                          {getAvailableColumns().map(column => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setImportStep(2)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
                >
                  Retour
                </button>
                
                <button
                  onClick={processImport}
                  disabled={isProcessing}
                  className={`${
                    isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white py-2 px-4 rounded-md`}
                >
                  {isProcessing ? 'Traitement en cours...' : 'Importer les données'}
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Importation terminée */}
          {importStep === 4 && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importation réussie!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Vos produits ont été importés avec succès dans le système.
              </p>
              <button
                onClick={resetImport}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Nouvelle importation
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}

export default ImportProduits;