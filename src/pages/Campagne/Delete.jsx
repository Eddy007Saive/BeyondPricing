import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Progress,
  Chip,
  IconButton,
  Spinner,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Badge,
} from "@material-tailwind/react";
import {
  UserGroupIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  PlayIcon,
  StopIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  DocumentTextIcon,
  XCircleIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  PhoneIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function CampaignDetailDashboard() {
  // États simulés pour la démo
  const [campaignData, setCampaignData] = useState({
    nom: "Développeur Full Stack Senior - Paris",
    poste: "Développeur Full Stack",
    zone: "Paris & Île-de-France",
    statut: "Actif",
    dateCreation: new Date().toISOString(),
    experienceMin: 3,
    experienceMax: 8,
    langues: "Français, Anglais",
    secteurs: "Tech, Fintech, E-commerce"
  });

  // Données simulées avec plus de détails
  const [contactsData, setContactsData] = useState([
    { id: 1, statut: 'Message envoyé', hasPersonalizedMessage: true, lastContact: '2025-01-15' },
    { id: 2, statut: 'Répondu', hasPersonalizedMessage: true, lastContact: '2025-01-14' },
    { id: 3, statut: 'À contacter', hasPersonalizedMessage: false, lastContact: null },
    { id: 4, statut: 'Rendez-vous pris', hasPersonalizedMessage: true, lastContact: '2025-01-13' },
    { id: 5, statut: 'Pas intéressé', hasPersonalizedMessage: true, lastContact: '2025-01-12' },
    { id: 6, statut: 'À recontacter', hasPersonalizedMessage: true, lastContact: '2025-01-10' },
    { id: 7, statut: 'Message envoyé', hasPersonalizedMessage: false, lastContact: '2025-01-15' },
    { id: 8, statut: 'À contacter', hasPersonalizedMessage: false, lastContact: null },
    { id: 9, statut: 'Répondu', hasPersonalizedMessage: true, lastContact: '2025-01-14' },
    { id: 10, statut: 'Rendez-vous pris', hasPersonalizedMessage: true, lastContact: '2025-01-11' },
  ]);

  const [loading, setLoading] = useState(false);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [regeneratingMessages, setRegeneratingMessages] = useState(false);

  // Calculs des statistiques avancées
  const totalContacts = contactsData.length;
  const contactsWithPersonalizedMessage = contactsData.filter(c => c.hasPersonalizedMessage).length;
  const contactsWithoutPersonalizedMessage = totalContacts - contactsWithPersonalizedMessage;
  const personalizedMessagePercentage = ((contactsWithPersonalizedMessage / totalContacts) * 100).toFixed(1);

  const messagesSent = contactsData.filter(c =>
    ['Message envoyé', 'Répondu', 'Pas intéressé', 'À recontacter', 'Rendez-vous pris'].includes(c.statut)
  ).length;

  const responsesReceived = contactsData.filter(c =>
    ['Répondu', 'Pas intéressé', 'Rendez-vous pris'].includes(c.statut)
  ).length;

  const interested = contactsData.filter(c => c.statut === 'Rendez-vous pris').length;
  const notInterested = contactsData.filter(c => c.statut === 'Pas intéressé').length;
  const responded = contactsData.filter(c => c.statut === 'Répondu').length;
  const notContacted = contactsData.filter(c => !c.statut || c.statut === 'À contacter').length;
  const toRelaunch = contactsData.filter(c => c.statut === 'À recontacter').length;

  const responseRate = messagesSent > 0 ? ((responsesReceived / messagesSent) * 100).toFixed(1) : 0;
  const conversionRate = messagesSent > 0 ? ((interested / messagesSent) * 100).toFixed(1) : 0;
  const rejectRate = messagesSent > 0 ? ((notInterested / messagesSent) * 100).toFixed(1) : 0;

  // Fonctions d'actions
  const onBack = () => console.log("Retour");
  const onViewContacts = () => console.log("Voir contacts");
  const onEditCampaign = () => console.log("Modifier campagne");
  const onEnrichContacts = () => console.log("Enrichir contacts");

  const onGenerateMessages = async () => {
    setGeneratingMessages(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratingMessages(false);
    console.log("Messages générés");
  };

  const onRegenerateMessages = async () => {
    setRegeneratingMessages(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRegeneratingMessages(false);
    console.log("Messages régénérés");
  };

  const handleLaunchCampaign = async () => {
    setLaunchingCampaign(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLaunchingCampaign(false);
  };

  // Cartes de statistiques principales
  const mainStatistics = [
    {
      color: "blue",
      icon: UserGroupIcon,
      title: "Contacts Totaux",
      value: totalContacts.toString(),
      subtitle: `${interested} qualifiés`,
      trend: { value: "+12%", positive: true, label: "vs. semaine dernière" }
    },
    {
      color: "green",
      icon: EnvelopeIcon,
      title: "Messages Envoyés",
      value: messagesSent.toString(),
      subtitle: `${responseRate}% de réponse`,
      trend: { value: "+8%", positive: true, label: "taux de réponse" }
    },
    {
      color: "purple",
      icon: SparklesIcon,
      title: "Messages Personnalisés",
      value: `${personalizedMessagePercentage}%`,
      subtitle: `${contactsWithPersonalizedMessage}/${totalContacts}`,
      trend: { value: contactsWithoutPersonalizedMessage > 0 ? "À compléter" : "Terminé", positive: contactsWithoutPersonalizedMessage === 0 }
    },
    {
      color: "orange",
      icon: CheckCircleIcon,
      title: "Taux de Conversion",
      value: `${conversionRate}%`,
      subtitle: `${interested} entretiens`,
      trend: { value: "+15%", positive: true, label: "objectif atteint" }
    }
  ];

  // Statistiques détaillées
  const detailedStatistics = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Interactions",
      items: [
        { label: "Réponses positives", value: responded, color: "green" },
        { label: "Pas intéressé", value: notInterested, color: "red" },
        { label: "En attente de réponse", value: messagesSent - responsesReceived, color: "orange" }
      ]
    },
    {
      icon: ClockIcon,
      title: "Statuts de suivi",
      items: [
        { label: "À recontacter", value: toRelaunch, color: "orange" },
        { label: "Non contactés", value: notContacted, color: "blue-gray" },
        { label: "Relances nécessaires", value: Math.floor(toRelaunch * 0.7), color: "purple" }
      ]
    },
    {
      icon: DocumentTextIcon,
      title: "Messages personnalisés",
      items: [
        { label: "Générés", value: contactsWithPersonalizedMessage, color: "green" },
        { label: "En attente", value: contactsWithoutPersonalizedMessage, color: "orange" },
        { label: "Taux de complétion", value: `${personalizedMessagePercentage}%`, color: "blue" }
      ]
    }
  ];

  const StatCard = ({ color, icon, title, value, subtitle, trend }) => (
    <Card className="border border-blue-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader
        variant="gradient"
        color={color}
        floated={false}
        shadow={false}
        className="absolute grid h-14 w-14 place-items-center"
      >
        {React.createElement(icon, { className: "w-7 h-7 text-white" })}
      </CardHeader>
      <CardBody className="p-4 text-right">
        <Typography variant="small" className="font-normal text-blue-gray-600 mb-1">
          {title}
        </Typography>
        <Typography variant="h3" color="blue-gray" className="mb-2">
          {value}
        </Typography>
        <Typography variant="small" className="text-blue-gray-500 mb-2">
          {subtitle}
        </Typography>
        {trend && (
          <div className="flex items-center justify-end gap-1">
            {trend.positive ? (
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDownIcon className="h-3 w-3 text-red-500" />
            )}
            <Typography variant="small" className={trend.positive ? "text-green-500" : "text-red-500"}>
              {trend.value}
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* En-tête moderne */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <IconButton
              variant="text"
              color="blue-gray"
              onClick={onBack}
              className="rounded-full hover:bg-blue-50"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <div>
              <Typography variant="h3" color="blue-gray" className="mb-2 font-bold">
                {campaignData.nom}
              </Typography>
              <div className="flex items-center gap-6 text-sm text-blue-gray-600">
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4" />
                  <span>{campaignData.poste}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{campaignData.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>Créée le {new Date(campaignData.dateCreation).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge
              content={interested}
              className="bg-green-500 text-white"
            >
              <Chip
                variant="gradient"
                color={campaignData.statut === "Actif" ? "green" : "blue-gray"}
                value={campaignData.statut}
                className="py-2 px-4 text-sm font-medium"
              />
            </Badge>
          </div>
        </div>

        {/* Barre d'actions moderne et espacée */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Actions principales */}
            <div className="lg:col-span-2">
              <Typography variant="small" className="font-semibold text-blue-gray-700 mb-3">
                Actions Principales
              </Typography>
              <div className="flex flex-wrap gap-3">
                {totalContacts > 0 && (
                  <Button
                    size="lg"
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-3 rounded-xl"
                    onClick={onViewContacts}
                  >
                    <EyeIcon className="h-5 w-5" />
                    <span>Voir Contacts</span>
                    <Badge content={totalContacts} className="bg-white text-blue-600 ml-1" />
                  </Button>
                )}

                <Button
                  size="lg"
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-3 rounded-xl"
                  onClick={onGenerateMessages}
                  disabled={generatingMessages}
                >
                  <SparklesIcon className="h-5 w-5" />
                  {generatingMessages ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <span>Générer Messages</span>
                      <Badge content={contactsWithoutPersonalizedMessage} className="bg-orange-500" />
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-3 rounded-xl"
                  onClick={onRegenerateMessages}
                  disabled={regeneratingMessages}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  {regeneratingMessages ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      <span>Régénération...</span>
                    </>
                  ) : (
                    <span>Régénérer Messages</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions secondaires */}
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-700 mb-3">
                Autres Actions
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg"
                  onClick={onEnrichContacts}
                >
                  <PlusIcon className="h-4 w-4" />
                  Enrichir
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 rounded-lg"
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <InformationCircleIcon className="h-4 w-4" />
                  Infos
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg"
                  onClick={onEditCampaign}
                >
                  <PencilIcon className="h-4 w-4" />
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {mainStatistics.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Progression globale */}
      <Card className="mb-8 border border-blue-gray-100 shadow-xl">
        <CardBody className="p-8">
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h5" color="blue-gray" className="font-bold">
              Progression de la Campagne
            </Typography>
            <Chip
              variant="ghost"
              color="green"
              value={`${Math.round((messagesSent / totalContacts) * 100)}% complétée`}
              className="px-3 py-1"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Typography variant="small" className="font-medium text-blue-gray-700">
                  Contacts traités
                </Typography>
                <Typography variant="small" className="text-blue-gray-600">
                  {messagesSent} / {totalContacts}
                </Typography>
              </div>
              <Progress 
                value={(messagesSent / totalContacts) * 100} 
                color="blue" 
                className="h-3 bg-blue-gray-100"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <Typography variant="small" className="font-medium text-blue-gray-700">
                  Messages personnalisés
                </Typography>
                <Typography variant="small" className="text-blue-gray-600">
                  {contactsWithPersonalizedMessage} / {totalContacts}
                </Typography>
              </div>
              <Progress 
                value={(contactsWithPersonalizedMessage / totalContacts) * 100} 
                color="purple" 
                className="h-3 bg-blue-gray-100"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grille des statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {detailedStatistics.map((section, index) => (
          <Card key={index} className="border border-blue-gray-100 shadow-lg">
            <CardHeader
              floated={false}
              shadow={false}
              color="transparent"
              className="m-0 p-6 pb-2"
            >
              <div className="flex items-center gap-3">
                {React.createElement(section.icon, { className: "h-6 w-6 text-blue-600" })}
                <Typography variant="h6" color="blue-gray" className="font-bold">
                  {section.title}
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-center">
                    <Typography variant="small" className="text-blue-gray-600">
                      {item.label}
                    </Typography>
                    <Chip
                      variant="ghost"
                      color={item.color}
                      value={item.value.toString()}
                      className="text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Typography variant="h6" className="text-orange-900 mb-2 font-bold">
                  Actions Requises
                </Typography>
                <div className="space-y-2">
                  <Typography variant="small" className="text-orange-800">
                    • <strong>{contactsWithoutPersonalizedMessage}</strong> contacts sans message personnalisé
                  </Typography>
                  <Typography variant="small" className="text-orange-800">
                    • <strong>{toRelaunch}</strong> contacts à relancer cette semaine
                  </Typography>
                  <Typography variant="small" className="text-orange-800">
                    • <strong>{notContacted}</strong> nouveaux contacts en attente
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Typography variant="h6" className="text-green-900 mb-2 font-bold">
                  Résultats Positifs
                </Typography>
                <div className="space-y-2">
                  <Typography variant="small" className="text-green-800">
                    • <strong>{interested}</strong> candidats qualifiés pour entretien
                  </Typography>
                  <Typography variant="small" className="text-green-800">
                    • <strong>{responseRate}%</strong> taux de réponse (objectif: 15%)
                  </Typography>
                  <Typography variant="small" className="text-green-800">
                    • <strong>{conversionRate}%</strong> taux de conversion
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={infoDialogOpen} handler={() => setInfoDialogOpen(false)} size="lg">
        <DialogHeader>Informations détaillées</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Typography>Détails complets de la campagne...</Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setInfoDialogOpen(false)}>Fermer</Button>
        </DialogFooter>
      </Dialog>

      <ToastContainer />
    </div>
  );
}