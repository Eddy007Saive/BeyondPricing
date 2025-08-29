import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix pour les icônes Leaflet dans React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuration des icônes
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Création d'icônes colorées à partir de l'icône par défaut
const StartIcon = new L.Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'start-icon' // Nous utiliserons CSS pour colorer cette icône
});

const EndIcon = new L.Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'end-icon' // Nous utiliserons CSS pour colorer cette icône
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour afficher les coordonnées actuelles de la souris
function MouseCoordinates() {
  const [position, setPosition] = useState(null);
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const onMouseMove = (e) => {
      setPosition([e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)]);
    };
    
    map.on('mousemove', onMouseMove);
    
    return () => {
      map.off('mousemove', onMouseMove);
    };
  }, [map]);
  
  return position ? (
    <div className="mouse-coordinates">
      Lat: {position[0]}, Lng: {position[1]}
    </div>
  ) : null;
}

// Composant pour le contrôle d'itinéraire
function RouteController({ startPoint, endPoint, onRouteFound, routeOptions }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  
  useEffect(() => {
    if (!map || !startPoint || !endPoint) return;
    
    // Vérifier que nous avons des coordonnées valides
    if (!Array.isArray(startPoint) || !Array.isArray(endPoint) || 
        startPoint.length !== 2 || endPoint.length !== 2) {
      console.error('Coordonnées invalides pour le routage');
      return;
    }
    
    console.log('Création du contrôle de routage avec les points:', startPoint, endPoint);
    
    try {
      // Fusionner les options par défaut avec les options personnalisées
      const defaultOptions = {
        profile: 'driving',
        lineColor: '#0066CC',
        lineWeight: 5,
        lineOpacity: 0.9
      };
      
      const options = { ...defaultOptions, ...(routeOptions || {}) };
      
      // Créer le contrôle de routage
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startPoint[0], startPoint[1]),
          L.latLng(endPoint[0], endPoint[1])
        ],
        routeWhileDragging: false,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: options.profile
        }),
        lineOptions: {
          styles: [{ 
            color: "red", 
            opacity: options.lineOpacity, 
            weight: options.lineWeight 
          }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: function() { return null; }
      }).addTo(map);
      
      routingControlRef.current = routingControl;
      
      // Quand l'itinéraire est trouvé
      routingControl.on('routesfound', function(e) {
        console.log('Itinéraire trouvé:', e);
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const summary = routes[0].summary;
          
          // Récupérer les instructions de l'itinéraire si disponibles
          const instructions = routes[0].instructions || [];
          
          // Ajuster la vue de la carte
          const coordinates = routes[0].coordinates;
          if (coordinates && coordinates.length > 0) {
            const bounds = L.latLngBounds(
              coordinates.map(coord => [coord.lat, coord.lng])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
          }
          
          // Calculer les heures et minutes
          const hours = Math.floor(summary.totalTime / 3600);
          const minutes = Math.floor((summary.totalTime % 3600) / 60);
          
          // Si un callback est fourni, envoyer les infos d'itinéraire
          if (onRouteFound) {
            onRouteFound({
              distance: (summary.totalDistance / 1000).toFixed(2),
              duration: `${hours} h ${minutes} min`,
              coordinates: routes[0].coordinates,
              instructions: instructions.map(instr => ({
                text: instr.text,
                distance: instr.distance,
                time: instr.time,
                type: instr.type
              }))
            });
          }
        }
      });
      
      routingControl.on('routingerror', function(e) {
        console.error('Erreur de routage:', e);
        if (onRouteFound) {
          onRouteFound({
            error: true,
            message: "Impossible de calculer l'itinéraire. Vérifiez les points de départ et d'arrivée."
          });
        }
      });
      
      // Forcer le calcul de l'itinéraire s'il ne se produit pas automatiquement
      setTimeout(() => {
        try {
          routingControl.route();
        } catch (error) {
          console.error('Erreur lors du forçage du calcul de l\'itinéraire:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la configuration du contrôle de routage:', error);
    }
    
    // Nettoyage
    return () => {
      try {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du contrôle de routage:', error);
      }
    };
  }, [map, startPoint, endPoint, onRouteFound, routeOptions]);
  
  return null;
}

