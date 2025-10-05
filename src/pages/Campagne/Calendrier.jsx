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
  Info,
  Menu,
  X,
  Sun,
  CloudRain,
  Star,
  Filter,
  Zap,
  AlertCircle
} from "lucide-react";

import { getScoringsByLogement } from '@/services/Scoring';
import { getLogements } from '@/services/Logement';

export function Calendrier() {
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

        const logementNotEmpty = logementsData.filter(logement => logement.tableScoringJournalier != "");
        console.log(logementNotEmpty, "fsfsf");
        setLogements(logementNotEmpty);



        // Sélectionner le premier logement par défaut
        if (logementNotEmpty.length > 0 && !selectedLogement) {
          setSelectedLogement(logementNotEmpty[0]);
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

        const response = await getScoringsByLogement(selectedLogement.idBeds24, {
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

    console.log(selectedLogement, "selectedLogement");

    if (selectedLogement) {
      loadScoringData();
    }
  }, [selectedLogement, currentDate]);

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

  const getDataForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scoringData.find(d => d.date === dateStr);
  };

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
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

  const getMeteoIcon = (scoreMeteo) => {
    if (scoreMeteo >= 1) return <Sun className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400" />;
    if (scoreMeteo <= -1) return <CloudRain className="h-2 w-2 sm:h-3 sm:w-3 text-blue-400" />;
    return <Cloud className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />;
  };

  const CalendarDay = ({ date, data, isCurrentMonth = true }) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isWeekend = [0, 6].includes(date.getDay());

    const getPriceColor = (prixApplique, prixCalcule) => {
      if (!prixApplique || !prixCalcule) return 'text-gray-400';
      const ratio = prixApplique / prixCalcule;
      if (ratio > 1.05) return 'text-bleu-neon font-bold';
      if (ratio < 0.95) return 'text-violet-plasma font-bold';
      return 'text-primary-400 font-semibold';
    };

    const getTensionColor = (tension) => {
      switch (tension) {
        case 'Élevée': return 'bg-violet-plasma shadow-neon-violet';
        case 'Modérée': return 'bg-yellow-500';
        case 'Faible': return 'bg-bleu-neon shadow-neon-blue';
        default: return 'bg-gray-600';
      }
    };

    return (
      <div
        className={`
          relative p-1 sm:p-2 min-h-[60px] sm:min-h-[90px] border border-primary-900/30 cursor-pointer 
          transition-all duration-300 hover:scale-105
          ${isCurrentMonth ? 'bg-bleu-fonce/40 backdrop-blur-sm' : 'bg-bleu-fonce/20'}
          ${isSelected ? 'ring-2 ring-bleu-neon bg-primary-900/50 shadow-neon-blue' : ''}
          ${isToday ? 'ring-2 ring-violet-plasma bg-secondary-900/50 shadow-neon-violet' : ''}
          ${isWeekend ? 'bg-gradient-to-br from-primary-950/30 to-secondary-950/30' : ''}
          hover:shadow-neon-gradient hover:bg-bleu-fonce/60
        `}
        onClick={() => setSelectedDate(date)}
      >
        <div className={`text-[10px] sm:text-sm font-bold mb-0.5 sm:mb-1 ${isToday ? 'text-violet-plasma' :
            isCurrentMonth ? 'text-bleu-neon' : 'text-gray-600'
          }`}>
          {date.getDate()}
        </div>

        {data && (
          <div className="space-y-0.5 sm:space-y-1">
            <div className={`text-[9px] sm:text-xs font-bold ${getPriceColor(data.prix_applique, data.prix_calcule)}`}>
              {Math.round(data.prix_applique)}€
            </div>

            <div className="flex justify-center">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getTensionColor(data.tension_marche)} animate-pulse`}></div>
            </div>

            <div className="flex justify-center gap-0.5 sm:gap-1">
              {getMeteoIcon(data.score_meteo)}
              {data.promo && <Star className="h-2 w-2 sm:h-3 sm:w-3 text-violet-plasma animate-pulse" />}
              {!data.action_push && <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />}
            </div>
          </div>
        )}

        {data?.intensite_evenement > 0 && (
          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-full animate-pulse shadow-neon-gradient"></div>
          </div>
        )}

        {data?.is_ferie && (
          <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1">
            <div className="text-[8px] sm:text-[10px] bg-violet-plasma/20 text-violet-plasma px-1 rounded">F</div>
          </div>
        )}
      </div>
    );
  };

  const MobileDetailPanel = ({ date, data }) => {
    if (!date || !data) return null;
    console.log("eeaeaeae", data);


    return (
      <div className="fixed inset-0 bg-noir-absolu/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-gradient-to-br from-bleu-fonce to-noir-absolu rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border-2 border-bleu-neon/30 shadow-neon-gradient">
          <div className="sticky top-0 bg-gradient-to-r from-bleu-neon/10 to-violet-plasma/10 backdrop-blur-md border-b border-bleu-neon/30 p-4 rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-bleu-neon">
                  {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </h3>
                <div className="text-xs text-violet-plasma">{data.jour_semaine.toUpperCase()}</div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-violet-plasma/20 rounded-full transition-all hover:shadow-neon-violet"
              >
                <X className="h-5 w-5 text-bleu-neon" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Prix principal */}
            <div className="bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 rounded-2xl p-4 border border-bleu-neon/30 shadow-neon-gradient">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-bleu-neon/80">Prix appliqué</div>
                  <div className="text-3xl font-bold text-bleu-neon">{Math.round(data.prix_applique)}€</div>
                  <div className="text-xs text-violet-plasma/75">
                    Base: {Math.round(selectedLogement.basePrice)}€ | Calculé: {Math.round(data.prix_calcule)}€
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-bleu-neon/80">Score IA</div>
                  <div className="text-xl font-bold text-violet-plasma">{Math.round(data.S_base * 100)}%</div>
                  {/* <div className="text-xs text-bleu-neon/70">M: {data.M_total.toFixed(2)}</div> */}
                </div>
              </div>

              {data.variation_pct !== 0 && (
                <div className={`text-sm font-bold ${data.variation_pct > 0 ? 'text-bleu-neon' : 'text-violet-plasma'}`}>
                  {/* Variation: {data.variation_pct > 0 ? '+' : ''}{data.variation_pct.toFixed(1)}% */}
                </div>
              )}
            </div>

            {/* Grille d'infos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bleu-fonce/60 border border-bleu-neon/20 rounded-xl p-3 backdrop-blur-sm hover:shadow-neon-blue transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-bleu-neon" />
                  <span className="text-xs font-medium text-bleu-neon">Marché</span>
                </div>
                <div className="font-bold text-blanc-pur">{data.tension_marche}</div>
                <div className="text-xs text-violet-plasma/75">{Math.round(data.occupation_secteur * 100)}% occup.</div>
                <div className="text-xs text-bleu-neon/70 mt-1">{data.famille_marche}</div>
              </div>

              <div className="bg-bleu-fonce/60 border border-violet-plasma/20 rounded-xl p-3 backdrop-blur-sm hover:shadow-neon-violet transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-4 w-4 text-violet-plasma" />
                  <span className="text-xs font-medium text-violet-plasma">Météo</span>
                </div>
                <div className="font-bold text-blanc-pur">Score: {data.score_meteo}</div>
                <div className="text-xs text-bleu-neon/75">
                  Impact: {data.M_details.meteo.toFixed(2)}x
                </div>
              </div>

              <div className="bg-bleu-fonce/60 border border-bleu-neon/20 rounded-xl p-3 backdrop-blur-sm hover:shadow-neon-blue transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-bleu-neon" />
                  <span className="text-xs font-medium text-bleu-neon">Séjour min.</span>
                </div>
                <div className="font-bold text-blanc-pur">{data.min_stay} nuit{data.min_stay > 1 ? 's' : ''}</div>
                <div className="text-xs text-violet-plasma/75">Lead: {data.sensib_lead_time}</div>
              </div>

              <div className="bg-bleu-fonce/60 border border-violet-plasma/20 rounded-xl p-3 backdrop-blur-sm hover:shadow-neon-violet transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="h-4 w-4 text-violet-plasma" />
                  <span className="text-xs font-medium text-violet-plasma">Fourchette</span>
                </div>
                <div className="font-bold text-blanc-pur text-xs">
                  {Math.round(selectedLogement.minPrice)}€ -{" "}
                  {data.maxPrice && data.maxPrice !== 0
                    ? Math.round(data.maxPrice) + "€"
                    : "∞"}
                </div>

              </div>
            </div>

            {/* Promo */}
            {data.promo && (
              <div className="bg-gradient-to-br from-violet-plasma/30 to-bleu-neon/30 border border-violet-plasma rounded-xl p-4 shadow-neon-violet">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-violet-plasma" />
                  <span className="text-sm font-medium text-violet-plasma">Promotion active</span>
                </div>
                <div className="font-bold text-blanc-pur text-lg">{data.promo}</div>
              </div>
            )}

            {/* Événement */}
            {data.intensite_evenement > 0 && (
              <div className="bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 border border-violet-plasma/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-bleu-neon" />
                  <span className="text-sm font-medium text-bleu-neon">Événement</span>
                </div>
                <div className="font-bold text-violet-plasma">
                  Intensité: {data.intensite_evenement} | Impact: {data.M_details.evenement}x
                </div>
              </div>
            )}

            {/* Jour férié */}
            {data.is_ferie && (
              <div className="bg-violet-plasma/20 border border-violet-plasma/40 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-violet-plasma" />
                  <span className="text-sm font-bold text-violet-plasma">{data.jour_ferie}</span>
                </div>
              </div>
            )}

            {/* Multiplicateurs */}
            <div className="bg-bleu-fonce/40 border border-bleu-neon/20 rounded-xl p-4">
              <div className="text-sm font-bold text-bleu-neon mb-3">Multiplicateurs (M_details)</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Standing:</span>
                  <span className="text-blanc-pur font-medium">{data.M_details.standing.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jour semaine:</span>
                  <span className="text-blanc-pur font-medium">{data.M_details.jour_semaine.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Événement:</span>
                  <span className="text-blanc-pur font-medium">{data.M_details.evenement.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Météo:</span>
                  <span className="text-blanc-pur font-medium">{data.M_details.meteo.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lead time:</span>
                  <span className="text-blanc-pur font-medium">{data.M_details.lead_time.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Occupation:</span>
                  <span className="text-blanc-pur font-medium">{data.M_details.ajustement_occupation.toFixed(2)}x</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-bleu-neon/20 flex justify-between">
                <span className="text-violet-plasma font-bold">Total:</span>
                {/* <span className="text-bleu-neon font-bold">{data.M_total.toFixed(3)}x</span> */}
              </div>
            </div>

            {/* Status push */}
            <div className={`rounded-xl p-3 border ${data.action_push
                ? 'bg-bleu-neon/20 border-bleu-neon/30'
                : 'bg-red-500/20 border-red-500/30'
              }`}>
              <div className="flex items-center gap-2">
                {data.action_push ? (
                  <>
                    <Zap className="h-4 w-4 text-bleu-neon" />
                    <span className="text-sm font-bold text-bleu-neon">Prix synchronisé avec Beds24</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">Non synchronisé</span>
                  </>
                )}
              </div>
              {data.raison_skip && (
                <div className="text-xs text-gray-400 mt-1">Raison: {data.raison_skip}</div>
              )}
            </div>

            {/* Erreurs */}
            {data.erreurs && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-bold text-red-400">Erreurs</span>
                </div>
                <div className="text-xs text-gray-300">{data.erreurs}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const days = viewMode === 'month' ? generateMonthDays() : generateWeekDays();
  const selectedData = selectedDate ? getDataForDate(selectedDate) : null;
  const selectedLogementInfo = getSelectedLogementInfo();

  if (loading && !scoringData.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bleu-neon mx-auto mb-4"></div>
          <span className="text-bleu-neon font-medium">Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <div className="text-red-400 text-lg font-semibold mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-bleu-neon to-violet-plasma text-blanc-pur rounded-lg hover:shadow-neon-gradient transition-all font-bold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!logements.length) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce p-4">
        <div className="text-bleu-neon text-lg font-semibold mb-2">Aucun logement trouvé</div>
        <div className="text-gray-400 text-sm">Vérifiez votre configuration</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce">
      {/* Header futuriste */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-bleu-neon/10 to-violet-plasma/10 backdrop-blur-xl border-b border-bleu-neon/20 shadow-neon-gradient">
        <div className="px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-bleu-neon/20 rounded-lg transition-all sm:hidden border border-bleu-neon/30"
              >
                <Menu className="h-4 w-4 text-bleu-neon" />
              </button>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma">
                  Calendrier IA
                </h1>
                <div className="text-[10px] sm:text-xs text-bleu-neon/70 truncate max-w-[120px] sm:max-w-none flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {selectedLogementInfo?.nom} - {selectedLogementInfo?.ville}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-violet-plasma/20 rounded-lg transition-all border border-violet-plasma/30"
            >
              <Filter className="h-4 w-4 text-violet-plasma" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
              className="p-2 hover:bg-bleu-neon/20 rounded-lg transition-all border border-bleu-neon/30 hover:shadow-neon-blue"
            >
              <ChevronLeft className="h-4 w-4 text-bleu-neon" />
            </button>

            <h2 className="text-xs sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma">
              {viewMode === 'month'
                ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()
                : `SEMAINE ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
              }
            </h2>

            <button
              onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
              className="p-2 hover:bg-violet-plasma/20 rounded-lg transition-all border border-violet-plasma/30 hover:shadow-neon-violet"
            >
              <ChevronRight className="h-4 w-4 text-violet-plasma" />
            </button>
          </div>

          <div className="flex justify-center mt-3">
            <div className="flex bg-bleu-fonce/40 border border-bleu-neon/20 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 sm:px-6 py-1.5 rounded text-[10px] sm:text-sm font-medium transition-all ${viewMode === 'month'
                    ? 'bg-gradient-to-r from-bleu-neon/30 to-violet-plasma/30 text-bleu-neon shadow-neon-blue'
                    : 'text-gray-400 hover:text-bleu-neon'
                  }`}
              >
                MOIS
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 sm:px-6 py-1.5 rounded text-[10px] sm:text-sm font-medium transition-all ${viewMode === 'week'
                    ? 'bg-gradient-to-r from-bleu-neon/30 to-violet-plasma/30 text-violet-plasma shadow-neon-violet'
                    : 'text-gray-400 hover:text-violet-plasma'
                  }`}
              >
                SEMAINE
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4">
              <select
                value={selectedLogement}
                onChange={(e) => setSelectedLogement(e.target.value)}
                className="w-full bg-bleu-fonce/60 border border-bleu-neon/30 rounded-lg px-3 py-2 text-sm text-bleu-neon backdrop-blur-sm focus:ring-2 focus:ring-bleu-neon focus:outline-none"
              >
                {logements.map(logement => (
                  <option key={logement.id} value={logement.idBeds24} className="bg-bleu-fonce text-bleu-neon">
                    {logement.nom} - {logement.ville}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-noir-absolu/95 backdrop-blur-lg z-50 sm:hidden">
          <div className="bg-gradient-to-br from-bleu-fonce to-noir-absolu w-80 h-full shadow-neon-gradient border-r border-bleu-neon/30 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma">MENU</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-violet-plasma/20 rounded-lg border border-violet-plasma/30"
              >
                <X className="h-5 w-5 text-violet-plasma" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setShowMobileMenu(false);
                }}
                className="w-full text-left p-3 hover:bg-bleu-neon/20 rounded-lg flex items-center gap-3 border border-bleu-neon/20 transition-all"
              >
                <Calendar className="h-5 w-5 text-bleu-neon" />
                <span className="text-bleu-neon font-medium">Aujourd'hui</span>
              </button>

              <div className="space-y-2 pt-4 border-t border-bleu-neon/20">
                <h3 className="font-semibold text-violet-plasma">Statistiques</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span>Prix moyen:</span>
                    <span className="text-bleu-neon font-bold">
                      {scoringData.length > 0
                        ? Math.round(scoringData.reduce((acc, d) => acc + d.prix_applique, 0) / scoringData.length)
                        : 0}€
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Jours avec promo:</span>
                    <span className="text-violet-plasma font-bold">
                      {scoringData.filter(d => d.promo).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tension élevée:</span>
                    <span className="text-violet-plasma font-bold">
                      {scoringData.filter(d => d.tension_marche === 'Élevée').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-1 sm:p-4">
        {/* Légende */}
        <div className="bg-bleu-fonce/40 backdrop-blur-sm border border-bleu-neon/20 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-bleu-neon rounded-full shadow-neon-blue"></div>
                <span className="text-bleu-neon">Faible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">Modérée</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-violet-plasma rounded-full shadow-neon-violet"></div>
                <span className="text-violet-plasma">Élevée</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-violet-plasma animate-pulse" />
              <span className="text-gray-400">Promo</span>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-bleu-fonce/30 backdrop-blur-sm border-2 border-bleu-neon/20 rounded-2xl overflow-hidden mb-4 shadow-neon-gradient">
          <div className="grid grid-cols-7 bg-gradient-to-r from-bleu-neon/10 to-violet-plasma/10 border-b border-bleu-neon/30">
            {['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'].map(day => (
              <div key={day} className="p-2 text-center text-[10px] sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma">
                {day}
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 ${viewMode === 'week' ? 'grid-rows-1' : ''}`}>
            {days.map((date, index) => {
              const data = getDataForDate(date);
              const isCurrentMonth = viewMode === 'week' || date.getMonth() === currentDate.getMonth();
              return <CalendarDay key={index} date={date} data={data} isCurrentMonth={isCurrentMonth} />;
            })}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-bleu-fonce/40 backdrop-blur-sm border border-bleu-neon/30 rounded-xl p-4 hover:shadow-neon-blue transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-bleu-neon/20 rounded-lg border border-bleu-neon/30">
                <Euro className="h-5 w-5 text-bleu-neon" />
              </div>
              <div>
                <div className="text-xs text-bleu-neon/70">Prix moyen</div>
                <div className="text-lg font-bold text-bleu-neon">
                  {scoringData.length > 0 ? Math.round(scoringData.reduce((acc, d) => acc + d.prix_applique, 0) / scoringData.length) : 0}€
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bleu-fonce/40 backdrop-blur-sm border border-violet-plasma/30 rounded-xl p-4 hover:shadow-neon-violet transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-plasma/20 rounded-lg border border-violet-plasma/30">
                <TrendingUp className="h-5 w-5 text-violet-plasma" />
              </div>
              <div>
                <div className="text-xs text-violet-plasma/70">Prix  Calculé</div>
                <div className="text-lg font-bold text-violet-plasma">
                  {scoringData.filter(d => d.prix_applique > d.prix_calcule * 1.05).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bleu-fonce/40 backdrop-blur-sm border border-bleu-neon/30 rounded-xl p-4 hover:shadow-neon-gradient transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 rounded-lg border border-bleu-neon/30">
                <Sparkles className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma" />
              </div>
              <div>
                <div className="text-xs text-bleu-neon/70">Score IA moyen</div>
                <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma">
                  {scoringData.length > 0 ? Math.round(scoringData.reduce((acc, d) => acc + d.S_base, 0) / scoringData.length * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Infos logement */}
        {selectedLogementInfo && (
          <div className="bg-bleu-fonce/40 backdrop-blur-sm border border-violet-plasma/30 rounded-xl p-4">
            <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma mb-3">
              LOGEMENT ACTUEL
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-bleu-neon/70">Type:</span>
                <div className="font-medium text-blanc-pur">{selectedLogementInfo.typologie}</div>
              </div>
              <div>
                <span className="text-violet-plasma/70">Capacité:</span>
                <div className="font-medium text-blanc-pur">{selectedLogementInfo.capacite} pers.</div>
              </div>
              <div>
                <span className="text-bleu-neon/70">Chambres:</span>
                <div className="font-medium text-blanc-pur">{selectedLogementInfo.nbrChambre}</div>
              </div>
              <div>
                <span className="text-violet-plasma/70">Prix min:</span>
                <div className="font-medium text-blanc-pur">{selectedLogementInfo.minPrice}€</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedDate && selectedData && (
        <MobileDetailPanel date={selectedDate} data={selectedData} />
      )}

      <button
        onClick={() => setCurrentDate(new Date())}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-full shadow-neon-gradient hover:scale-110 transition-all border-2 border-bleu-neon/30"
      >
        <Calendar className="h-6 w-6 text-blanc-pur" />
      </button>
    </div>
  );
}