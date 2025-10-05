import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Save, X, Filter, Calendar, MapPin, AlertCircle, Trash2, Edit, Zap } from 'lucide-react';
import { getEvenements, updateEvenement, deleteEvenement, createEvenement } from '@/services/Evenement';

export  function ListeEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [filterIntensite, setFilterIntensite] = useState('all');
  const [sortBy, setSortBy] = useState('date');
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvenement, setSelectedEvenement] = useState(null);
  const [newEvenement, setNewEvenement] = useState({
    nom_ferie: '',
    date: '',
    zone: '',
    intensite: ''
  });

  useEffect(() => {
    fetchEvenements();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        sortBy,
        sortOrder
      };
      
      const response = await getEvenements(params);
      console.log(response.data.evenements);
      
      setEvenements(response.data.evenements);
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

  const handleEditCell = (evenementId, field, currentValue) => {
    setEditingCell(`${evenementId}-${field}`);
    setEditingValue(currentValue || '');
  };

  const handleSaveCell = async (evenementId, field) => {
    try {
      const updateData = { [field]: editingValue };
      await updateEvenement(evenementId, updateData);
      
      setEvenements(prev =>
        prev.map(evt =>
          evt.id === evenementId ? { ...evt, [field]: editingValue } : evt
        )
      );
      
      setEditingCell(null);
      setEditingValue('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleDeleteClick = (evenement) => {
    setSelectedEvenement(evenement);
    setShowDeleteModal(true);
  };

  const handleEditClick = (evenement) => {
    setSelectedEvenement(evenement);
    setShowEditModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvenement(selectedEvenement.id);
      setEvenements(prev => prev.filter(evt => evt.id !== selectedEvenement.id));
      setShowDeleteModal(false);
      setSelectedEvenement(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleEditSave = async () => {
    try {
      await updateEvenement(selectedEvenement.id, selectedEvenement);
      setEvenements(prev =>
        prev.map(evt =>
          evt.id === selectedEvenement.id ? selectedEvenement : evt
        )
      );
      setShowEditModal(false);
      setSelectedEvenement(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleCreateEvenement = async () => {
    try {
      await createEvenement(newEvenement);
      setShowCreateModal(false);
      setNewEvenement({ nom_ferie: '', date: '', zone: '', intensite: '' });
      fetchEvenements();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const getIntensiteColor = (intensite) => {
    switch (parseInt(intensite)) {
      case 3: return 'text-secondary-500';
      case 2: return 'text-yellow-400';
      case 1: return 'text-primary-400';
      default: return 'text-blanc-pur/60';
    }
  };

  const getIntensiteBg = (intensite) => {
    switch (parseInt(intensite)) {
      case 3: return 'bg-secondary-500/20 border-secondary-500/50';
      case 2: return 'bg-yellow-500/20 border-yellow-500/50';
      case 1: return 'bg-primary-500/20 border-primary-500/50';
      default: return 'bg-blanc-pur/10 border-blanc-pur/30';
    }
  };

  const getIntensiteLabel = (intensite) => {
    switch (parseInt(intensite)) {
      case 3: return 'Élevée';
      case 2: return 'Moyenne';
      case 1: return 'Faible';
      default: return 'Non définie';
    }
  };

  const EditableCell = ({ evenement, field, value, className = "" }) => {
    const cellId = `${evenement.id}-${field}`;
    const isEditing = editingCell === cellId;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type={field === 'date' ? 'date' : 'text'}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="px-2 py-1 bg-bleu-fonce/50 border border-primary-500 rounded text-sm text-blanc-pur focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveCell(evenement.id, field);
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <button onClick={() => handleSaveCell(evenement.id, field)} className="p-1 text-primary-500 hover:text-primary-400">
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
        onClick={() => handleEditCell(evenement.id, field, value)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-blanc-pur">{value || 'Ajouter'}</span>
          <Edit3 className="w-3 h-3 text-primary-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const filteredEvenements = evenements.filter(evt => {
    if (filterZone !== 'all' && evt.zone !== filterZone) return false;
    if (filterIntensite !== 'all' && parseInt(evt.intensite) !== parseInt(filterIntensite)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00CFFF" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 p-6">
        <div className="bg-gradient-to-r from-bleu-fonce/90 via-noir-absolu/90 to-bleu-fonce/90 rounded-xl border border-primary-500/30 shadow-lg backdrop-blur-xl mb-6 relative overflow-hidden">
          <div className="relative p-8 border-b border-primary-500/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <h1 className="text-3xl font-bold text-blanc-pur tracking-widest uppercase">ÉVÉNEMENTS</h1>
                <div className="flex items-center space-x-2 bg-noir-absolu/50 px-4 py-2 rounded-full border border-primary-500/30">
                  <span className="text-xs text-primary-500 uppercase">Total:</span>
                  <span className="text-sm font-bold text-blanc-pur">{totalItems}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/80 text-primary-500 px-6 py-3 rounded-lg border border-primary-500/30 hover:border-primary-500 transition-all"
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filtres
                </button>

                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-noir-absolu px-6 py-3 rounded-lg font-bold uppercase hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Nouveau
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-bleu-fonce/50 border border-primary-500/30 rounded-lg">
                <div className="flex items-center px-4">
                  <Search className="w-5 h-5 text-primary-500" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, zone..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-4 py-3 bg-transparent text-blanc-pur placeholder-blanc-pur/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 flex items-center space-x-4">
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:outline-none"
                >
                  <option value="metropole">Métropole</option>
                  <option value="guadeloupe">Guadeloupe</option>
                  <option value="martinique">Martinique</option>
                  <option value="guyane">Guyane</option>
                  <option value="réunion">La Réunion</option>
                  <option value="mayotte">Mayotte</option>
                  <option value="polynésie française">Polynésie française</option>
                  <option value="nouvelle-calédonie">Nouvelle-Calédonie</option>
                  <option value="saint-pierre-et-miquelon">Saint-Pierre-et-Miquelon</option>
                  <option value="wallis-et-futuna">Wallis-et-Futuna</option>
                </select>

                <select
                  value={filterIntensite}
                  onChange={(e) => setFilterIntensite(e.target.value)}
                  className="px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:outline-none"
                >
                  <option value="all">Toutes les intensités</option>
                  <option value="3">Élevée (3)</option>
                  <option value="2">Moyenne (2)</option>
                  <option value="1">Faible (1)</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 p-6">
            {[
              { icon: Calendar, label: "Total", value: totalItems },
              { icon: Zap, label: "Élevée (3)", value: evenements.filter(e => parseInt(e.intensite) === 3).length },
              { icon: AlertCircle, label: "Moyenne (2)", value: evenements.filter(e => parseInt(e.intensite) === 2).length },
              { icon: MapPin, label: "Faible (1)", value: evenements.filter(e => parseInt(e.intensite) === 1).length }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-bleu-fonce/60 to-noir-absolu/60 p-4 rounded-lg border border-primary-500/20">
                <div className="flex items-center space-x-3">
                  <stat.icon className="w-8 h-8 text-primary-500" />
                  <div>
                    <p className="text-xs text-blanc-pur/60 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-blanc-pur">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-bleu-fonce/90 to-noir-absolu/90 rounded-xl border border-primary-500/30 shadow-lg backdrop-blur-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-bleu-fonce via-noir-absolu to-bleu-fonce">
                  <tr>
                    {[
                      { key: 'nom_ferie', label: 'Événement' },
                      { key: 'date', label: 'Date' },
                      { key: 'zone', label: 'Zone' },
                      { key: 'intensite', label: 'Intensité' },
                      { key: 'actions', label: 'Actions' }
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-4 text-left cursor-pointer hover:bg-primary-500/5 transition-all"
                        onClick={() => col.key !== 'actions' && handleSort(col.key)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase text-blanc-pur/90">{col.label}</span>
                          {sortBy === col.key && (
                            <span className="text-primary-500">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvenements.map((evenement) => (
                    <tr key={evenement.id} className="border-b border-primary-500/10 hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-secondary-500/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-noir-absolu" />
                          </div>
                          <EditableCell evenement={evenement} field="nom_ferie" value={evenement.nom_ferie} className="font-bold" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <EditableCell evenement={evenement} field="date" value={evenement.date} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          <EditableCell evenement={evenement} field="zone" value={evenement.zone} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border ${getIntensiteBg(evenement.intensite)}`}>
                          <Zap className={`w-4 h-4 ${getIntensiteColor(evenement.intensite)}`} />
                          <span className={`text-sm font-bold ${getIntensiteColor(evenement.intensite)}`}>
                            {getIntensiteLabel(evenement.intensite)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditClick(evenement)}
                            className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-primary-500" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(evenement)}
                            className="p-2 hover:bg-secondary-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-secondary-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-absolu/80 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce border border-primary-500/50 rounded-xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-blanc-pur uppercase">Nouvel événement</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-secondary-500/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-blanc-pur" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-primary-500 uppercase mb-2">Nom</label>
                  <input
                    type="text"
                    value={newEvenement.nom_ferie}
                    onChange={(e) => setNewEvenement({...newEvenement, nom_ferie: e.target.value})}
                    className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-primary-500 uppercase mb-2">Date</label>
                  <input
                    type="date"
                    value={newEvenement.date}
                    onChange={(e) => setNewEvenement({...newEvenement, date: e.target.value})}
                    className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-primary-500 uppercase mb-2">Zone</label>
                  <select
                    value={newEvenement.zone}
                    onChange={(e) => setNewEvenement({...newEvenement, zone: e.target.value})}
                    className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="métropole">Métropole</option>
                    <option value="guadeloupe">Guadeloupe</option>
                    <option value="martinique">Martinique</option>
                    <option value="guyane">Guyane</option>
                    <option value="la réunion">La Réunion</option>
                    <option value="mayotte">Mayotte</option>
                    <option value="polynésie française">Polynésie française</option>
                    <option value="nouvelle-calédonie">Nouvelle-Calédonie</option>
                    <option value="saint-pierre-et-miquelon">Saint-Pierre-et-Miquelon</option>
                    <option value="wallis-et-futuna">Wallis-et-Futuna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-primary-500 uppercase mb-2">Intensité</label>
                  <select
                    value={newEvenement.intensite}
                    onChange={(e) => setNewEvenement({...newEvenement, intensite: e.target.value})}
                    className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="3">Élevée (3)</option>
                    <option value="2">Moyenne (2)</option>
                    <option value="1">Faible (1)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-bleu-fonce/50 border border-blanc-pur/30 rounded-lg text-blanc-pur hover:border-blanc-pur transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateEvenement}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg text-noir-absolu font-bold hover:scale-105 transition-all"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition */}
        {showEditModal && selectedEvenement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-absolu/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce border border-primary-500/50 rounded-xl p-8 max-w-md w-full shadow-neon-gradient my-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 blur-xl animate-pulse"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <Edit className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-bold text-blanc-pur uppercase tracking-wider">Modifier l'événement</h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-secondary-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-blanc-pur" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Nom</label>
                    <input
                      type="text"
                      value={selectedEvenement.nom_ferie}
                      onChange={(e) => setSelectedEvenement({ ...selectedEvenement, nom_ferie: e.target.value })}
                      className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Date</label>
                    <input
                      type="date"
                      value={selectedEvenement.date}
                      onChange={(e) => setSelectedEvenement({ ...selectedEvenement, date: e.target.value })}
                      className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Zone</label>
                    <input
                      type="text"
                      value={selectedEvenement.zone}
                      onChange={(e) => setSelectedEvenement({ ...selectedEvenement, zone: e.target.value })}
                      className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-primary-500 uppercase tracking-wider mb-2">Intensité</label>
                    <select
                      value={selectedEvenement.intensite}
                      onChange={(e) => setSelectedEvenement({ ...selectedEvenement, intensite: e.target.value })}
                      className="w-full px-4 py-2 bg-bleu-fonce/50 border border-primary-500/30 rounded-lg text-blanc-pur focus:border-primary-500 focus:outline-none"
                    >
                      <option value="Élevée">Élevée</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Faible">Faible</option>
                    </select>
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
    </div>)
}
