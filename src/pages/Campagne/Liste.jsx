import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Save, X, Filter, ArrowUpDown, MapPin, Home, Users, Bed, DollarSign, Eye, Settings, MoreHorizontal, CheckCircle, Clock, AlertCircle, EuroIcon } from 'lucide-react';
import { getLogements,updateLogement } from '@/services/Logement';



export const Liste = () => {
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    fetchLogements();
  }, [currentPage, searchTerm, filterStatus, sortBy, sortOrder]);

  const fetchLogements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        sortBy,
        sortOrder
      };
      
      const response = await getLogements(params); // Remplacez par getLogements(params)
      setLogements(response.data.logements);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  const handleEditCell = (logementId, field, currentValue) => {
    setEditingCell(`${logementId}-${field}`);
    setEditingValue(currentValue || '');
  };

  // Fonction pour convertir la valeur selon le type de champ
  const convertValueByField = (field, value) => {
    // Champs qui doivent être des nombres
    if (field === 'MinPrice' || field === 'MaxPrice') {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : numValue;
    }
    // Autres champs restent en string
    return value;
  };

const handleSaveCell = async (logementId, field) => {
  try {
    let newValue;

    if (field === "Offset") {
      // Transformer en decimal pour Airtable
      const numericValue = parseFloat(editingValue);
      newValue = !isNaN(numericValue) ? numericValue / 100 : 0;
    } else {
      // Pour les autres champs, utiliser la conversion standard
      newValue = convertValueByField(field, editingValue);
    }

    const updateData = { [field]: newValue };

    // Mettre à jour Airtable
    await updateLogement(logementId, updateData);
    await fetchLogements();

    // Mettre à jour localement
    setLogements(prev =>
      prev.map(logement =>
        logement.id === logementId
          ? { ...logement, [field]: newValue }
          : logement
      )
    );

    // Reset édition
    setEditingCell(null);
    setEditingValue('');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    // Optionnel : afficher un message à l'utilisateur
  }
};


  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const getStatusIcon = (scrape, predit) => {
    if (scrape === 'Fait' && predit === 'Oui') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (scrape === 'Fait') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = (scrape, predit) => {
    if (scrape === 'Fait' && predit === 'Oui') return 'Optimisé';
    if (scrape === 'Fait') return 'Analysé';
    return 'En attente';
  };

  const EditableCell = ({ logement, field, value, className = "", isNumeric = false }) => {
    const cellId = `${logement.id}-${field}`;
    const isEditing = editingCell === cellId;



    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type={isNumeric ? "number" : "text"}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveCell(logement.id, field);
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
            min={isNumeric ? "0" : undefined}
            step={isNumeric ? "0.01" : undefined}
          />
          <button
            onClick={() => handleSaveCell(logement.id, field)}
            className="p-1 text-green-600 hover:text-green-700"
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`group cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${className}`}
        onClick={() => handleEditCell(logement.id, field, value)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-900">{value || 'Cliquer pour ajouter'}</span>
          <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const filteredLogements = logements.filter(logement => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'optimized') return logement.scrape === 'Fait' && logement.predit === 'Oui';
    if (filterStatus === 'analyzed') return logement.scrape === 'Fait' && logement.predit === 'Non';
    if (filterStatus === 'pending') return logement.scrape === 'En attente';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Logements</h1>
              <p className="text-sm text-gray-600 mt-1">Optimisez vos tarifs et gérez vos propriétés</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Ajouter un logement</span>
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, pays..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {showFilters && (
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="optimized">Optimisé</option>
                  <option value="analyzed">Analysé</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total logements</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Optimisés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logements.filter(l => l.scrape === 'Fait' && l.predit === 'Oui').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Analysés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logements.filter(l => l.scrape === 'Fait' && l.predit === 'Non').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logements.filter(l => l.scrape === 'En attente').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('nom')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Logement</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('ville')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Localisation</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caractéristiques
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('minPrice')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Prix min.</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('maxPrice')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Prix max.</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>

                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('Offset')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Offset</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogements.map((logement) => (
                    <tr key={logement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <EditableCell 
                              logement={logement}
                              field="nom"
                              value={logement.nom}
                              className="font-medium text-gray-900"
                            />
                            <p className="text-sm text-gray-500">{logement.typologie}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          <div>
                            <EditableCell 
                              logement={logement}
                              field="ville"
                              value={logement.ville}
                            />
                            <p className="text-xs text-gray-500">{logement.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-1" />
                            <span>{logement.capacite}</span>
                          </div>
                          <div className="flex items-center">
                            <Home className="w-4 h-4 text-gray-400 mr-1" />
                            <span>{logement.nbrChambre}ch</span>
                          </div>
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 text-gray-400 mr-1" />
                            <span>{logement.nbrLit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <EuroIcon className="w-4 h-4 text-green-600 mr-1" />
                          <EditableCell 
                            logement={logement}
                            field="MinPrice"
                            value={`${logement.minPrice}`}
                            className="font-medium text-green-600"
                            isNumeric={true}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <EuroIcon className="w-4 h-4 text-green-600 mr-1" />
                          <EditableCell 
                            logement={logement}
                            field="MaxPrice"
                            value={`${logement.maxPrice}`}
                            className="font-medium text-green-600"
                            isNumeric={true}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <EditableCell 
                            logement={logement}
                            field="Offset"
                            value={`${logement.offset}`}
                            className="font-medium text-green-600"
                            isNumeric={true}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(logement.scrape, logement.predit)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getStatusText(logement.scrape, logement.predit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <EditableCell 
                          logement={logement}
                          field="instructions"
                          value={logement.instructions}
                          className="text-sm text-gray-600 max-w-xs"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 p-1">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 p-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {(currentPage - 1) * limit + 1} à {Math.min(currentPage * limit, totalItems)} sur {totalItems} logements
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Liste;