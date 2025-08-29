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
} from "lucide-react";

// Service de scoring réel
import { getScorings } from '@/services/scoring';

export  function CampaignDetailDashboard() {
const [currentDate, setCurrentDate] = useState(new Date());
const [scoringData, setScoringData] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedDate, setSelectedDate] = useState(null);
const [selectedLogement, setSelectedLogement] = useState('');
const [viewMode, setViewMode] = useState('month'); // month, week
const [availableLogements, setAvailableLogements] = useState([]);
const [error, setError] = useState(null);

// Chargement des données
useEffect(() => {
const loadData = async () => {
try {
setLoading(true);
setError(null);

const response = await getScorings({
limit: 1000, // Charger beaucoup de données pour avoir l'historique
sortBy: "Date",
sortOrder: "ASC"
});

const scorings = response.data.scorings;
setScoringData(scorings);

// Extraire les logements uniques pour le sélecteur
if (!selectedLogement && scorings.length > 0) {
const logements = [...new Set(scorings.map(s => s.idLogement))].filter(Boolean);
setAvailableLogements(logements);
if (logements.length > 0) {
setSelectedLogement(logements[0]);
}
}

} catch (error) {
console.error('Erreur lors du chargement des données:', error);
setError('Erreur lors du chargement des données de tarification');
} finally {
setLoading(false);
}
};

loadData();
}, [selectedLogement]);

// Fonctions de navigation
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

// Obtenir les données pour une date spécifique
const getDataForDate = (date) => {
const dateStr = date.toISOString().split('T')[0];
return scoringData.find(d => d.date === dateStr);
};

// Générer les jours du mois
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

// Générer les jours de la semaine
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

// Composant jour du calendrier
const CalendarDay = ({ date, data, isCurrentMonth = true }) => {
const isToday = date.toDateString() === new Date().toDateString();
const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
const isWeekend = [0, 6].includes(date.getDay());

const getPriceColor = (price, marketPrice) => {
if (!price || !marketPrice) return 'text-gray-500';
const ratio = price / marketPrice;
if (ratio > 1.1) return 'text-green-600 font-semibold';
if (ratio < 0.9) return 'text-red-600 font-semibold';
return 'text-blue-600';
};

const getTensionColor = (tension) => {
switch(tension) {
case 'Élevée': return 'bg-red-100 text-red-800';
case 'Modérée': return 'bg-yellow-100 text-yellow-800';
case 'Faible': return 'bg-green-100 text-green-800';
default: return 'bg-gray-100 text-gray-800';
}
};

return (
<div
className={`
relative p-2 min-h-[100px] border border-gray-200 cursor-pointer transition-all duration-200
${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
${isToday ? 'ring-1 ring-blue-300' : ''}
${isWeekend ? 'bg-blue-50/30' : ''}
hover:bg-gray-50 hover:shadow-md
`}
onClick={() => setSelectedDate(date)}
>
{/* Date */}
<div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
{date.getDate()}
</div>

{data && (
<div className="space-y-1">
{/* Prix recommandé */}
<div className={`text-xs font-medium ${getPriceColor(data.tarifIA, data.prixMarche)}`}>
  {data.tarifIA ? Math.round(data.tarifIA) : '-'}€
</div>

{/* Tension du marché */}
<div className={`text-xs px-1 py-0.5 rounded text-center ${getTensionColor(data.tension)}`}>
  {data.tension?.slice(0, 4)}
</div>

{/* Météo */}
{data.meteo && (
  <div className="flex items-center justify-center">
    <Cloud className="h-3 w-3 text-gray-500" />
  </div>
)}

{/* Promo */}
{data.promoIA && (
  <div className="text-xs bg-red-100 text-red-800 px-1 rounded text-center">
    -{data.promoIA}
  </div>
)}

{/* Événement */}
{data.evenement && (
  <div className="absolute top-1 right-1">
    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
  </div>
)}
</div>
)}
</div>
);
};

