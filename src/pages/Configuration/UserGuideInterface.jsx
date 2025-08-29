import React, { useState } from "react";
import { 
  BookOpenIcon, 
  UserPlusIcon, 
  EnvelopeIcon, 
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  UserGroupIcon,
  BellIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export  function UserGuideInterface() {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: "overview",
      title: "Vue d'ensemble",
      icon: BookOpenIcon,
      color: "blue"
    },
    {
      id: "settings",
      title: "Configuration (OBLIGATOIRE)",
      icon: CogIcon,
      color: "red"
    },
    {
      id: "campaigns",
      title: "Création de campagnes",
      icon: EnvelopeIcon,
      color: "purple"
    },
    {
      id: "contacts",
      title: "Gestion des contacts",
      icon: UserGroupIcon,
      color: "green"
    },
    {
      id: "analytics",
      title: "Statistiques & Analyses",
      icon: ChartBarIcon,
      color: "orange"
    }
  ];

  const getColorClasses = (color, variant = "bg") => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        hover: "hover:bg-blue-50"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        hover: "hover:bg-green-50"
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        hover: "hover:bg-purple-50"
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200",
        hover: "hover:bg-orange-50"
      },
      gray: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        hover: "hover:bg-gray-50"
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        hover: "hover:bg-red-50"
      }
    };
    return colors[color] || colors.gray;
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "settings":
        return renderSettingsGuide();
      case "campaigns":
        return renderCampaignsGuide();
      case "contacts":
        return renderContactsGuide();
      case "analytics":
        return renderAnalyticsGuide();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <BookOpenIcon className="h-8 w-8 text-blue-600" />
          Bienvenue dans votre application de prospection intelligente
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          Cette application automatise votre prospection en collectant des profils, 
          en générant des messages personnalisés via IA et en gérant vos campagnes de manière intelligente. 
          Suivez ce guide pour configurer et optimiser votre prospection automatisée.
        </p>
      </div>

      {/* Alerte importante */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Configuration obligatoire avant utilisation</h3>
            <p className="text-red-800 text-sm">
              Avant de créer vos premières campagnes, vous DEVEZ impérativement configurer votre application 
              avec vos paramètres de connexion pour éviter la détection et assurer le bon fonctionnement.
            </p>
          </div>
        </div>
      </div>

      {/* Fonctionnalités principales */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Fonctionnalités de l'application</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: CogIcon,
              title: "Collecte automatisée de profils",
              description: "Extraction automatique de profils selon vos critères de recherche avec protection anti-détection.",
              color: "red"
            },
            {
              icon: UserGroupIcon,
              title: "Génération IA de messages",
              description: "Messages personnalisés automatiquement générés par IA selon vos directives et le profil de chaque prospect.",
              color: "purple"
            },
            {
              icon: EnvelopeIcon,
              title: "Campagnes intelligentes",
              description: "Gestion automatisée des campagnes avec tri intelligent des profils et enrichissement des données.",
              color: "green"
            },
            {
              icon: ChartBarIcon,
              title: "Suivi et notifications",
              description: "Notifications par email à chaque étape et analytics détaillées de vos campagnes.",
              color: "orange"
            }
          ].map((feature, index) => {
            const colors = getColorClasses(feature.color);
            return (
              <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-5 transition-all duration-200 hover:shadow-md`}>
                <div className="flex items-start gap-4">
                  <div className={`${colors.bg} p-2 rounded-lg`}>
                    <feature.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${colors.text} mb-2`}>{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide de démarrage obligatoire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <PlayIcon className="h-6 w-6 text-green-600" />
          Guide de démarrage obligatoire
        </h3>
        <div className="space-y-4">
          {[
            { 
              step: 1, 
              title: "Configuration système (OBLIGATOIRE)", 
              description: "Configurez vos cookies de connexion, User-Agent et email de notification",
              urgent: true
            },
            { 
              step: 2, 
              title: "Créez votre première campagne", 
              description: "Définissez nom unique, poste cible, quota de collecte et messages IA" 
            },
            { 
              step: 3, 
              title: "Enrichissement automatique", 
              description: "L'IA enrichit et trie automatiquement tous les profils collectés" 
            },
            { 
              step: 4, 
              title: "Suivi et optimisation", 
              description: "Recevez les notifications et ajustez selon vos besoins" 
            }
          ].map((item) => (
            <div key={item.step} className={`flex items-start gap-4 p-4 ${item.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'} rounded-lg`}>
              <div className={`${item.urgent ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm`}>
                {item.step}
              </div>
              <div>
                <h4 className={`font-medium ${item.urgent ? 'text-red-900' : 'text-gray-900'}`}>
                  {item.title}
                  {item.urgent && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">REQUIS</span>}
                </h4>
                <p className={`${item.urgent ? 'text-red-700' : 'text-gray-600'} text-sm mt-1`}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment ça fonctionne */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <InformationCircleIcon className="h-6 w-6 text-purple-600" />
          Comment fonctionne l'automatisation
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Collecte intelligente :</strong> L'application collecte automatiquement les profils selon votre requête de recherche</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Tri automatique :</strong> Tous les profils sont analysés et triés selon vos critères prédéfinis</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Messages personnalisés :</strong> L'IA génère un message unique pour chaque profil selon vos directives</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Enrichissement continu :</strong> Les données sont enrichies pendant plusieurs jours pour optimiser la qualité</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsGuide = () => (
    <div className="space-y-8">
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <CogIcon className="h-8 w-8 text-red-600" />
          Configuration obligatoire du système
        </h2>
        <p className="text-red-800 font-medium">
          Cette configuration est OBLIGATOIRE avant toute utilisation de l'application !
        </p>
        <p className="text-gray-700 mt-2">
          Configurez vos paramètres de connexion pour éviter la détection et assurer le bon fonctionnement de la collecte automatique.
        </p>
      </div>

      {/* Configuration cookies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg">
            <CogIcon className="h-6 w-6 text-red-600" />
          </div>
          1. Configuration des cookies de connexion
        </h3>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-3">Récupération des cookies</h4>
            <div className="space-y-3 text-sm text-red-800">
              <p><strong>Pourquoi c'est nécessaire :</strong> Les cookies permettent à l'application de s'authentifier et d'accéder aux profils sans être bloquée.</p>
              <div className="bg-white border border-red-300 rounded p-3">
                <p className="font-medium mb-2">Étapes pour récupérer vos cookies :</p>
                <ol className="space-y-1 ml-4">
                  <li>1. Connectez-vous à votre plateforme dans votre navigateur</li>
                  <li>2. Ouvrez les outils de développeur (F12)</li>
                  <li>3. Allez dans l'onglet "Application" ou "Storage"</li>
                  <li>4. Cliquez sur "Cookies" puis sélectionnez le domaine</li>
                  <li>5. Copiez TOUS les cookies et collez-les dans le champ de configuration</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Important</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Les cookies expirent régulièrement, pensez à les mettre à jour</li>
              <li>• Ne partagez jamais vos cookies avec d'autres personnes</li>
              <li>• Renouvelez les cookies si vous remarquez des erreurs de connexion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration User-Agent */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="bg-purple-100 p-2 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
          </div>
          2. Configuration du User-Agent
        </h3>
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-3">Protection anti-détection</h4>
            <div className="space-y-3 text-sm text-purple-800">
              <p><strong>Qu'est-ce que le User-Agent :</strong> C'est l'identifiant de votre navigateur qui indique quelle version et système d'exploitation vous utilisez.</p>
              <p><strong>Pourquoi c'est crucial :</strong> Un User-Agent incorrect peut signaler que vous utilisez un bot automatisé, ce qui peut entraîner des restrictions sur votre compte.</p>
              
              <div className="bg-white border border-purple-300 rounded p-3">
                <p className="font-medium mb-2">Comment récupérer votre User-Agent :</p>
                <ol className="space-y-1 ml-4">
                  <li>1. Allez sur whatismyuseragent.com</li>
                  <li>2. Copiez la chaîne User-Agent affichée</li>
                  <li>3. Collez-la dans le champ de configuration de l'application</li>
                </ol>
              </div>
              
              <div className="bg-purple-100 border border-purple-300 rounded p-3">
                <p className="font-medium">Exemple de User-Agent :</p>
                <code className="text-xs bg-gray-100 p-2 rounded block mt-1 break-all">
                  Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
                </code>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h5 className="font-medium text-blue-900 mb-2">Pourquoi le User-Agent est si important :</h5>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• Il identifie votre navigateur et votre système</li>
                  <li>• Les plateformes l'utilisent pour détecter les bots</li>
                  <li>• Un User-Agent cohérent évite les suspicions</li>
                  <li>• Il doit correspondre exactement à votre navigateur</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration email notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <EnvelopeIcon className="h-6 w-6 text-green-600" />
          </div>
          3. Configuration des notifications par email
        </h3>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Suivi en temps réel</h4>
            <p className="text-sm text-green-800 mb-3">
              Recevez des notifications par email à chaque étape importante de vos campagnes.
            </p>
            
            <div className="space-y-2 text-sm text-green-800">
              <h5 className="font-medium">Vous serez notifié pour :</h5>
              <ul className="space-y-1 ml-4">
                <li>• Début de collecte d'une campagne</li>
                <li>• Fin de collecte quotidienne</li>
                <li>• Génération des messages IA terminée</li>
                <li>• Erreurs ou problèmes techniques</li>
                <li>• Rapport quotidien des performances</li>
                <li>• Fin complète d'une campagne</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Conseil</h4>
            <p className="text-sm text-blue-800">
              Utilisez une adresse email que vous consultez régulièrement pour ne manquer aucune notification importante concernant vos campagnes.
            </p>
          </div>
        </div>
      </div>

      {/* Vérification de configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Vérification de la configuration</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Checklist avant de commencer :</h4>
            <div className="space-y-2">
              {[
                "Cookies de connexion récupérés et configurés",
                "User-Agent correct configuré", 
                "Adresse email de notification définie",
                "Test de connexion réussi"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Une fois la configuration terminée,</strong> vous pouvez passer à la création de votre première campagne !
            </p>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          Sécurité et bonnes pratiques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">À éviter absolument</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Collecter plus de 100 profils/jour</li>
              <li>• Utiliser un User-Agent incorrect</li>
              <li>• Partager vos cookies de connexion</li>
              <li>• Ignorer les limites recommandées</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Bonnes pratiques</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Respecter les quotas recommandés</li>
              <li>• Mettre à jour régulièrement les cookies</li>
              <li>• Surveiller les notifications</li>
              <li>• Utiliser des messages authentiques</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCampaignsGuide = () => (
    <div className="space-y-8">
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <EnvelopeIcon className="h-8 w-8 text-purple-600" />
          Création et gestion des campagnes
        </h2>
        <p className="text-gray-700">
          Créez votre première campagne de prospection en définissant vos critères et messages personnalisés.
        </p>
      </div>

      {/* Création d'une campagne étape par étape */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Création de votre première campagne</h3>
        <div className="space-y-6">
          
          {/* Nom de campagne */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">1. Nom de la campagne (unique)</h4>
            <p className="text-purple-800 text-sm mb-3">Choisissez un nom unique et descriptif pour identifier votre campagne.</p>
            <div className="bg-white border border-purple-300 rounded p-3">
              <p className="font-medium text-sm mb-2">Exemples de noms :</p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• "Directeurs Marketing Tech 2024"</li>
                <li>• "CEOs Startups FinTech"</li>
                <li>• "Responsables RH PME Paris"</li>
              </ul>
            </div>
          </div>

          {/* Poste cible */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">2. Définition du poste cible</h4>
            <p className="text-blue-800 text-sm mb-3">Définissez précisément le type de profil que vous recherchez. Respectez la syntaxe de recherche pour un ciblage optimal.</p>
            <div className="bg-white border border-blue-300 rounded p-3">
              <p className="font-medium text-sm mb-2">Comment rédiger des requêtes efficaces :</p>
              <div className="text-xs text-gray-700 space-y-1 mb-3">
                <p>• Utilisez des mots-clés précis : "Directeur Marketing" plutôt que "Marketing"</p>
                <p>• Combinez les termes : "CEO AND startup" ou "Manager OR Director"</p>
                <p>• Précisez le secteur : "Directeur Commercial SaaS"</p>
                <p>• Ajoutez la localisation si nécessaire : "Responsable RH Paris"</p>
              </div>
              <a 
                href="https://www.linkedin.com/help/linkedin/answer/75814" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs hover:text-blue-800"
              >
                → Guide complet pour rédiger des requêtes de recherche efficaces
              </a>
            </div>
          </div>

          {/* Quota journalier */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">3. Nombre de profils à collecter par jour</h4>
            <p className="text-green-800 text-sm mb-3">Définissez le quota quotidien de profils à collecter pour votre campagne.</p>
            <div className="bg-white border border-green-300 rounded p-3">
              <div className="text-xs text-gray-700 space-y-1">
                <p><strong>Recommandations :</strong></p>
                <p>• Débutant : 20-30 profils/jour</p>
                <p>• Intermédiaire : 40-60 profils/jour</p>
                <p>• Avancé : 80-100 profils/jour maximum</p>
                <p><strong>Important :</strong> Ne jamais dépasser 100 profils/jour pour éviter les restrictions</p>
              </div>
            </div>
          </div>


          {/* Directives IA */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">5. Directives pour l'agent IA</h4>
            <p className="text-yellow-800 text-sm mb-3">Donnez des instructions précises à l'IA pour personnaliser les messages selon chaque profil.</p>
            <div className="bg-white border border-yellow-300 rounded p-3">
              <p className="font-medium text-sm mb-2">Exemples de directives :</p>
              <div className="text-xs text-gray-700 space-y-1">
                <p>• "Adapte le ton selon le niveau hiérarchique du prospect"</p>
                <p>• "Mentionne un point spécifique de leur parcours ou entreprise"</p>
                <p>• "Garde un ton professionnel mais chaleureux"</p>
                <p>• "Propose une valeur concrète liée à leur secteur d'activité"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processus d'enrichissement */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Processus d'enrichissement automatique</h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Comment fonctionne l'enrichissement</h4>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p><strong>Collecte initiale :</strong> L'application collecte tous les profils correspondant à votre recherche</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p><strong>Analyse et tri :</strong> Chaque profil est analysé selon vos critères et automatiquement qualifié</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <p><strong>Enrichissement continu :</strong> Les données sont enrichies pendant plusieurs jours pour optimiser la qualité</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                <div>
                  <p><strong>Génération IA :</strong> L'IA génère des messages personnalisés pour chaque profil qualifié</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Retri manuel disponible</h4>
            <p className="text-green-800 text-sm">
              Même après l'enrichissement automatique, vous pouvez toujours retrier manuellement vos contacts selon vos besoins spécifiques et ajuster leur qualification.
            </p>
          </div>
        </div>
      </div>

      {/* Bonnes pratiques */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bonnes pratiques pour vos campagnes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              À faire
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Définir clairement votre cible</li>
              <li>• Utiliser des mots-clés précis</li>
              <li>• Personnaliser vos messages</li>
              <li>• Respecter les quotas recommandés</li>
              <li>• Suivre les notifications de progression</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              À éviter
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Messages trop génériques</li>
              <li>• Requêtes de recherche trop larges</li>
              <li>• Dépasser les quotas journaliers</li>
              <li>• Ignorer les retours et ajustements</li>
              <li>• Négliger le suivi de performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactsGuide = () => (
    <div className="space-y-8">
      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <UserGroupIcon className="h-8 w-8 text-green-600" />
          Gestion des contacts
        </h2>
        <p className="text-gray-700">
          Découvrez comment gérer efficacement vos contacts, les qualifier et optimiser votre prospection.
        </p>
      </div>

      {/* Ajout de contacts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlusIcon className="h-6 w-6 text-green-600" />
          Sources d'ajout de contacts
        </h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Import automatique via campagnes</h4>
            <p className="text-blue-800 text-sm">Les contacts sont automatiquement ajoutés lors de vos campagnes de prospection et enrichis par l'IA.</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ajout manuel</h4>
            <p className="text-gray-700 text-sm">Cliquez sur "Nouveau Contact" pour ajouter manuellement un prospect avec tous ses détails.</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Import CSV/Excel</h4>
            <p className="text-purple-800 text-sm">Importez en masse vos contacts existants via fichier CSV ou Excel avec mapping automatique des champs.</p>
          </div>
        </div>
      </div>

      {/* Système de qualification */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Système de qualification</h3>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Statuts de contact :</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { status: "Non contacté", color: "gray", description: "Contact ajouté mais pas encore approché" },
              { status: "Message envoyé", color: "blue", description: "Premier message envoyé au prospect" },
              { status: "Réponse reçue", color: "green", description: "Le prospect a répondu à votre message" },
              { status: "Intéressé", color: "green", description: "Le prospect montre de l'intérêt" },
              { status: "Non intéressé", color: "red", description: "Le prospect n'est pas intéressé" },
              { status: "À relancer", color: "orange", description: "Contact à relancer ultérieurement" },
              { status: "Rendez-vous pris", color: "green", description: "Meeting planifié avec le prospect" }
            ].map((item, index) => {
              const colors = getColorClasses(item.color);
              return (
                <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-3`}>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors.text} ${colors.bg} border ${colors.border} mb-2`}>
                    {item.status}
                  </span>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Profils de qualification :</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Gardé</span>
              </div>
              <p className="text-green-700 text-sm">Prospect qualifié et intéressant</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">En attente</span>
              </div>
              <p className="text-orange-700 text-sm">Prospect à évaluer ou en cours d'analyse</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Rejeté</span>
              </div>
              <p className="text-red-700 text-sm">Prospect ne correspondant pas aux critères</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <EyeIcon className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-2">Voir les détails</h4>
            <p className="text-gray-600 text-sm">Consultez toutes les informations d'un contact en un clic</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <PencilIcon className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-2">Modifier</h4>
            <p className="text-gray-600 text-sm">Mettez à jour les informations de vos contacts</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <FunnelIcon className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-2">Filtrer</h4>
            <p className="text-gray-600 text-sm">Recherchez et filtrez vos contacts par statut, profil ou campagne</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsGuide = () => (
    <div className="space-y-8">
      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <ChartBarIcon className="h-8 w-8 text-orange-600" />
          Statistiques & Analyses
        </h2>
        <p className="text-gray-700">
          Analysez vos performances, identifiez les opportunités d'amélioration et optimisez vos résultats.
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Indicateurs clés de performance (KPIs)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { metric: "Taux d'ouverture", description: "% de messages ouverts", color: "blue" },
            { metric: "Taux de réponse", description: "% de prospects qui répondent", color: "green" },
            { metric: "Taux de conversion", description: "% de prospects convertis", color: "purple" },
            { metric: "ROI des campagnes", description: "Retour sur investissement", color: "orange" }
          ].map((kpi, index) => {
            const colors = getColorClasses(kpi.color);
            return (
              <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                <h4 className={`font-semibold ${colors.text} mb-2`}>{kpi.metric}</h4>
                <p className="text-gray-600 text-sm">{kpi.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tableaux de bord */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tableaux de bord disponibles</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Vue d'ensemble des campagnes</h4>
            <p className="text-gray-600 text-sm">Performances globales de toutes vos campagnes actives et terminées</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Analyse des contacts</h4>
            <p className="text-gray-600 text-sm">Répartition de vos contacts par statut, source et niveau d'engagement</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Évolution temporelle</h4>
            <p className="text-gray-600 text-sm">Tendances de vos performances sur différentes périodes</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Analyse comparative</h4>
            <p className="text-gray-600 text-sm">Comparaison des performances entre différentes campagnes ou segments</p>
          </div>
        </div>
      </div>

      {/* Optimisation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Conseils d'optimisation</h3>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Analysez régulièrement :</strong> Consultez vos statistiques chaque semaine pour identifier les tendances</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>A/B testez :</strong> Comparez différents messages pour trouver les plus efficaces</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Segmentez finement :</strong> Adaptez votre approche selon le profil de vos prospects</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Optimisez le timing :</strong> Identifiez les meilleurs moments pour contacter vos prospects</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                Guide d'utilisation
              </h1>
              <p className="text-gray-600 mt-2">
                Apprenez à utiliser efficacement votre application de prospection intelligente
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Version 2.1.0
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu de navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">Sommaire</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const colors = getColorClasses(section.color);
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        isActive 
                          ? `${colors.bg} ${colors.text} ${colors.border} border shadow-sm` 
                          : `hover:bg-gray-50 text-gray-700 border border-transparent`
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? colors.text : 'text-gray-400'}`} />
                      <span className="font-medium text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Liens utiles */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 text-sm">Liens utiles</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <DocumentTextIcon className="h-4 w-4" />
                    Documentation API
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <BellIcon className="h-4 w-4" />
                    Nouveautés
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <UserGroupIcon className="h-4 w-4" />
                    Communauté
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Pied de page d'aide */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-gray-600 mb-4">
              Notre équipe support est là pour vous accompagner dans l'utilisation de l'application
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <BellIcon className="h-4 w-4" />
                Contacter le support
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <DocumentTextIcon className="h-4 w-4" />
                Voir la FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
)}