import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw, Activity, Mail, Shield, Zap, Globe, Monitor } from 'lucide-react';
import { 
  getConfiguration, 
  updateConfiguration, 
  getQuota, 
  getSystemStatus,
  validateConfiguration 
} from '@/services/Configuration';

export function LinkedInConfigInterface() {
  const [config, setConfig] = useState({
    liAt: '',
    email: '',
    userAgent: '',
    status: 'Actif'
  });
  
  const [quota, setQuota] = useState({
    quotaRestant: 0,
    derniereMiseAJour: '',
    idCampagneActive: ''
  });
  
  const [showCookies, setShowCookies] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);

  // Auto-détecter le User-Agent du navigateur actuel
  const detectUserAgent = () => {
    const currentUA = navigator.userAgent;
    handleInputChange('userAgent', currentUA);
  };

  // Charger la configuration au montage du composant
  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      const status = await getSystemStatus();
      if (status.success) {
        setSystemStatus(status.data);
        
        // Charger la configuration
        if (status.data.configuration) {
          setConfig({
            liAt: status.data.configuration.valeur || '',
            email: status.data.configuration.email || '',
            userAgent: status.data.configuration.userAgent || '',
            status: status.data.configuration.status || 'Actif'
          });
        }
        
        // Charger le quota
        if (status.data.quota) {
          setQuota(status.data.quota);
        }
        
        // Mettre à jour le statut de validation
        if (status.data.validation) {
          setValidationStatus({
            liAt: {
              valid: status.data.validation.details?.cookieValid || false,
              message: status.data.validation.message
            },
            email: {
              valid: status.data.validation.details?.emailValid || false,
              message: status.data.validation.details?.emailValid ? 'Email valide' : 'Email invalide'
            },
            userAgent: {
              valid: status.data.validation.details?.userAgentValid || false,
              message: status.data.validation.details?.userAgentValid ? 'User-Agent valide' : 'User-Agent invalide'
            }
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validation en temps réel
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = value && emailRegex.test(value);
      setValidationStatus(prev => ({
        ...prev,
        email: {
          valid: isValid,
          message: isValid ? 'Email valide' : 'Email invalide'
        }
      }));
    } else if (field === 'liAt') {
      const isValid = value && value.length > 50 && value.startsWith('AQEDA');
      setValidationStatus(prev => ({
        ...prev,
        liAt: {
          valid: isValid,
          message: isValid ? 'Cookie valide' : 'Cookie invalide ou manquant'
        }
      }));
    } else if (field === 'userAgent') {
      // Validation basique du User-Agent
      const isValid = value && value.length > 50 && value.includes('Mozilla');
      setValidationStatus(prev => ({
        ...prev,
        userAgent: {
          valid: isValid,
          message: isValid ? 'User-Agent valide' : 'User-Agent invalide ou manquant'
        }
      }));
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    
    try {
      const configData = {
        valeur: config.liAt,
        email: config.email,
        userAgent: config.userAgent,
        status: config.status
      };

      const result = await updateConfiguration(configData);
      
      if (result.success) {
        // Notification de succès moderne
        showNotification('Configuration sauvegardée avec succès !', 'success');
        // Recharger le statut système
        await loadSystemData();
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la sauvegarde: ' + (error.response?.data?.errors || error.message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - dans un vrai projet, utiliser une librairie comme react-hot-toast
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chargement de la configuration...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configuration LinkedIn
              </h1>
              <p className="text-gray-600">Configurez votre connexion LinkedIn pour automatiser vos campagnes</p>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        {systemStatus && (
          <div className="mb-6">
            <div className={`rounded-lg border p-4 ${
              systemStatus.systemReady 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {systemStatus.systemReady ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {systemStatus.systemReady ? 'Système Opérationnel' : 'Configuration Requise'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {systemStatus.systemReady 
                      ? 'Votre configuration est complète et fonctionnelle' 
                      : 'Veuillez compléter la configuration'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quota Card */}
        {quota && (
          <div className="mb-6">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quota Journalier</h3>
                    <p className="text-sm text-gray-600">Gestion de vos connexions quotidiennes</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{quota.quotaRestant}</div>
                  <p className="text-sm text-gray-500">connexions restantes</p>
                </div>
              </div>
              
              {quota.derniereMiseAJour && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Dernière mise à jour: {quota.derniereMiseAJour}
                    {quota.idCampagneActive && (
                      <span className="ml-4 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                        Campagne: {quota.idCampagneActive}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Cards */}
        <div className="space-y-6 mb-6">
          {/* Cookie Configuration */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Configuration des Cookies</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cookie li_at (obligatoire)
                </label>
                <div className="relative">
                  <input
                    type={showCookies ? "text" : "password"}
                    value={config.liAt}
                    onChange={(e) => handleInputChange('liAt', e.target.value)}
                    placeholder="Entrez votre cookie li_at..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCookies(!showCookies)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCookies ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationStatus.liAt && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.liAt.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationStatus.liAt.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.liAt.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User-Agent Configuration */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Configuration User-Agent</h3>
                </div>
                <button
                  onClick={detectUserAgent}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Détecter automatiquement
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User-Agent (recommandé)
                </label>
                <div className="relative">
                  <textarea
                    value={config.userAgent}
                    onChange={(e) => handleInputChange('userAgent', e.target.value)}
                    placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                {validationStatus.userAgent && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.userAgent.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationStatus.userAgent.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.userAgent.message}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Identifie votre navigateur pour éviter la détection automatisée
                </p>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Configuration Email</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de notification
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {validationStatus.email && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.email.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationStatus.email.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.email.message}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Recevez des notifications sur l'état de vos campagnes
                </p>
              </div>
            </div>
          </div>

          {/* Status Configuration */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Statut du Système</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État de la configuration
                </label>
                <select
                  value={config.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Actif">🟢 Actif</option>
                  <option value="Inactif">🔴 Inactif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Guide de configuration</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
                <div>
                  <h5 className="font-semibold mb-2">📍 Obtenir le cookie LinkedIn :</h5>
                  <div className="space-y-1">
                    <div>1. Connectez-vous à LinkedIn</div>
                    <div>2. Ouvrez F12 → Application → Cookies</div>
                    <div>3. Trouvez "https://www.linkedin.com"</div>
                    <div>4. Copiez la valeur "li_at"</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">🌐 Obtenir le User-Agent :</h5>
                  <div className="space-y-1">
                    <div>1. Ouvrez F12 → Console</div>
                    <div>2. Tapez: navigator.userAgent</div>
                    <div>3. Ou cliquez sur "Détecter automatiquement"</div>
                    <div>4. Copiez la valeur affichée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={isSaving || !validationStatus.liAt?.valid || !validationStatus.email?.valid}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder la Configuration'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkedInConfigInterface;