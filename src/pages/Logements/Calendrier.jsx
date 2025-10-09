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
  AlertCircle,
  Snowflake,
  Leaf,
  Flower2,
  Plus,
  Minus,
  Check
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
  
  // Nouveaux états pour la sélection multiple
  const [selectedDates, setSelectedDates] = useState([]);
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  const getSaisonIcon = (saisonNom) => {
    const saisonIcons = {
      'hiver': <Snowflake className="h-4 w-4 text-blue-300" />,
      'printemps': <Flower2 className="h-4 w-4 text-pink-400" />,
      'été': <Sun className="h-4 w-4 text-yellow-400" />,
      'automne': <Leaf className="h-4 w-4 text-orange-400" />
    };
    return saisonIcons[saisonNom.toLowerCase()] || <Sparkles className="h-4 w-4 text-violet-plasma" />;
  };

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
        setLogements(logementNotEmpty);
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
    const dateStr = date.toLocaleDateString('en-CA');
    return scoringData.find(d => d.date === dateStr);
  };

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    const remainingCells = 42 - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(null);
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

  const getMeteoIcon = (conditionMeteo) => {
    if (!conditionMeteo || conditionMeteo === "inconnu") return <Cloud className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />;
    const weatherIcons = {
      'Clear': <Sun className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400" />,
      'Clouds': <Cloud className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />,
      'Rain': <CloudRain className="h-2 w-2 sm:h-3 sm:w-3 text-blue-400" />,
      'Drizzle': <CloudRain className="h-2 w-2 sm:h-3 sm:w-3 text-blue-300" />,
      'Thunderstorm': <CloudRain className="h-2 w-2 sm:h-3 sm:w-3 text-purple-400" />,
      'Snow': <Cloud className="h-2 w-2 sm:h-3 sm:w-3 text-white" />,
    };
    return weatherIcons[conditionMeteo] || null;
  };

  const handleApplyPriceChange = () => {
    // Ici tu peux implémenter la logique pour appliquer les changements de prix
    console.log("Ajustement de prix:", priceAdjustment, "% pour", selectedDates.length, "dates");
    // TODO: Appeler l'API pour mettre à jour les prix
    alert(`Modification de ${priceAdjustment}% appliquée à ${selectedDates.length} dates`);
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setShowPricePanel(false);
    setPriceAdjustment(0);
  };

  const CalendarDay = ({ date, data, isCurrentMonth = true }) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isMultiSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
    const isWeekend = [0, 6].includes(date.getDay());

    const handleDayClick = (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        // Sélection multiple avec Ctrl/Cmd/Shift
        if (isMultiSelected) {
          setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
        } else {
          setSelectedDates([...selectedDates, date]);
        }
        setShowPricePanel(true);
      } else {
        // Sélection simple
        setSelectedDate(date);
      }
    };

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
          relative p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] border border-primary-900/30 cursor-pointer 
          transition-all duration-300 hover:scale-105 flex flex-col justify-between
          ${isCurrentMonth ? 'bg-bleu-fonce/40 backdrop-blur-sm' : 'bg-bleu-fonce/20'}
          ${isSelected ? 'ring-2 ring-bleu-neon bg-primary-900/50 shadow-neon-blue' : ''}
          ${isMultiSelected ? 'ring-4 ring-violet-plasma bg-violet-plasma/20 shadow-neon-violet' : ''}
          ${isToday && !isMultiSelected ? 'ring-2 ring-violet-plasma bg-secondary-900/50 shadow-neon-violet' : ''}
          ${isWeekend ? 'bg-gradient-to-br from-primary-950/30 to-secondary-950/30' : ''}
          hover:shadow-neon-gradient hover:bg-bleu-fonce/60
        `}
        onClick={handleDayClick}
      >
        <div className="flex items-start justify-between">
          <div className={`text-[10px] sm:text-sm font-bold flex items-center gap-1 ${
            isToday ? 'text-violet-plasma' : isCurrentMonth ? 'text-bleu-neon' : 'text-gray-600'
          }`}>
            {date.getDate()}
            {isMultiSelected && <Check className="h-3 w-3 text-violet-plasma" />}
          </div>
          {data && (
            <div className={`text-[9px] sm:text-xs font-bold ${getPriceColor(data.prix_applique, data.prix_calcule)}`}>
              {Math.round(data.prix_applique)}€
            </div>
          )}
        </div>

        {data && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-1">
            <div className="flex justify-center gap-1 sm:gap-2 items-center">
              {getMeteoIcon(data.M_details.condition_meteo)}
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getTensionColor(data.tension_marche)} animate-pulse`}></div>
            </div>
            <div className="flex justify-center gap-1">
              {data.promo && <Star className="h-2 w-2 sm:h-3 sm:w-3 text-violet-plasma animate-pulse" />}
              {!data.action_push && <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />}
              {data?.intensite_evenement > 0 && (
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-full animate-pulse shadow-neon-gradient"></div>
              )}
            </div>
          </div>
        )}

        {data?.M_details?.saison_nom && (
          <div className="flex items-center justify-between text-[8px] sm:text-[10px] gap-1">
            <div className="flex items-center gap-0.5">
              {getSaisonIcon(data.M_details.saison_nom)}
            </div>
            {data.M_details.vacances && (
              <div className="text-violet-plasma font-medium truncate max-w-[80%]">
                {data.M_details.vacances}
              </div>
            )}
            {data?.is_ferie && (
              <div className="bg-violet-plasma/20 text-violet-plasma px-1 rounded">F</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Panneau d'ajustement des prix
  const PriceAdjustmentPanel = () => {
    if (!showPricePanel || selectedDates.length === 0) return null;

    const selectedDatesData = selectedDates.map(date => ({
      date,
      data: getDataForDate(date)
    })).filter(item => item.data);

    const avgPrice = selectedDatesData.length > 0
      ? selectedDatesData.reduce((acc, item) => acc + item.data.prix_applique, 0) / selectedDatesData.length
      : 0;

    const newAvgPrice = avgPrice * (1 + priceAdjustment / 100);

    return (
      <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-bleu-fonce to-noir-absolu border-l-2 border-bleu-neon/30 shadow-neon-gradient z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-bleu-neon/10 to-violet-plasma/10 backdrop-blur-md border-b border-bleu-neon/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-bleu-neon to-violet-plasma">
              Ajustement des Prix
            </h3>
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-violet-plasma/20 rounded-full transition-all"
            >
              <X className="h-5 w-5 text-bleu-neon" />
            </button>
          </div>
          <div className="text-sm text-gray-300">
            {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} sélectionnée{selectedDates.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Contrôle d'ajustement */}
          <div className="bg-bleu-fonce/60 border border-bleu-neon/30 rounded-xl p-4">
            <div className="text-sm font-bold text-bleu-neon mb-3">Modifier le prix</div>
            
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setPriceAdjustment(Math.max(-50, priceAdjustment - 5))}
                className="p-3 bg-violet-plasma/20 hover:bg-violet-plasma/30 rounded-lg border border-violet-plasma/30 transition-all"
              >
                <Minus className="h-5 w-5 text-violet-plasma" />
              </button>
              
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                  className="w-full bg-noir-absolu/50 border border-bleu-neon/30 rounded-lg px-3 py-2 text-center text-2xl font-bold text-bleu-neon focus:ring-2 focus:ring-bleu-neon focus:outline-none"
                />
                <div className="text-xs text-gray-400 mt-1">Pourcentage (%)</div>
              </div>
              
              <button
                onClick={() => setPriceAdjustment(Math.min(100, priceAdjustment + 5))}
                className="p-3 bg-bleu-neon/20 hover:bg-bleu-neon/30 rounded-lg border border-bleu-neon/30 transition-all"
              >
                <Plus className="h-5 w-5 text-bleu-neon" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPriceAdjustment(-10)}
                className="flex-1 py-2 px-3 bg-violet-plasma/10 hover:bg-violet-plasma/20 border border-violet-plasma/30 rounded-lg text-xs text-violet-plasma transition-all"
              >
                -10%
              </button>
              <button
                onClick={() => setPriceAdjustment(-5)}
                className="flex-1 py-2 px-3 bg-violet-plasma/10 hover:bg-violet-plasma/20 border border-violet-plasma/30 rounded-lg text-xs text-violet-plasma transition-all"
              >
                -5%
              </button>
              <button
                onClick={() => setPriceAdjustment(0)}
                className="flex-1 py-2 px-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 rounded-lg text-xs text-gray-300 transition-all"
              >
                0%
              </button>
              <button
                onClick={() => setPriceAdjustment(5)}
                className="flex-1 py-2 px-3 bg-bleu-neon/10 hover:bg-bleu-neon/20 border border-bleu-neon/30 rounded-lg text-xs text-bleu-neon transition-all"
              >
                +5%
              </button>
              <button
                onClick={() => setPriceAdjustment(10)}
                className="flex-1 py-2 px-3 bg-bleu-neon/10 hover:bg-bleu-neon/20 border border-bleu-neon/30 rounded-lg text-xs text-bleu-neon transition-all"
              >
                +10%
              </button>
            </div>
          </div>

          {/* Aperçu des prix */}
          <div className="bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 border border-bleu-neon/30 rounded-xl p-4">
            <div className="text-sm font-bold text-bleu-neon mb-3">Aperçu</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Prix moyen actuel:</span>
                <span className="text-xl font-bold text-blanc-pur">{Math.round(avgPrice)}€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Nouveau prix moyen:</span>
                <span className={`text-xl font-bold ${priceAdjustment > 0 ? 'text-bleu-neon' : priceAdjustment < 0 ? 'text-violet-plasma' : 'text-blanc-pur'}`}>
                  {Math.round(newAvgPrice)}€
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-bleu-neon/20">
                <span className="text-gray-400">Différence:</span>
                <span className={`text-lg font-bold ${priceAdjustment > 0 ? 'text-bleu-neon' : priceAdjustment < 0 ? 'text-violet-plasma' : 'text-gray-400'}`}>
                  {priceAdjustment > 0 ? '+' : ''}{Math.round(newAvgPrice - avgPrice)}€
                </span>
              </div>
            </div>
          </div>

          {/* Liste des dates sélectionnées */}
          <div className="bg-bleu-fonce/40 border border-violet-plasma/20 rounded-xl p-4">
            <div className="text-sm font-bold text-violet-plasma mb-3">Dates sélectionnées</div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedDatesData.map(({ date, data }, index) => (
                <div key={index} className="flex justify-between items-center text-xs p-2 bg-noir-absolu/30 rounded-lg">
                  <span className="text-gray-300">
                    {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{Math.round(data.prix_applique)}€</span>
                    <span className="text-violet-plasma">→</span>
                    <span className="text-bleu-neon font-bold">
                      {Math.round(data.prix_applique * (1 + priceAdjustment / 100))}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2">
            <button
              onClick={handleApplyPriceChange}
              className="w-full py-3 bg-gradient-to-r from-bleu-neon to-violet-plasma text-blanc-pur font-bold rounded-lg hover:shadow-neon-gradient transition-all flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Appliquer les modifications
            </button>
            <button
              onClick={clearSelection}
              className="w-full py-3 bg-bleu-fonce/60 border border-bleu-neon/30 text-bleu-neon font-medium rounded-lg hover:bg-bleu-fonce/80 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MobileDetailPanel = ({ date, data }) => {
    if (!date || !data) return null;

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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bleu-fonce/60 border border-bleu-neon/20 rounded-xl p-3 backdrop-blur-sm hover:shadow-neon-blue transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-bleu-neon" />
                  <span className="text-xs font-medium text-bleu-neon">Marché</span>
                </div>
                <div className="font-bold text-blanc-pur">{data.tension_marche}</div>
                <div className="text-xs text-violet-plasma/75">{Math.round(data.occupation_secteur * 100)}% occup.</div>
              </div>

              <div className="bg-bleu-fonce/60 border border-violet-plasma/20 rounded-xl p-3 backdrop-blur-sm hover:shadow-neon-violet transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-4 w-4 text-violet-plasma" />
                  <span className="text-xs font-medium text-violet-plasma">Météo</span>
                </div>
                <div className="font-bold text-blanc-pur">Score: {data.score_meteo}</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-fonce via-noir-absolu to-bleu-fonce">
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
                  {selectedLogementInfo?.nom}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedDates.length > 0 && (
                <div className="bg-violet-plasma/20 border border-violet-plasma/30 rounded-lg px-3 py-1 text-xs font-bold text-violet-plasma">
                  {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}
                </div>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-violet-plasma/20 rounded-lg transition-all border border-violet-plasma/30"
              >
                <Filter className="h-4 w-4 text-violet-plasma" />
              </button>
            </div>
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
                value={selectedLogement?.idBeds24 || ""}
                onChange={(e) => {
                  const selected = logements.find(l => l.idBeds24 == e.target.value);
                  setSelectedLogement(selected);
                }}
                className="w-full bg-bleu-fonce/60 border border-bleu-neon/30 rounded-lg px-3 py-2 text-sm text-bleu-neon backdrop-blur-sm focus:ring-2 focus:ring-bleu-neon focus:outline-none"
              >
                {logements.map(logement => (
                  <option key={logement.id} value={logement.idBeds24}>
                    {logement.nom} - {logement.ville}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="p-1 sm:p-4">
        {/* Instruction pour sélection multiple */}
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
            <div className="text-gray-400">
              <span className="hidden sm:inline">Ctrl+Clic</span>
              <span className="sm:hidden">Maintenir</span> pour sélection multiple
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
              if (date === null) {
                return (
                  <div
                    key={index}
                    className="relative p-1 sm:p-2 min-h-[60px] sm:min-h-[90px] border border-primary-900/10 bg-bleu-fonce/10"
                  />
                );
              }
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
                <div className="text-xs text-violet-plasma/70">Dates sélectionnées</div>
                <div className="text-lg font-bold text-violet-plasma">
                  {selectedDates.length}
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

      <PriceAdjustmentPanel />

      <button
        onClick={() => setCurrentDate(new Date())}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-full shadow-neon-gradient hover:scale-110 transition-all border-2 border-bleu-neon/30 z-40"
      >
        <Calendar className="h-6 w-6 text-blanc-pur" />
      </button>
    </div>
  );
}