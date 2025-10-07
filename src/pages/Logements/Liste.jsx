import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Save, X, Filter, ArrowUpDown, MapPin, Home, Users, Bed, Eye, Settings, MoreHorizontal, CheckCircle, Clock, AlertCircle, Euro, Trash2, Edit, Power } from 'lucide-react';
import { getLogements, updateLogement, deleteLogement, getLogementsByView,runLogement } from '@/services/Logement';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLogement, setSelectedLogement] = useState(null);

  useEffect(() => {
    fetchLogements();
  }, [currentPage, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };


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

      // Mapper les filtres vers les noms de vues Airtable
      const viewMapping = {
        'all': 'Grid view', // Vue par défaut
        'actif': 'Logements Actifs', // Nom de votre vue dans Airtable
        'inactif': 'Logements Inactifs',
        'optimized': 'Logements Optimisés',
        'analyzed': 'Logements Analysés',
        'pending': 'En Attente'
      };

      const viewName = viewMapping[filterStatus] || 'Grid view';
      const response = await getLogementsByView(viewName, params);

      setLogements(response.data.logements);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
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

  const handleRunInstructions=async (logement)=>{
    try {
      const resp=await runLogement(logement.id);
    } catch (error) {
      console.log(error);
    }
  }

  const handleSaveCell = async (logementId, field) => {
    try {
      const fieldMapping = {
        nom: 'Nom',
        ville: 'Ville',
        basePrice: 'BasePrice',
        MinPrice: 'MinPrice',
        MaxPrice: 'MaxPrice',
        Offset: 'Offset',
        instructions: 'Instructions'
      };

      const airtableField = fieldMapping[field] || field;
      let valueToSave = editingValue;

      // Conversion pour les champs numériques
      if (['basePrice', 'MinPrice', 'MaxPrice'].includes(field)) {
        valueToSave = parseFloat(editingValue);
      } else if (field === 'Offset') {
        valueToSave = parseFloat(editingValue) / 100; // Convertir en pourcentage pour Airtable
      }

      await updateLogement(logementId, { [airtableField]: valueToSave });

      // Mise à jour locale
      setLogements(prev =>
        prev.map(log =>
          log.id === logementId ? { ...log, [field]: editingValue } : log
        )
      );

      setEditingCell(null);
      setEditingValue('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleToggleActif = async (logementId, currentStatus) => {
    try {
      await updateLogement(logementId, { 'Etat': !currentStatus });

      setLogements(prev =>
        prev.map(log =>
          log.id === logementId ? { ...log, etat: !currentStatus } : log
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };
  const handleDeleteClick = (logement) => {
    setSelectedLogement(logement);
    setShowDeleteModal(true);
  };

  const handleEditClick = (logement) => {
    setSelectedLogement(logement);
    setShowEditModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteLogement(selectedLogement.id);

      setLogements(prev => prev.filter(log => log.id !== selectedLogement.id));
      setShowDeleteModal(false);
      setSelectedLogement(null);

      // Recharger les données pour mettre à jour les totaux
      fetchLogements();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du logement');
    }
  };

  const handleEditSave = async () => {
    try {
      const updateData = {
        'Nom': selectedLogement.nom,
        'Typologie': selectedLogement.typologie,
        'Ville': selectedLogement.ville,
        'country': selectedLogement.country,
        'Capacité': selectedLogement.capacite,
        'Nbr_chambre': selectedLogement.nbrChambre,
        'Nbr_lit': selectedLogement.nbrLit,
        'BasePrice': selectedLogement.basePrice,
        'MinPrice': selectedLogement.minPrice,
        'MaxPrice': selectedLogement.maxPrice,
        'Offset': selectedLogement.offset / 100, // Convertir en pourcentage pour Airtable
        'Etat': selectedLogement.etat
      };

      await updateLogement(selectedLogement.id, updateData);

      setLogements(prev =>
        prev.map(log =>
          log.id === selectedLogement.id ? selectedLogement : log
        )
      );

      setShowEditModal(false);
      setSelectedLogement(null);

      // Recharger pour s'assurer de la cohérence
      fetchLogements();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    }
  };

  const getStatusIcon = (scrape, predit) => {
    if (scrape === 'Fait' && predit === 'Oui') {
      return <CheckCircle className="w-4 h-4 text-primary-500" />;
    } else if (scrape === 'Fait') {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
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
            className="px-2 py-1 bg-bleu-fonce/50 border border-primary-500 rounded text-sm text-blanc-pur focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveCell(logement.id, field);
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <button onClick={() => handleSaveCell(logement.id, field)} className="p-1 text-primary-500 hover:text-primary-400">
            <Save className="w-3 h-3" />
          </button>
          <button onClick={handleCancelEdit} className="p-1 text-secondary-500 hover:text-secondary-400">
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div
        className={`group cursor-pointer hover:bg-primary-500/10 px-2 py-1 rounded transition-all duration-300 ${className}`}
        onClick={() => handleEditCell(logement.id, field, value)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-blanc-pur">{value || 'Ajouter'}</span>
          <Edit3 className="w-3 h-3 text-primary-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const filteredLogements = logements.filter(logement => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'actif') return logement.etat === true;
    if (filterStatus === 'inactif') return logement.etat === false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce relative overflow-hidden">
      {/* Effets de particules */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grille de circuits */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00CFFF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 p-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-bleu-fonce/90 via-noir-absolu/90 to-bleu-fonce/90 rounded-xl border border-primary-500/30 shadow-neon-gradient backdrop-blur-xl mb-6 relative overflow-hidden">
          {/* Glow animé */}
          <div className="absolute inset-0 border border-primary-500/50 rounded-xl animate-pulse pointer-events-none"></div>
          <div className="absolute -inset-0.5 bg-gradient-primary opacity-10 blur-xl animate-pulse"></div>

          {/* Header Content */}
          <div className="relative p-8 border-b border-primary-500/20">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                    <polygon points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43" fill="none" stroke="#00CFFF" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexagons)" />
              </svg>
            </div>

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                <h1 className="text-3xl font-bold text-blanc-pur tracking-[0.2em] uppercase relative">
                  <span className="relative z-10">LOGEMENTS</span>
                  <div className="absolute inset-0 bg-gradient-primary bg-clip-text text-transparent animate-pulse opacity-50"></div>
                </h1>

                <div className="hidden md:flex items-center space-x-2 bg-noir-absolu/50 px-4 py-2 rounded-full border border-primary-500/30">
                  <span className="text-xs text-primary-500 uppercase tracking-wider">Total:</span>
                  <span className="text-sm font-bold text-blanc-pur font-mono">{totalItems}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/80 text-primary-500 px-6 py-3 rounded-lg border border-primary-500/30 hover:border-primary-500 transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <div className="mt-4 flex items-center space-x-4">
                      <select
                        id="filter-status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-bleu-fonce/50 border border-bleu-fonce-500/30 rounded-lg text-blanc-pur focus:outline-none focus:border-primary-500"
                      >
                        <option value="all">Tous</option>
                        <option value="actif">Actifs uniquement</option>
                        <option value="inactif">Inactifs uniquement</option>
                      </select>
                    </div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>

                <button className="relative bg-gradient-primary text-noir-absolu px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-neon-gradient overflow-hidden group">
                  <span className="relative z-10 flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Nouveau</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blanc-pur/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative group">
              <div className="absolute -inset-0.5 bg-gradient-primary rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-bleu-fonce/50 border border-primary-500/30 rounded-lg overflow-hidden">
                <div className="flex items-center px-4">
                  <Search className="w-5 h-5 text-primary-500" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, ville, pays..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-4 py-3 bg-transparent text-blanc-pur placeholder-blanc-pur/50 focus:outline-none"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-primary w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 flex items-center space-x-4">
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:outline-none focus:border-primary-500"
                >
                  <option value="all">Tous</option>
                  <option value="actif">Actifs uniquement</option>
                  <option value="inactif">Inactifs uniquement</option>
                </select>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-6">
            {[
              { icon: Home, label: "Total", value: totalItems, color: "primary" },
              { icon: CheckCircle, label: "Optimisés", value: logements.filter(l => l.scrape === 'Fait' && l.predit === 'Oui').length, color: "primary" },
              { icon: Clock, label: "Analysés", value: logements.filter(l => l.scrape === 'Fait' && l.predit === 'Non').length, color: "yellow" },
              { icon: AlertCircle, label: "En attente", value: logements.filter(l => l.scrape === 'En attente').length, color: "gray" }
            ].map((stat, idx) => (
              <div key={idx} className="relative bg-gradient-to-br from-bleu-fonce/60 to-noir-absolu/60 p-4 rounded-lg border border-primary-500/20 backdrop-blur-sm overflow-hidden group hover:border-primary-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="relative z-10 flex items-center space-x-3">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
                  <div>
                    <p className="text-xs text-blanc-pur/60 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-blanc-pur font-mono">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-b from-bleu-fonce/90 to-noir-absolu/90 rounded-xl border border-primary-500/30 shadow-neon-gradient backdrop-blur-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-secondary-500/30 border-t-secondary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-bleu-fonce via-noir-absolu to-bleu-fonce">
                  <tr>
                    {[
                      { key: 'nom', label: 'Logement' },
                      { key: 'ville', label: 'Localisation' },
                      { key: 'caracteristiques', label: 'Caractéristiques' },
                      { key: 'basePrice', label: 'Prix de Base' },
                      { key: 'minPrice', label: 'Prix Min.' },
                      { key: 'maxPrice', label: 'Prix Max.' },
                      { key: 'offset', label: 'Offset' },
                      { key: 'actif', label: 'Actif' },
                      { key: 'Run', label: 'Run' },
                      { key: 'actions', label: 'Action' },
                    ].map((col, idx) => (
                      <th
                        key={col.key}
                        className="px-6 py-4 text-left cursor-pointer hover:bg-primary-500/5 transition-all duration-300 relative group"
                        onClick={() => col.key !== 'actions' && col.key !== 'caracteristiques' && handleSort(col.key)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase text-blanc-pur/90 tracking-wider group-hover:text-primary-500 transition-colors">
                            {col.label}
                          </span>
                          {sortBy === col.key && (
                            <span className="text-primary-500">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                          )}
                        </div>
                        {idx < 8 && <div className="absolute right-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-primary-500/30 to-transparent"></div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogements.map((logement, idx) => (
                    <tr key={logement.id} className="border-b border-primary-500/10 hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-secondary-500/5 transition-all duration-300 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Home className="w-6 h-6 text-noir-absolu" />
                          </div>
                          <div>
                            <EditableCell logement={logement} field="nom" value={logement.nom} className="font-bold" />
                            <p className="text-xs text-blanc-pur/60">{logement.typologie}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          <div>
                            <EditableCell logement={logement} field="ville" value={logement.ville} />
                            <p className="text-xs text-blanc-pur/60">{logement.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-primary-400" />
                            <span className="text-blanc-pur">{logement.capacite}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Home className="w-4 h-4 text-secondary-400" />
                            <span className="text-blanc-pur">{logement.nbrChambre}ch</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bed className="w-4 h-4 text-primary-300" />
                            <span className="text-blanc-pur">{logement.nbrLit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Euro className="w-4 h-4 text-blanc-pur/80" />
                          <EditableCell logement={logement} field="basePrice" value={logement.basePrice} className="text-blanc-pur font-bold" isNumeric={true} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Euro className="w-4 h-4 text-primary-500" />
                          <EditableCell logement={logement} field="MinPrice" value={logement.minPrice} className="text-primary-500 font-bold" isNumeric={true} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Euro className="w-4 h-4 text-secondary-500" />
                          <EditableCell logement={logement} field="MaxPrice" value={logement.maxPrice} className="text-secondary-500 font-bold" isNumeric={true} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <EditableCell logement={logement} field="Offset" value={`${logement.offset}%`} className="text-blanc-pur" isNumeric={true} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActif(logement.id, logement.etat)}
                          className={`relative group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${logement.etat
                            ? 'bg-primary-500/20 border border-primary-500/50'
                            : 'bg-gray-500/20 border border-gray-500/50'
                            }`}
                        >
                          <Power
                            className={`w-4 h-4 transition-colors ${logement.etat ? 'text-primary-500' : 'text-gray-500'
                              }`}
                          />
                          <span
                            className={`text-sm font-bold ${logement.etat ? 'text-primary-500' : 'text-gray-500'
                              }`}
                          >
                            {logement.etat ? 'ON' : 'OFF'}
                          </span>
                          {logement.etat && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRunInstructions(logement)}
                          disabled={!logement.etat}
                          className={`relative group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${logement.etat
                              ? 'bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 cursor-pointer'
                              : 'bg-gray-500/20 border border-gray-500/50 cursor-not-allowed opacity-50'
                            }`}
                        >
                          <CheckCircle
                            className={`w-4 h-4 transition-colors ${logement.etat ? 'text-blue-500' : 'text-gray-500'
                              }`}
                          />
                          <span
                            className={`text-sm font-bold ${logement.etat ? 'text-blue-500' : 'text-gray-500'
                              }`}
                          >
                            Run
                          </span>
                          {logement.etat && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(logement)}
                            className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors group"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(logement)}
                            className="p-2 hover:bg-secondary-500/20 rounded-lg transition-colors group"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-secondary-500 group-hover:scale-110 transition-transform" />
                          </button>
                          <button className="p-2 hover:bg-blanc-pur/20 rounded-lg transition-colors group" title="Plus d'options">
                            <MoreHorizontal className="w-4 h-4 text-blanc-pur group-hover:rotate-90 transition-transform" />
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
            <div className="p-6 border-t border-primary-500/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blanc-pur/70">
                  Affichage de {(currentPage - 1) * limit + 1} à {Math.min(currentPage * limit, totalItems)} sur {totalItems}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur disabled:opacity-30 hover:border-primary-500 transition-all"
                  >
                    Précédent
                  </button>
                  <span className="text-blanc-pur">Page {currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur disabled:opacity-30 hover:border-primary-500 transition-all"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-absolu/80 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce border border-secondary-500/50 rounded-xl p-8 max-w-md w-full shadow-neon-gradient">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-20 blur-xl animate-pulse"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-secondary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-blanc-pur uppercase tracking-wider">Confirmer la suppression</h3>
                </div>

                <div className="mb-6 p-4 bg-noir-absolu/50 rounded-lg border border-secondary-500/30">
                  <p className="text-blanc-pur/80 mb-2">
                    Êtes-vous sûr de vouloir supprimer ce logement ?
                  </p>
                  <p className="text-primary-500 font-bold">{selectedLogement?.nom}</p>
                  <p className="text-blanc-pur/60 text-sm mt-1">{selectedLogement?.ville}, {selectedLogement?.country}</p>
                </div>

                <p className="text-secondary-500 text-sm mb-6">
                  Cette action est irréversible et supprimera toutes les données associées.
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-bleu-fonce/50 border border-blanc-pur/30 rounded-lg text-blanc-pur hover:border-blanc-pur transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg text-blanc-pur font-bold hover:scale-105 transition-all duration-300 shadow-neon-violet"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition */}
        {showEditModal && selectedLogement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-absolu/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce border border-primary-500/50 rounded-xl p-8 max-w-2xl w-full shadow-neon-gradient my-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 blur-xl animate-pulse"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <Edit className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-bold text-blanc-pur uppercase tracking-wider">Modifier le logement</h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-secondary-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-blanc-pur" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Nom</label>
                      <input
                        type="text"
                        value={selectedLogement.nom}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, nom: e.target.value })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Typologie</label>
                      <input
                        type="text"
                        value={selectedLogement.typologie}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, typologie: e.target.value })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Ville</label>
                      <input
                        type="text"
                        value={selectedLogement.ville}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, ville: e.target.value })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Pays</label>
                      <input
                        type="text"
                        value={selectedLogement.country}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, country: e.target.value })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Capacité</label>
                      <input
                        type="number"
                        value={selectedLogement.capacite}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, capacite: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Chambres</label>
                      <input
                        type="number"
                        value={selectedLogement.nbrChambre}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, nbrChambre: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Lits</label>
                      <input
                        type="number"
                        value={selectedLogement.nbrLit}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, nbrLit: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-secondary-500 uppercase tracking-wider mb-2">Prix de base (€)</label>
                      <input
                        type="number"
                        value={selectedLogement.basePrice}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, basePrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-secondary-500/30 rounded-lg text-blanc-pur focus:border-secondary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-secondary-500 uppercase tracking-wider mb-2">Prix min (€)</label>
                      <input
                        type="number"
                        value={selectedLogement.minPrice}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, minPrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-secondary-500/30 rounded-lg text-blanc-pur focus:border-secondary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-secondary-500 uppercase tracking-wider mb-2">Prix max (€)</label>
                      <input
                        type="number"
                        value={selectedLogement.maxPrice}
                        onChange={(e) => setSelectedLogement({ ...selectedLogement, maxPrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-bleu-fonce/50 border border-secondary-500/30 rounded-lg text-blanc-pur focus:border-secondary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Offset (%)</label>
                    <input
                      type="number"
                      value={selectedLogement.offset}
                      onChange={(e) => setSelectedLogement({ ...selectedLogement, offset: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Statut</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSelectedLogement({ ...selectedLogement, actif: !selectedLogement.actif })}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${selectedLogement.actif
                          ? 'bg-primary-500/20 border border-primary-500'
                          : 'bg-gray-500/20 border border-gray-500/50'
                          }`}
                      >
                        <Power className={`w-5 h-5 ${selectedLogement.actif ? 'text-primary-500' : 'text-gray-500'}`} />
                        <span className={`font-bold ${selectedLogement.actif ? 'text-primary-500' : 'text-gray-500'}`}>
                          {selectedLogement.actif ? 'ACTIF' : 'INACTIF'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6 pt-6 border-t border-primary-500/20">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 bg-bleu-fonce/50 border border-blanc-pur/30 rounded-lg text-blanc-pur hover:border-blanc-pur transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="flex-1 px-6 py-3 bg-gradient-primary rounded-lg text-noir-absolu font-bold hover:scale-105 transition-all duration-300 shadow-neon-gradient"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Liste;