// Composant pour imprimer la carte
function PrintControl() {
  const map = useMap();
  
  const handlePrint = () => {
    // Créer une version imprimable de la carte
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Carte à imprimer</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .print-map { width: 100%; height: 600px; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
          </style>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        </head>
        <body>
          <h1>Carte d'itinéraire</h1>
          <div class="info">
            <div id="routeInfo"></div>
          </div>
          <div id="printMap" class="print-map"></div>
          
          <script>
            // Initialiser la carte
            const map = L.map('printMap').setView([${map.getCenter().lat}, ${map.getCenter().lng}], ${map.getZoom()});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            
            // Imprimer automatiquement
            setTimeout(() => { window.print(); }, 1000);
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };
  
  return (
    <button 
      className="print-button"
      onClick={handlePrint}
      title="Imprimer la carte"
    >
      Imprimer
    </button>
  );
}

// Composant principal réutilisable
function RouteMap({ 
  startPoint, 
  endPoint, 
  startName = "Départ", 
  endName = "Arrivée", 
  title = "Itinéraire", 
  height = "600px",
  zoom = 8,
  onRouteFound,
  showInstructions = true,
  showCoordinates = true,
  showPrintButton = true,
  routeOptions = {
    profile: 'driving',
    lineColor: '#0066CC',
    lineWeight: 5,
    lineOpacity: 0.9
  },
  mapTileSource = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}) {
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Calculer le centre initial
  const centerLat = (startPoint[0] + endPoint[0]) / 2;
  const centerLng = (startPoint[1] + endPoint[1]) / 2;
  
  // Gestionnaire d'itinéraire trouvé
  const handleRouteFound = (info) => {
    console.log('Informations d\'itinéraire mises à jour:', info);
    setRouteInfo(info);
    if (onRouteFound) {
      onRouteFound(info);
    }
  };
  
  useEffect(() => {
    // Définir un drapeau lorsque le composant est entièrement monté
    setMapReady(true);
  }, []);
  
  return (
    <div className="route-map-container">
      <div className="route-info-panel">
        <h2>{title}</h2>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informations
          </button>
          {showInstructions && (
            <button 
              className={`tab ${activeTab === 'instructions' ? 'active' : ''}`}
              onClick={() => setActiveTab('instructions')}
              disabled={!routeInfo || routeInfo.error}
            >
              Instructions
            </button>
          )}
        </div>
        
        <div className="tab-content">
          {activeTab === 'info' && (
            <div>
              {routeInfo ? (
                routeInfo.error ? (
                  <p className="error-message">{routeInfo.message}</p>
                ) : (
                  <>
                    <p><strong>De:</strong> {startName}</p>
                    <p><strong>À:</strong> {endName}</p>
                    <p><strong>Distance:</strong> {routeInfo.distance} km</p>
                    <p><strong>Durée estimée:</strong> {routeInfo.duration}</p>
                    <div className="route-profile">
                      <strong>Mode:</strong> {
                        routeOptions.profile === 'driving' ? 'Voiture' :
                        routeOptions.profile === 'cycling' ? 'Vélo' :
                        routeOptions.profile === 'walking' ? 'À pied' : 
                        routeOptions.profile
                      }
                    </div>
                  </>
                )
              ) : (
                "Calcul de l'itinéraire en cours..."
              )}
            </div>
          )}
          
          {activeTab === 'instructions' && routeInfo && !routeInfo.error && (
            <div className="instructions-container">
              <h3>Instructions de l'itinéraire</h3>
              {routeInfo.instructions && routeInfo.instructions.length > 0 ? (
                <ol className="instructions-list">
                  {routeInfo.instructions.map((instruction, index) => (
                    <li key={index} className="instruction-item">
                      <span className="instruction-text">{instruction.text}</span>
                      {instruction.distance > 0 && (
                        <span className="instruction-distance">
                          {(instruction.distance / 1000).toFixed(1)} km
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>Instructions non disponibles pour cet itinéraire.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={zoom} 
        style={{ height: height, width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={mapTileSource}
          attribution={mapAttribution}
        />
        
        <ZoomControl position="bottomright" />
        
        <Marker position={startPoint} icon={StartIcon}>
          <Popup>
            <strong>{startName}</strong><br />
            Point de départ
          </Popup>
        </Marker>
        
        <Marker position={endPoint} icon={EndIcon}>
          <Popup>
            <strong>{endName}</strong><br />
            Destination
          </Popup>
        </Marker>
        
        {mapReady && (
          <RouteController 
            startPoint={startPoint} 
            endPoint={endPoint}
            onRouteFound={handleRouteFound}
            routeOptions={routeOptions}
          />
        )}
        
        {showCoordinates && <MouseCoordinates />}
        {showPrintButton && <PrintControl />}
      </MapContainer>
      
      <style jsx>{`
        .route-map-container {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        
        .route-info-panel {
          padding: 15px;
          background: white;
          margin-bottom: 15px;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }
        
        .tabs {
          display: flex;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .tab {
          padding: 8px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.7;
          transition: opacity 0.3s;
        }
        
        .tab.active {
          opacity: 1;
          font-weight: bold;
          border-bottom: 2px solid #0066CC;
        }
        
        .tab:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .tab-content {
          min-height: 100px;
        }
        
        .instructions-container {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .instructions-list {
          padding-left: 20px;
        }
        
        .instruction-item {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .instruction-distance {
          display: block;
          font-size: 0.85em;
          color: #666;
          margin-top: 3px;
        }
        
        .error-message {
          color: #d9534f;
          padding: 10px;
          background-color: #f9f2f2;
          border-radius: 5px;
        }
        
        /* Composants supplémentaires */
        :global(.mouse-coordinates) {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.8);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
        }
        
        :global(.print-button) {
          position: absolute;
          top: 10px;
          right: 10px;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
          z-index: 1000;
          font-size: 14px;
        }
        
        :global(.print-button:hover) {
          background: #f4f4f4;
        }
        
        /* Colorier les icônes avec CSS */
        :global(.start-icon) {
          filter: hue-rotate(120deg); /* Teinte verte */
        }
        
        :global(.end-icon) {
          filter: hue-rotate(330deg); /* Teinte rouge */
        }
        
        /* S'assurer que les lignes d'itinéraire Leaflet s'affichent correctement */
        :global(.leaflet-routing-container) {
          display: none;
        }
        
        :global(.leaflet-routing-alt) {
          max-height: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default RouteMap;