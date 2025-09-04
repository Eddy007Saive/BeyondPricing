import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Euro,
  BarChart3,
  Settings,
  Sparkles,
  Cloud,
  MapPin,
  TrendingUp,
  TrendingDown,
  Info,
  Menu,
  X,
  Sun,
  CloudRain,
  Star,
  Filter
} from "lucide-react";

import { getScoringsByLogement } from '@/services/Scoring';
import { getLogements } from '@/services/Logement';

export  function Calendrier() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scoringData, setScoringData] = useState([]);
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLogement, setSelectedLogement] = useState('');
  const [viewMode, setViewMode] = useState('month');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // Chargement des logements
  useEffect(() => {
    const loadLogements = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getLogements({
          limit: 1000,
          sortBy: "nom",
          sortOrder: "ASC"
        });

        const logementsData = response.data.logements;
        const logementNotEmpty=logementsData.filter(logement => logement.tableScoringJournalier!="");
        setLogements(logementNotEmpty);

        console.log(logementsData);
        

        // Sélectionner le premier logement par défaut
        if (logementsData.length > 0 && !selectedLogement) {
          setSelectedLogement(logementsData[0].idBeds24 || logementsData[0].id);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des logements:', error);
        setError('Erreur lors du chargement des logements');
      } finally {
        setLoading(false);
      }
    };

    loadLogements();
  }, []);

  // Chargement des données de scoring
  useEffect(() => {
    const loadScoringData = async () => {
      if (!selectedLogement) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getScoringsByLogement(selectedLogement, {
          sortBy: "date",
          sortOrder: "ASC"
        });

        setScoringData(response.data.scorings);

      } catch (error) {
        console.error('Erreur lors du chargement des données de scoring:', error);
        setError('Erreur lors du chargement des données de tarification');
      } finally {
        setLoading(false);
      }
    };

    if (selectedLogement) {
      loadScoringData();
    }
  }, [selectedLogement, currentDate]);

  // Navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  // Obtenir les données pour une date
  const getDataForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scoringData.find(d => d.date === dateStr);
  };

  // Générer les jours
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getSelectedLogementInfo = () => {
    return logements.find(logement =>
      logement.idBeds24 === selectedLogement || logement.id === selectedLogement
    );
  };

  // Composant jour du calendrier (optimisé mobile)
  const CalendarDay = ({ date, data, isCurrentMonth = true }) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isWeekend = [0, 6].includes(date.getDay());

    const getPriceColor = (price, marketPrice) => {
      if (!price || !marketPrice) return 'text-gray-400';
      const ratio = price / marketPrice;
      if (ratio > 1.1) return 'text-green-600 font-bold';
      if (ratio < 0.9) return 'text-red-600 font-bold';
      return 'text-blue-600 font-semibold';
    };

    const getTensionColor = (tension) => {
      switch (tension) {
        case 'Élevée': return 'bg-red-500';
        case 'Modérée': return 'bg-yellow-500';
        case 'Faible': return 'bg-green-500';
        default: return 'bg-gray-400';
      }
    };

    return (
      <div
        className={`
          relative p-1 sm:p-2 min-h-[60px] sm:min-h-[90px] border border-gray-200 cursor-pointer 
          transition-all duration-300 active:scale-95
          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
          ${isSelected ? 'ring-1 sm:ring-2 ring-blue-500 bg-blue-50 shadow-lg' : ''}
          ${isToday ? 'ring-1 sm:ring-2 ring-purple-400 bg-purple-50' : ''}
          ${isWeekend ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}
          hover:shadow-md hover:bg-gray-50
        `}
        onClick={() => setSelectedDate(date)}
      >
        {/* Date */}
        <div className={`text-[10px] sm:text-sm font-bold mb-0.5 sm:mb-1 ${
          isToday ? 'text-purple-600' : 
          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {date.getDate()}
        </div>

        {data && (
          <div className="space-y-0.5 sm:space-y-1">
            {/* Prix avec animation */}
            <div className={`text-[9px] sm:text-xs font-bold ${getPriceColor(data.tarifIA, data.prixMarche)}`}>
              {Math.round(data.tarifIA)}€
            </div>

            {/* Tension - point coloré */}
            <div className="flex justify-center">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getTensionColor(data.tension)}`}></div>
            </div>

            {/* Icônes additionnelles */}
            <div className="flex justify-center gap-0.5 sm:gap-1">
              {data.meteo === 'Ensoleillé' && <Sun className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500" />}
              {data.meteo.includes('Pluvieux') && <CloudRain className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500" />}
              {data.promoIA && <Star className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />}
            </div>
          </div>
        )}

        {/* Indicateur d'événement */}
        {data?.evenement && (
          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );
  };

  // Panel de détails mobile
  const MobileDetailPanel = ({ date, data }) => {
    if (!date || !data) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {date.toLocaleDateString('fr-FR', { 
                  weekday: 'short', 
                  day: 'numeric',
                  month: 'short'
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Prix principal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Prix recommandé IA</div>
                  <div className="text-3xl font-bold">{Math.round(data.tarifIA)}€</div>
                  <div className="text-xs opacity-75">vs {Math.round(data.prixMarche)}€ marché</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Confiance</div>
                  <div className="text-xl font-bold">{data.confiance}%</div>
                </div>
              </div>
            </div>

            {/* Grille d'infos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-medium">Tension</span>
                </div>
                <div className="font-bold text-gray-900">{data.tension}</div>
                <div className="text-xs text-gray-500">{Math.round(data.tauxOccupation * 100)}% occupation</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-medium">Météo</span>
                </div>
                <div className="font-bold text-gray-900">{data.meteo}</div>
                <div className="text-xs text-gray-500">{data.weekEnd === 'Oui' ? 'Week-end' : 'Semaine'}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-medium">Stratégie</span>
                </div>
                <div className="font-bold text-gray-900">{data.strategie}</div>
                <div className="text-xs text-gray-500">Min: {Math.round(data.minPrice)}€</div>
              </div>

              {data.promoIA && (
                <div className="bg-red-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-medium text-red-800">Promo</span>
                  </div>
                  <div className="font-bold text-red-900">-{data.promoIA}%</div>
                </div>
              )}
            </div>

            {/* Événement */}
            {data.evenement && (
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Événement local</span>
                </div>
                <div className="font-bold text-orange-900">{data.evenement}</div>
              </div>
            )}

            {/* Justification */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Analyse IA:</span>
                  <p className="text-sm text-gray-600 mt-1">{data.justification}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const days = viewMode === 'month' ? generateMonthDays() : generateWeekDays();
  const selectedData = selectedDate ? getDataForDate(selectedDate) : null;
  const selectedLogementInfo = getSelectedLogementInfo();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <span className="mt-2 text-sm text-gray-600 block">Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gray-50 p-4">
        <div className="text-red-500 text-lg font-semibold mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!logements.length) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gray-50 p-4">
        <div className="text-gray-500 text-lg font-semibold mb-2">Aucun logement trouvé</div>
        <div className="text-gray-400 text-sm">Vérifiez votre configuration</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors sm:hidden"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div>
                <h1 className="text-sm sm:text-lg font-bold">Calendrier IA</h1>
                <div className="text-[10px] sm:text-xs opacity-90 truncate max-w-[120px] sm:max-w-none">
                  {selectedLogementInfo?.nom} - {selectedLogementInfo?.ville}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Navigation date */}
          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <button
              onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <h2 className="text-xs sm:text-base font-semibold text-center">
              {viewMode === 'month'
                ? currentDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                : `Sem. ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
              }
            </h2>

            <button
              onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Toggle view mode */}
          <div className="flex justify-center mt-2 sm:mt-3">
            <div className="flex bg-white/20 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 sm:px-4 py-1 rounded text-[10px] sm:text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-white/30 shadow-sm' : 'hover:bg-white/20'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 sm:px-4 py-1 rounded text-[10px] sm:text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white/30 shadow-sm' : 'hover:bg-white/20'
                }`}
              >
                Semaine
              </button>
            </div>
          </div>
        </div>

        {/* Filtres mobile */}
        {showFilters && (
          <div className="border-t border-white/20 p-2 sm:p-4">
            <select
              value={selectedLogement}
              onChange={(e) => setSelectedLogement(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-white/70"
            >
              {logements.map(logement => (
                <option key={logement.id} value={logement.idBeds24} className="text-gray-900 text-sm">
                  {logement.nom} - {logement.ville}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Menu mobile overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden">
          <div className="bg-white w-80 h-full shadow-xl p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <Calendar className="h-5 w-5 text-blue-600" />
                Aujourd'hui
              </button>
              
              {/* Stats rapides */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Statistiques</h3>
                <div className="text-sm text-gray-600">
                  <div>Prix moyen: {scoringData.length > 0 
                    ? Math.round(scoringData.reduce((acc, d) => acc + (d.tarifIA || 0), 0) / scoringData.length)
                    : 0}€</div>
                  <div>Opportunités: {scoringData.filter(d => d.tarifIA && d.prixMarche && d.tarifIA > d.prixMarche * 1.05).length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="p-1 sm:p-4">
        {loading && (
          <div className="flex justify-center items-center h-24 sm:h-32">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600">Chargement...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Légende mobile */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 mb-2 sm:mb-4">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                    <span>Élevé</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                    <span>Normal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                    <span>Faible</span>
                  </div>
                </div>
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
              </div>
            </div>

            {/* Calendrier */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-2 sm:mb-4">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
                  <div key={day} className="p-1.5 sm:p-2 text-center text-[10px] sm:text-sm font-bold text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className={`grid grid-cols-7 ${viewMode === 'week' ? 'grid-rows-1' : ''}`}>
                {days.map((date, index) => {
                  const data = getDataForDate(date);
                  const isCurrentMonth = viewMode === 'week' || date.getMonth() === currentDate.getMonth();

                  return (
                    <CalendarDay
                      key={index}
                      date={date}
                      data={data}
                      isCurrentMonth={isCurrentMonth}
                    />
                  );
                })}
              </div>
            </div>

            {/* Stats cards mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <Euro className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Prix moyen</div>
                    <div className="text-sm sm:text-lg font-bold">
                      {scoringData.length > 0
                        ? Math.round(scoringData.reduce((acc, d) => acc + (d.tarifIA || 0), 0) / scoringData.length)
                        : 0}€
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Opportunités</div>
                    <div className="text-sm sm:text-lg font-bold">
                      {scoringData.filter(d => d.tarifIA && d.prixMarche && d.tarifIA > d.prixMarche * 1.05).length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Confiance IA</div>
                    <div className="text-sm sm:text-lg font-bold">
                      {scoringData.length > 0
                        ? Math.round(scoringData.reduce((acc, d) => acc + (d.confiance || 0), 0) / scoringData.length)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos logement mobile */}
            {selectedLogementInfo && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mt-2 sm:mt-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">Logement actuel</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium text-[10px] sm:text-sm">{selectedLogementInfo.typologie}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacité:</span>
                    <div className="font-medium text-[10px] sm:text-sm">{selectedLogementInfo.capacite} pers.</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Chambres:</span>
                    <div className="font-medium text-[10px] sm:text-sm">{selectedLogementInfo.nbrChambre}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Prix min:</span>
                    <div className="font-medium text-[10px] sm:text-sm">{selectedLogementInfo.minPrice}€</div>
                  </div>
                </div>
              </div>
            )}
 

            {/* Infos logement mobile */}
            {selectedLogementInfo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
                <h3 className="font-bold text-gray-900 mb-3">Logement actuel</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium">{selectedLogementInfo.typologie}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacité:</span>
                    <div className="font-medium">{selectedLogementInfo.capacite} pers.</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Chambres:</span>
                    <div className="font-medium">{selectedLogementInfo.nbrChambre}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Prix min:</span>
                    <div className="font-medium">{selectedLogementInfo.minPrice}€</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel de détails mobile */}
      {selectedDate && selectedData && (
        <MobileDetailPanel date={selectedDate} data={selectedData} />
      )}

      {/* Floating action button pour retour aujourd'hui */}
      <button
        onClick={() => setCurrentDate(new Date())}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
      >
        <Calendar className="h-6 w-6" />
      </button>
    </div>
  );
}