// Panel de détails pour la date sélectionnée
const DetailPanel = ({ date, data }) => {
if (!date || !data) return null;

return (
<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
<div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold text-gray-900">
{date.toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
</h3>
<div className="flex items-center gap-2">
<span className="text-sm text-gray-500">Confiance:</span>
<span className="text-sm font-medium text-green-600">{data.confiance}</span>
</div>
</div>

<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
{/* Prix recommandé */}
<div className="bg-blue-50 rounded-lg p-4">
<div className="flex items-center gap-2 mb-2">
  <Euro className="h-5 w-5 text-blue-600" />
  <span className="text-sm font-medium text-blue-800">Prix IA</span>
</div>
<div className="text-2xl font-bold text-blue-600">
  {Math.round(data.tarifIA)}€
</div>
<div className="text-xs text-blue-600 mt-1">
  vs {Math.round(data.prixMarche)}€ marché
</div>
</div>

{/* Tension du marché */}
<div className="bg-gray-50 rounded-lg p-4">
<div className="flex items-center gap-2 mb-2">
  <BarChart3 className="h-5 w-5 text-gray-600" />
  <span className="text-sm font-medium text-gray-800">Tension</span>
</div>
<div className="text-lg font-semibold text-gray-900">
  {data.tension}
</div>
<div className="text-xs text-gray-600 mt-1">
  Taux: {data.tauxOccupation}
</div>
</div>

{/* Météo */}
<div className="bg-green-50 rounded-lg p-4">
<div className="flex items-center gap-2 mb-2">
  <Cloud className="h-5 w-5 text-green-600" />
  <span className="text-sm font-medium text-green-800">Météo</span>
</div>
<div className="text-lg font-semibold text-green-900">
  {data.meteo}
</div>
<div className="text-xs text-green-600 mt-1">
  {data.weekEnd === 'Oui' ? 'Week-end' : 'Semaine'}
</div>
</div>

{/* Stratégie */}
<div className="bg-purple-50 rounded-lg p-4">
<div className="flex items-center gap-2 mb-2">
  <Settings className="h-5 w-5 text-purple-600" />
  <span className="text-sm font-medium text-purple-800">Stratégie</span>
</div>
<div className="text-lg font-semibold text-purple-900">
  {data.strategie}
</div>
<div className="text-xs text-purple-600 mt-1">
  Min: {Math.round(data.minPrice)}€
</div>
</div>

{/* Événements */}
{data.evenement && (
<div className="bg-orange-50 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-2">
    <MapPin className="h-5 w-5 text-orange-600" />
    <span className="text-sm font-medium text-orange-800">Événement</span>
  </div>
  <div className="text-sm font-semibold text-orange-900">
    {data.evenement}
  </div>
</div>
)}

{/* Promo */}
{data.promoIA && (
<div className="bg-red-50 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-2">
    <Sparkles className="h-5 w-5 text-red-600" />
    <span className="text-sm font-medium text-red-800">Promotion</span>
  </div>
  <div className="text-lg font-bold text-red-900">
    -{data.promoIA}
  </div>
</div>
)}
</div>

{/* Justification */}
<div className="mt-4 p-4 bg-gray-50 rounded-lg">
<div className="flex items-start gap-2">
<Info className="h-5 w-5 text-gray-500 mt-0.5" />
<div>
  <span className="text-sm font-medium text-gray-800">Justification:</span>
  <p className="text-sm text-gray-600 mt-1">{data.justification}</p>
</div>
</div>
</div>
</div>
);
};

const days = viewMode === 'month' ? generateMonthDays() : generateWeekDays();
const selectedData = selectedDate ? getDataForDate(selectedDate) : null;

if (loading) {
return (
<div className="flex justify-center items-center h-64">
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
<span className="ml-2 text-gray-600">Chargement des données de tarification...</span>
</div>
);
}

if (error) {
return (
<div className="flex flex-col justify-center items-center h-64 text-center">
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

if (!availableLogements.length) {
return (
<div className="flex flex-col justify-center items-center h-64 text-center">
<div className="text-gray-500 text-lg font-semibold mb-2">Aucun logement trouvé</div>
<div className="text-gray-400">Vérifiez votre configuration Airtable</div>
</div>
);
}

return (
<div className="max-w-7xl mx-auto p-6 space-y-6">
{/* Header */}
<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
<div className="flex items-center justify-between mb-4">
<div>
<h1 className="text-2xl font-bold mb-2">Calendrier de Tarification Dynamique</h1>
<p className="opacity-90">Optimisation intelligente des prix par l'IA</p>
</div>
<div className="text-right">
<div className="text-sm opacity-75">Logement sélectionné</div>
<select 
  value={selectedLogement}
  onChange={(e) => setSelectedLogement(e.target.value)}
  className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 backdrop-blur-sm"
>
  {availableLogements.map(logement => (
    <option key={logement} value={logement} className="text-gray-900">
      {logement}
    </option>
  ))}
</select>
</div>
</div>

{/* Navigation et contrôles */}
<div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<button
  onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
>
  <ChevronLeft className="h-5 w-5" />
</button>

<h2 className="text-xl font-semibold">
  {viewMode === 'month' 
    ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : `Semaine du ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
  }
</h2>

<button
  onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
>
  <ChevronRight className="h-5 w-5" />
</button>
</div>

<div className="flex items-center gap-3">
<button
  onClick={() => setCurrentDate(new Date())}
  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
>
  Aujourd'hui
</button>

<div className="flex bg-white/20 rounded-lg p-1">
  <button
    onClick={() => setViewMode('month')}
    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
      viewMode === 'month' ? 'bg-white/30' : 'hover:bg-white/20'
    }`}
  >
    Mois
  </button>
  <button
    onClick={() => setViewMode('week')}
    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
      viewMode === 'week' ? 'bg-white/30' : 'hover:bg-white/20'
    }`}
  >
    Semaine
  </button>
</div>
</div>
</div>
</div>

{/* Légende */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
<div className="flex items-center justify-between text-sm">
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
  <div className="w-3 h-3 bg-green-500 rounded"></div>
  <span>Prix supérieur au marché (+10%)</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-3 h-3 bg-blue-500 rounded"></div>
  <span>Prix aligné au marché</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-3 h-3 bg-red-500 rounded"></div>
  <span>Prix inférieur au marché (-10%)</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
  <span>Événement local</span>
</div>
</div>
<div className="text-gray-500">
Cliquez sur un jour pour voir les détails
</div>
</div>
</div>

{/* Calendrier */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
{/* En-têtes des jours */}
<div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
{['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
<div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
  {day}
</div>
))}
</div>

{/* Grille du calendrier */}
<div className={`grid grid-cols-7 ${viewMode === 'week' ? 'grid-rows-1' : 'grid-rows-6'}`}>
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

{/* Panel de détails */}
{selectedDate && selectedData && (
<DetailPanel date={selectedDate} data={selectedData} />
)}

{/* Statistiques rapides */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
<div className="flex items-center gap-3">
<div className="p-3 bg-blue-100 rounded-lg">
  <Euro className="h-6 w-6 text-blue-600" />
</div>
<div>
  <div className="text-sm text-gray-600">Prix moyen recommandé</div>
  <div className="text-xl font-bold text-gray-900">
    {scoringData.length > 0 
      ? Math.round(scoringData.reduce((acc, d) => acc + (d.tarifIA || 0), 0) / scoringData.length)
      : 0}€
  </div>
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
<div className="flex items-center gap-3">
<div className="p-3 bg-green-100 rounded-lg">
  <TrendingUp className="h-6 w-6 text-green-600" />
</div>
<div>
  <div className="text-sm text-gray-600">Opportunités d'optimisation</div>
  <div className="text-xl font-bold text-gray-900">
    {scoringData.filter(d => d.tarifIA && d.prixMarche && d.tarifIA > d.prixMarche * 1.05).length}
  </div>
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
<div className="flex items-center gap-3">
<div className="p-3 bg-purple-100 rounded-lg">
  <Sparkles className="h-6 w-6 text-purple-600" />
</div>
<div>
  <div className="text-sm text-gray-600">Confiance moyenne IA</div>
  <div className="text-xl font-bold text-gray-900">
    {scoringData.length > 0 
      ? Math.round(scoringData.reduce((acc, d) => {
          const confiance = typeof d.confiance === 'string' 
            ? parseFloat(d.confiance.replace('%', '')) 
            : d.confiance || 0;
          return acc + confiance;
        }, 0) / scoringData.length)
      : 0}%
  </div>
</div>
</div>
</div>
</div>
</div>
);
}