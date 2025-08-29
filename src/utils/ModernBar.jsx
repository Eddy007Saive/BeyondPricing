
import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Composant Spinner
const Spinner = ({ size = "w-5 h-5", color = "text-white" }) => (
  <div className={`${size} ${color} animate-spin`}>
    <svg fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
    </svg>
  </div>
);

// Composant principal - Barre de progression basée sur les événements
const ModernProgressBar = ({ events, isConnected, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [completedEvents, setCompletedEvents] = useState([]);

  useEffect(() => {
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      
      // Détection d'erreur
      if (lastEvent.error) {
        setHasError(true);
        return;
      }
      
      // Calcul du progrès basé sur le nombre d'événements
      const newProgress = isConnected ? Math.min((events.length / 10) * 100, 90) : 100;
      setProgress(newProgress);
      
      // Marquer les événements précédents comme terminés
      if (!isConnected) {
        setCompletedEvents(events.map((_, index) => index));
      } else {
        setCompletedEvents(events.slice(0, -1).map((_, index) => index));
      }
    }
  }, [events, isConnected]);

  if (events.length === 0 && !isConnected) return null;

  const getEventIcon = (event, index) => {
    if (event.error) return ExclamationTriangleIcon;
    if (event.message?.toLowerCase().includes('connexion') || event.message?.toLowerCase().includes('init')) return SparklesIcon;
    if (event.message?.toLowerCase().includes('analyse') || event.message?.toLowerCase().includes('traitement')) return ChartBarIcon;
    if (event.message?.toLowerCase().includes('utilisateur') || event.message?.toLowerCase().includes('profil')) return UserGroupIcon;
    if (event.message?.toLowerCase().includes('message') || event.message?.toLowerCase().includes('email')) return EnvelopeIcon;
    return CheckCircleIcon;
  };

  return (
    <div className="mt-6 border border-gray-200 shadow-lg rounded-lg bg-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h6 className="text-lg font-semibold text-gray-800 mb-1">
              Progression en cours
            </h6>
            <p className="text-sm text-gray-600">
              {hasError ? 'Une erreur est survenue' : isConnected ? 'Traitement en cours...' : 'Terminé avec succès'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              hasError ? 'bg-red-50' : isConnected ? 'bg-blue-50' : 'bg-green-50'
            }`}>
              {isConnected ? (
                <Spinner size="w-2 h-2" color={hasError ? 'text-red-500' : 'text-blue-500'} />
              ) : (
                <div className={`w-2 h-2 rounded-full ${
                  hasError ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
              )}
              <span className={`text-sm ${
                hasError ? 'text-red-700' : isConnected ? 'text-blue-700' : 'text-green-700'
              }`}>
                {hasError ? 'Erreur' : isConnected ? 'En cours' : 'Terminé'}
              </span>
            </div>
            
            {onClose && (
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Barre de progression principale */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Progression générale
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                hasError ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Événements en temps réel */}
        <div className="space-y-4">
          {events.map((event, index) => {
            const isCompleted = completedEvents.includes(index);
            const isCurrent = !isCompleted && !event.error;
            const isError = event.error;
            const EventIcon = getEventIcon(event, index);
            
            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 ${
                  isError ? 'bg-red-50 border-red-200' :
                  isCurrent ? 'bg-blue-50 border-blue-200 shadow-sm' :
                  isCompleted ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isError ? 'bg-red-500' :
                  isCurrent ? 'bg-blue-500' :
                  isCompleted ? 'bg-green-500' :
                  'bg-gray-400'
                }`}>
                  {isError ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                  ) : isCompleted ? (
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  ) : isCurrent ? (
                    <Spinner size="w-5 h-5" color="text-white" />
                  ) : (
                    <EventIcon className="h-5 w-5 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isError ? 'text-red-800' :
                    isCurrent ? 'text-blue-800' :
                    isCompleted ? 'text-green-800' :
                    'text-gray-600'
                  }`}>
                    {event.message || `Événement ${index + 1}`}
                  </p>
                  
                  {event.data && (
                    <p className={`text-sm mt-1 ${
                      isError ? 'text-red-600' :
                      isCurrent ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {typeof event.data === 'string' ? event.data : JSON.stringify(event.data)}
                    </p>
                  )}
                  
                  {isError && event.error && (
                    <p className="text-sm text-red-700 mt-1 font-medium">
                      Erreur: {event.error}
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isError ? 'bg-red-100 text-red-800' :
                      isCurrent ? 'bg-blue-100 text-blue-800' :
                      isCompleted ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isError ? 'Erreur' :
                     isCurrent ? 'En cours' :
                     isCompleted ? 'Terminé' :
                     'En attente'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistiques en temps réel */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <h6 className="text-lg font-semibold text-gray-800">
                  {events.length}
                </h6>
                <p className="text-sm text-gray-600">
                  Événements
                </p>
              </div>
              <div className="text-center">
                <h6 className="text-lg font-semibold text-gray-800">
                  {completedEvents.length}
                </h6>
                <p className="text-sm text-gray-600">
                  Terminés
                </p>
              </div>
              <div className="text-center">
                <h6 className="text-lg font-semibold text-gray-800">
                  {Math.round(progress)}%
                </h6>
                <p className="text-sm text-gray-600">
                  Progression
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernProgressBar;