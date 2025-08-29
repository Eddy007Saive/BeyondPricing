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
const Spinner = ({ size = "w-4 h-4", color = "text-blue-500" }) => (
  <div className={`${size} ${color} animate-spin`}>
    <svg fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
    </svg>
  </div>
);

// Composant avec affichage d'un seul événement à la fois
const CompactTimelineProgress = ({ events = [], isConnected, onClose }) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Met à jour l'index de l'événement courant quand un nouvel événement arrive
  useEffect(() => {
    if (events.length > 0) {
      setCurrentEventIndex(events.length - 1);
    }
  }, [events.length]);

  useEffect(() => {
    console.log('Events:', events);
  }, [events, isConnected]);

  if (events.length === 0 && !isConnected) return null;

  // Récupère l'événement courant
  const currentEvent = events[currentEventIndex];

  return (
    <div className="mt-4 border-l-4 border-blue-500 shadow-sm bg-white rounded-lg">
      <div className="p-4">
        {/* Header avec spinner */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Spinner size="w-6 h-6" color="text-blue-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            )}
            <h6 className="text-lg font-semibold text-gray-800">
              {isConnected ? 'Traitement en cours...' : 'Traitement terminé'}
            </h6>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Affichage de l'événement courant uniquement */}
        {currentEvent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h6 className="text-sm font-medium text-gray-700">Événement actuel :</h6>
              <div className="text-xs text-gray-500">
                {currentEventIndex + 1} / {events.length}
              </div>
            </div>
            
            <div 
              className={`rounded-lg p-3 transition-all duration-500 transform ${
                currentEvent.error 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {currentEvent.error ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      #{currentEventIndex + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    currentEvent.error ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {currentEvent.error ? `Erreur: ${currentEvent.error}` : currentEvent.message}
                  </p>
                  {currentEvent.data && !currentEvent.error && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <p className="text-xs text-gray-600 break-words">
                        {typeof currentEvent.data === 'string' 
                          ? currentEvent.data 
                          : JSON.stringify(currentEvent.data, null, 2)
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation pour voir les événements précédents/suivants */}
            {events.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 1))}
                  disabled={currentEventIndex === 0}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentEventIndex(Math.min(events.length - 1, currentEventIndex + 1))}
                  disabled={currentEventIndex === events.length - 1}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}

        {/* Indicateur pour l'événement en cours */}
        {isConnected && events.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Spinner size="w-4 h-4" color="text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">
                En attente du prochain événement...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactTimelineProgress;