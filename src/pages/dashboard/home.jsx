import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Progress,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Spinner,
} from "@material-tailwind/react";
import {
  UserGroupIcon,
  MegaphoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

// Import des services Airtable
import { getAllCampagnes } from '@/services/Campagne';
import { getAllContacts, getContactsStats } from '@/services/Contact';

export  function Home() {
  const [campaignsData, setCampaignsData] = useState([]);
  const [contactsData, setContactsData] = useState([]);
  const [contactsStats, setContactsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les campagnes
        const campaignsResponse = await getAllCampagnes();
        setCampaignsData(campaignsResponse.data || []);

        // Charger les contacts
        const contactsResponse = await getAllContacts();
        setContactsData(contactsResponse.data || []);

        // Charger les statistiques des contacts
        const statsResponse = await getContactsStats();
        setContactsStats(statsResponse.data || {});

      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calcul des statistiques
  const totalCampaigns = campaignsData.length;
  const activeCampaigns = campaignsData.filter(c => c.statut === "Actif").length;
  const totalContacts = contactsData.length;
  const messagesSent = contactsStats?.messageEnvoye || 0;
  const responsesReceived = contactsStats?.reponseRecue || 0;
  const responseRate = messagesSent > 0 ? ((responsesReceived / messagesSent) * 100).toFixed(1) : 0;

  // Compter les contacts par campagne
  const contactsByCampagne = contactsData.reduce((acc, contact) => {
    const campagneId = contact.campagneId || contact.campagne;
    if (campagneId) {
      acc[campagneId] = (acc[campagneId] || 0) + 1;
    }
    return acc;
  }, {});

  // Ajouter le nombre de contacts à chaque campagne
  const campaignsWithContactCount = campaignsData.map(campaign => ({
    ...campaign,
    contactsCount: contactsByCampagne[campaign.id] || 0
  }));

  if (loading) {
    return (
      <div className="mt-12 flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
        <Typography className="ml-2">Chargement des données...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 flex justify-center items-center h-64">
        <Typography color="red" className="text-center">
          {error}
        </Typography>
      </div>
    );
  }

  const statisticsCards = [
    {
      color: "blue",
      icon: MegaphoneIcon,
      title: "Campagnes Totales",
      value: totalCampaigns.toString(),
      footer: {
        color: "text-green-500",
        value: `${activeCampaigns} actives`,
        label: "campagnes en cours"
      }
    },
    {
      color: "pink",
      icon: UserGroupIcon,
      title: "Contacts Totaux",
      value: totalContacts.toString(),
      footer: {
        color: "text-blue-500",
        value: contactsStats?.interesse || "0",
        label: "profils intéressés"
      }
    },
    {
      color: "green",
      icon: EnvelopeIcon,
      title: "Messages Envoyés",
      value: messagesSent.toString(),
      footer: {
        color: "text-green-500",
        value: `${contactsStats?.nonContacte || 0}`,
        label: "non contactés"
      }
    },
    {
      color: "orange",
      icon: ChatBubbleLeftRightIcon,
      title: "Taux de Réponse",
      value: `${responseRate}%`,
      footer: {
        color: responsesReceived > 0 ? "text-green-500" : "text-red-500",
        value: responsesReceived.toString(),
        label: "réponses reçues"
      }
    }
  ];

  const StatisticsCard = ({ color, icon, title, value, footer }) => {
    return (
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader
          variant="gradient"
          color={color}
          floated={false}
          shadow={false}
          className="absolute grid h-12 w-12 place-items-center"
        >
          {React.createElement(icon, {
            className: "w-6 h-6 text-white",
          })}
        </CardHeader>
        <CardBody className="p-4 text-right">
          <Typography variant="small" className="font-normal text-blue-gray-600">
            {title}
          </Typography>
          <Typography variant="h4" color="blue-gray">
            {value}
          </Typography>
        </CardBody>
        <div className="border-t border-blue-gray-50 p-4">
          <Typography className="font-normal text-blue-gray-600">
            <strong className={footer.color}>{footer.value}</strong>
            &nbsp;{footer.label}
          </Typography>
        </div>
      </Card>
    );
  };

  return (
    <div className="mt-12">
      {/* Cartes de statistiques */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCards.map((props, index) => (
          <StatisticsCard key={index} {...props} />
        ))}
      </div>

      {/* Grille principale */}
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Tableau des campagnes */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Campagnes Actives
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>{activeCampaigns} actives</strong> ce mois
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Nouvelle campagne</MenuItem>
                <MenuItem>Voir toutes</MenuItem>
                <MenuItem>Exporter</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Campagne", "Poste", "Zone", "Expérience", "Statut", "Contacts"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {campaignsWithContactCount.slice(0, 5).map((campaign, index) => {
                  const className = `py-3 px-5 ${
                    index === Math.min(4, campaignsWithContactCount.length - 1)
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={campaign.id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-md bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center">
                            <MegaphoneIcon className="h-5 w-5 text-white" />
                          </div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {campaign.nom}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {campaign.poste}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4 text-blue-gray-400" />
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {campaign.zone}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {campaign.experienceMin}-{campaign.experienceMax} ans
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={campaign.statut === "Actif" ? "green" : "blue-gray"}
                          value={campaign.statut}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {campaign.contactsCount}
                          </Typography>
                          <UserGroupIcon className="h-4 w-4 text-blue-gray-400" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Vue d'ensemble des contacts */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Aperçu des Contacts
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>{responseRate}%</strong> taux de réponse
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {contactsData.slice(0, 3).map((contact, index) => (
              <div key={contact.id} className="flex items-start gap-4 py-3">
                <div
                  className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                    index === Math.min(2, contactsData.length - 1)
                      ? "after:h-0"
                      : "after:h-4/6"
                  }`}
                >
                  {contact.image ? (
                    <Avatar
                      src={contact.image}
                      alt={contact.nom}
                      size="sm"
                      className="border-2 border-white"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-600 to-pink-400 flex items-center justify-center">
                      <Typography variant="small" className="text-white font-bold text-xs">
                        {contact.nom ? contact.nom.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                      </Typography>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-medium"
                  >
                    {contact.nom}
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500 mb-1"
                  >
                    {contact.posteActuel}
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-xs text-blue-gray-400"
                  >
                    {contact.entrepriseActuelle}
                  </Typography>
                  <div className="mt-2">
                    <Chip
                      variant="ghost"
                      color={
                        contact.statut === "Message envoyé" ? "blue" :
                        contact.statut === "Réponse reçue" ? "green" :
                        contact.statut === "Intéressé" ? "green" :
                        contact.statut === "Non intéressé" ? "red" :
                        "gray"
                      }
                      value={contact.statut}
                      className="py-0.5 px-2 text-[10px] font-medium w-fit"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Statistiques supplémentaires */}
            <div className="mt-4 pt-4 border-t border-blue-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Typography variant="h6" color="blue-gray">
                    {messagesSent}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-600">
                    Messages envoyés
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h6" color="blue-gray">
                    {responsesReceived}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-600">
                    Réponses reçues
                  </Typography>
                </div>
              </div>
              
              {/* Répartition par statut */}
              <div className="mt-4 pt-4 border-t border-blue-gray-50">
                <Typography variant="small" className="text-blue-gray-600 mb-2">
                  Répartition des contacts
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Non contactés</span>
                    <span className="font-medium">{contactsStats?.nonContacte || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Intéressés</span>
                    <span className="font-medium text-green-600">{contactsStats?.interesse || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>À relancer</span>
                    <span className="font-medium text-orange-600">{contactsStats?.aRelancer || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Section des secteurs et localisations */}
      <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6 pb-2"
          >
            <Typography variant="h6" color="blue-gray">
              Secteurs Ciblés
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(campaignsData.map(c => c.secteurs).filter(Boolean))).map((secteur, index) => (
                <Chip
                  key={index}
                  variant="gradient"
                  color="blue"
                  value={secteur}
                  className="py-1 px-3 text-xs font-medium"
                />
              ))}
              {Array.from(new Set(contactsData.map(c => c.secteurs).filter(Boolean))).slice(0, 3).map((secteur, index) => (
                <Chip
                  key={`contact-${index}`}
                  variant="gradient"
                  color="purple"
                  value={secteur}
                  className="py-1 px-3 text-xs font-medium"
                />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6 pb-2"
          >
            <Typography variant="h6" color="blue-gray">
              Zones Géographiques
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([
                ...campaignsData.map(c => c.zone).filter(Boolean),
                ...contactsData.map(c => c.localisation).filter(Boolean)
              ])).slice(0, 5).map((zone, index) => (
                <Chip
                  key={index}
                  variant="gradient"
                  color="green"
                  value={zone}
                  className="py-1 px-3 text-xs font-medium"
                />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}