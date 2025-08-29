import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Input,
    Button,
    Avatar,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Spinner,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Select,
    Option,
    Tooltip,
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
    EyeIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    UserPlusIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    LinkIcon,
    XMarkIcon,
    CheckIcon,
    ClockIcon,
    XCircleIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { 
    getContactsByCampaignId, 
    updateContactStatus, 
    updateContactProfile, 
    deleteContact,
    autoSortProfiles,
    manualSortProfiles 
} from "@/services/Contact";
import { getCampagneById } from "@/services/Campagne";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagination from "@/components/Pagination";
import toastify from "@/utils/toastify"
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function CampaignContactsInterface() {
    // États pour les données et la pagination
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [campaignData, setCampaignData] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingCampaign, setLoadingCampaign] = useState(true);

    // États pour les filtres et le tri
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [profileFilter, setProfileFilter] = useState("");
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("nom");
    const [sortOrder, setSortOrder] = useState("ASC");

    // États pour les dialogs et actions
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState({});
    const [sortingProfiles, setSortingProfiles] = useState(false);

    // Récupération de l'ID de campagne depuis l'URL
    const { id } = useParams();
    const campaignId = id;
    
    const navigate = useNavigate();

    // Options de statut
    const statusOptions = [
        { value: "", label: "Tous les statuts" },
        { value: "Non contacté", label: "Non contacté" },
        { value: "Message envoyé", label: "Message envoyé" },
        { value: "Réponse reçue", label: "Réponse reçue" },
        { value: "Intéressé", label: "Intéressé" },
        { value: "Non intéressé", label: "Non intéressé" },
        { value: "À relancer", label: "À relancer" },
        { value: "Rendez-vous pris", label: "Rendez-vous pris" },
    ];

    // Options de profil
    const profileOptions = [
        { value: "", label: "Tous les profils" },
        { value: "GARDE", label: "Gardés" },
        { value: "En attente", label: "En attente" },
        { value: "REJETE", label: "Rejetés" },
    ];

    useEffect(() => {
        if (campaignId) {
            loadCampaignData();
        } else {
            setLoadingCampaign(false);
        }
    }, [campaignId]);

    useEffect(() => {
        if (campaignData) {
            fetchContacts();
        }
    }, [campaignData, sortBy, sortOrder, statusFilter, profileFilter, search]);

    useEffect(() => {
        applyFiltersAndPagination();
    }, [contacts, currentPage, limit]);

    const loadCampaignData = async () => {
        try {
            setLoadingCampaign(true);
            const response = await getCampagneById(campaignId);
            setCampaignData(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement de la campagne:", error);
        } finally {
            setLoadingCampaign(false);
        }
    };

    const fetchContacts = async () => {
        try {
            setLoading(true);
            
            const response = await getContactsByCampaignId(campaignId, {
                search,
                statusFilter,
                profileFilter,
                sortBy,
                sortOrder
            });

            setContacts(response.data || []);
            setTotalItems(response.totalItems || 0);
            
        } catch (error) {
            console.error("Erreur lors du chargement des contacts:", error);
            setContacts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndPagination = () => {
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedContacts = contacts.slice(startIndex, endIndex);
        
        setFilteredContacts(paginatedContacts);
        setTotalPages(totalPages);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchContacts();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(column);
            setSortOrder("ASC");
        }
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (contactId, newStatus) => {
        try {
            setUpdatingStatus(true);
            await updateContactStatus(contactId, newStatus);
            await fetchContacts();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            alert("Erreur lors de la mise à jour du statut");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleProfileUpdate = async (contactId, newProfile) => {
        try {
            setUpdatingProfile(prev => ({ ...prev, [contactId]: true }));
            await updateContactProfile(contactId, newProfile);
            await fetchContacts();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            alert("Erreur lors de la mise à jour du profil");
        } finally {
            setUpdatingProfile(prev => ({ ...prev, [contactId]: false }));
        }
    };

    const handleAutoSortProfiles = async () => {
        try {
            setSortingProfiles(true);
            await autoSortProfiles(campaignId);
            await fetchContacts();
            alert("Tri automatique des profils lancé avec succès");
        } catch (error) {
            console.error("Erreur lors du tri automatique:", error);
            alert("Erreur lors du tri automatique des profils");
        } finally {
            setSortingProfiles(false);
        }
    };

    const handleDeleteContact = async () => {

        
        if (!selectedContact) return;

        try {
            await deleteContact(selectedContact.id);
            setDeleteDialogOpen(false);
            toastify.success("Contact supprimé avec succès");
            setSelectedContact(null);
            await fetchContacts();
        } catch (error) {
            toastify.error("Erreur lors de la suppression du contact");
        }
    };

    const handleViewContact = (contact) => {
        setSelectedContact(contact);
        setContactDetailsOpen(true);
    };

    const getStatusColor = (statut) => {
        switch (statut?.toLowerCase()) {
            case "message envoyé":
                return "blue";
            case "réponse reçue":
                return "green";
            case "intéressé":
                return "green";
            case "rendez-vous pris":
                return "green";
            case "non intéressé":
                return "red";
            case "à relancer":
                return "orange";
            case "non contacté":
                return "gray";
            default:
                return "gray";
        }
    };

    const getProfileColor = (profil) => {
        switch (profil) {
            case "GARDE":
                return "green";
            case "En attente":
                return "orange";
            case "REJETE":
                return "red";
            default:
                return "gray";
        }
    };

    const getProfileIcon = (profil) => {
        switch (profil) {
            case "GARDE":
                return <CheckIcon className="h-3 w-3" />;
            case "En attente":
                return <ClockIcon className="h-3 w-3" />;
            case "REJETE":
                return <XCircleIcon className="h-3 w-3" />;
            default:
                return <ClockIcon className="h-3 w-3" />;
        }
    };

    const getConnectionBadge = (degre) => {
        const colors = {
            1: "green",
            2: "blue", 
            3: "gray"
        };
        return colors[degre] || "gray";
    };

    const truncateMessage = (message, maxLength = 100) => {
        if (!message) return "Aucun message personnalisé";
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    };

    const onBack = () => {
        navigate(-1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Calculer les statistiques pour les badges
    const getStats = () => {
        const stats = {
            garde: contacts.filter(c => c.profil === "GARDE").length,
            enAttente: contacts.filter(c => c.profil === "En attente" || !c.profil).length,
            rejete: contacts.filter(c => c.profil === "REJETE").length,
        };
        return stats;
    };

    if (loadingCampaign) {
        return (
            <div className="mt-12 flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
                <Typography className="ml-2">Chargement de la campagne...</Typography>
            </div>
        );
    }

    if (!campaignId) {
        return (
            <div className="mt-12 flex justify-center items-center h-64">
                <Typography color="red" className="text-center">
                    Aucune campagne spécifiée
                </Typography>
            </div>
        );
    }

    const columns = [
        { key: "nom", label: "Contact" },
        { key: "posteActuel", label: "Poste" },
        { key: "entrepriseActuelle", label: "Entreprise" },
        { key: "localisation", label: "Localisation" },
        { key: "statut", label: "Statut" },
        { key: "profil", label: "Profil" },
        { key: "dateMessage", label: "Dernier contact" },
        { key: "quickActions", label: "Qualification" },
        { key: "actions", label: "Actions" }
    ];

    const stats = getStats();

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <IconButton
                                variant="text"
                                color="white"
                                onClick={onBack}
                                className="rounded-full"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </IconButton>
                            <div>
                                <Typography variant="h6" color="white">
                                    Contacts de la campagne
                                </Typography>
                                {campaignData && (
                                    <Typography variant="small" color="white" className="opacity-80">
                                        {campaignData.nom} • {totalItems} contact{totalItems > 1 ? 's' : ''}
                                    </Typography>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                color="blue"
                                size="sm"
                                onClick={handleAutoSortProfiles}
                                disabled={sortingProfiles}
                                className="flex items-center gap-2"
                            >
                                {sortingProfiles ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <SparklesIcon className="h-4 w-4" />
                                )}
                                Trier auto
                            </Button>
                            <Link 
                                to="/dashboard/nouveau/contact" 
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm"
                            >
                                <UserPlusIcon className="h-4 w-4" />
                                Nouveau Contact
                            </Link>
                        </div>
                    </div>
                </CardHeader>

                {/* Informations de la campagne */}
                {campaignData && (
                    <div className="px-6 pb-4">
                        <Card className="border border-blue-gray-100">
                            <CardBody className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <Typography variant="small" className="font-medium text-blue-gray-600">
                                            Poste recherché
                                        </Typography>
                                        <Typography className="text-blue-gray-800">
                                            {campaignData.poste}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="font-medium text-blue-gray-600">
                                            Zone géographique
                                        </Typography>
                                        <Typography className="text-blue-gray-800">
                                            {campaignData.zone}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="font-medium text-blue-gray-600">
                                            Expérience
                                        </Typography>
                                        <Typography className="text-blue-gray-800">
                                            {campaignData.experienceMin}-{campaignData.experienceMax} ans
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="font-medium text-blue-gray-600">
                                            Statut
                                        </Typography>
                                        <Chip
                                            color={campaignData.statut === "Actif" ? "green" : "gray"}
                                            value={campaignData.statut}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Statistiques des profils */}
                <div className="px-6 pb-4">
                    <div className="flex gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                            <CheckIcon className="h-4 w-4 text-green-600" />
                            <Typography variant="small" className="text-green-700 font-medium">
                                Gardés: {stats.garde}
                            </Typography>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                            <ClockIcon className="h-4 w-4 text-orange-600" />
                            <Typography variant="small" className="text-orange-700 font-medium">
                                En attente: {stats.enAttente}
                            </Typography>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                            <XCircleIcon className="h-4 w-4 text-red-600" />
                            <Typography variant="small" className="text-red-700 font-medium">
                                Rejetés: {stats.rejete}
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="px-6 pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="w-full">
                                    <Input
                                        type="text"
                                        label="Rechercher un contact..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        icon={<FunnelIcon className="h-5 w-5" />}
                                    />
                                </div>
                                <Button type="submit" color="gray">
                                    Rechercher
                                </Button>
                            </form>
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                label="Filtrer par statut"
                                value={statusFilter}
                                onChange={(value) => {
                                    setStatusFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                {statusOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                label="Filtrer par profil"
                                value={profileFilter}
                                onChange={(value) => {
                                    setProfileFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                {profileOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>

                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Spinner className="h-8 w-8" />
                            <Typography className="ml-2">Chargement des contacts...</Typography>
                        </div>
                    ) : (
                        <>
                            <table className="w-full min-w-[900px] table-auto">
                                <thead>
                                    <tr>
                                        {columns.map((column) => (
                                            <th
                                                key={column.key}
                                                className="border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer hover:bg-blue-gray-50 transition-colors"
                                                onClick={() => !["actions", "quickActions"].includes(column.key) && handleSort(column.key)}
                                            >
                                                <div className="flex items-center">
                                                    <Typography
                                                        variant="small"
                                                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                    >
                                                        {column.label}
                                                    </Typography>
                                                    {sortBy === column.key && (
                                                        <span className="ml-1 text-blue-gray-600">
                                                            {sortOrder === "ASC" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.length > 0 ? (
                                        filteredContacts.map((contact, index) => {
                                            const className = `py-3 px-5 transition-all duration-200 hover:bg-blue-gray-50/70 ${
                                                index === filteredContacts.length - 1 ? "" : "border-b border-blue-gray-50"
                                            }`;

                                            // Bordure colorée selon le statut du profil
                                            const borderLeftColor = contact.profil === "GARDE" ? "border-l-4 border-l-green-500" :
                                                                   contact.profil === "REJETE" ? "border-l-4 border-l-red-500" :
                                                                   contact.profil === "En attente" ? "border-l-4 border-l-orange-500" :
                                                                   "border-l-4 border-l-gray-300";

                                            return (
                                                <tr key={contact.id || index} className={`hover:bg-blue-gray-50/50 ${borderLeftColor}`}>
                                                    <td className={className}>
                                                        <div className="flex items-center gap-4">
                                                            {contact.image ? (
                                                                <Avatar
                                                                    src={contact.image}
                                                                    alt={contact.nom}
                                                                    size="sm"
                                                                    className="border border-blue-gray-50"
                                                                />
                                                            ) : (
                                                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center">
                                                                    <Typography variant="small" className="text-white font-bold text-xs">
                                                                        {contact.nom ? contact.nom.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                                                                    </Typography>
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Tooltip
                                                                        content={
                                                                            <div className="max-w-xs p-2">
                                                                                <Typography variant="small" className="font-medium mb-1">
                                                                                    Message personnalisé:
                                                                                </Typography>
                                                                                <Typography variant="small" className="text-gray-700">
                                                                                    {truncateMessage(contact.messagePersonnalise)}
                                                                                </Typography>
                                                                            </div>
                                                                        }
                                                                        placement="top"
                                                                    >
                                                                        <Typography variant="small" className="font-semibold text-blue-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                                                                            {contact.nom || 'N/A'}
                                                                        </Typography>
                                                                    </Tooltip>
                                                                    {/* Badge connexion LinkedIn */}
                                                                    {contact.connection && (
                                                                        <Chip
                                                                            size="sm"
                                                                            color={getConnectionBadge(parseInt(contact.connection))}
                                                                            value={`${contact.connection}°`}
                                                                            className="text-[10px] px-1 py-0"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-blue-gray-500">
                                                                    {contact.email && (
                                                                        <EnvelopeIcon className="h-3 w-3" />
                                                                    )}
                                                                    {contact.telephone && (
                                                                        <PhoneIcon className="h-3 w-3" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-medium text-blue-gray-600">
                                                            {contact.posteActuel || 'N/A'}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-medium text-blue-gray-600">
                                                            {contact.entrepriseActuelle || 'N/A'}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-medium text-blue-gray-600">
                                                            {contact.localisation || 'N/A'}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Menu>
                                                            <MenuHandler>
                                                                <div className="cursor-pointer">
                                                                    <Chip
                                                                        variant="ghost"
                                                                        color={getStatusColor(contact.statut)}
                                                                        value={contact.statut || "Non contacté"}
                                                                        className="py-0.5 px-2 text-[10px] font-medium w-fit hover:shadow-md transition-shadow"
                                                                    />
                                                                </div>
                                                            </MenuHandler>
                                                            <MenuList>
                                                                {statusOptions.slice(1).map((status) => (
                                                                    <MenuItem
                                                                        key={status.value}
                                                                        onClick={() => handleStatusUpdate(contact.ID_CONTACT, status.value)}
                                                                        disabled={updatingStatus}
                                                                    >
                                                                        {status.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </MenuList>
                                                        </Menu>
                                                    </td>
                                                    <td className={className}>
                                                        <Chip
                                                            variant="ghost"
                                                            color={getProfileColor(contact.profil)}
                                                            value={
                                                                <div className="flex items-center gap-1">
                                                                    {getProfileIcon(contact.profil)}
                                                                    <span>
                                                                        {contact.profil === "GARDE" ? "Gardé" :
                                                                         contact.profil === "REJETE" ? "Rejeté" :
                                                                         contact.profil === "En attente" ? "En attente" :
                                                                         "Non qualifié"}
                                                                    </span>
                                                                </div>
                                                            }
                                                            className="py-0.5 px-2 text-[10px] font-medium w-fit"
                                                        />
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs text-blue-gray-500">
                                                            {contact.dateMessage ? 
                                                                new Date(contact.dateMessage).toLocaleDateString('fr-FR') : 
                                                                contact.dateCreation ? 
                                                                new Date(contact.dateCreation).toLocaleDateString('fr-FR') :
                                                                'N/A'
                                                            }
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex items-center gap-1">
                                                            <Tooltip content="Garder ce profil">
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="text"
                                                                    color="green"
                                                                    onClick={() => handleProfileUpdate(contact.ID_CONTACT, "GARDE")}
                                                                    disabled={updatingProfile[contact.ID_CONTACT] || contact.profil === "En attente"}
                                                                    className={`transition-all duration-200 ${contact.profil === "En attente" ? "bg-orange-100" : "hover:bg-orange-50"}`}
                                                                >
                                                                    {updatingProfile[contact.ID_CONTACT] ? (
                                                                        <Spinner className="h-3 w-3" />
                                                                    ) : (
                                                                        <ClockIcon className="h-3 w-3" />
                                                                    )}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip content="Rejeter ce profil">
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="text"
                                                                    color="red"
                                                                    onClick={() => handleProfileUpdate(contact.ID_CONTACT, "REJETE")}
                                                                    disabled={updatingProfile[contact.ID_CONTACT] || contact.profil === "REJETE"}
                                                                    className={`transition-all duration-200 ${contact.profil === "REJETE" ? "bg-red-100" : "hover:bg-red-50"}`}
                                                                >
                                                                    {updatingProfile[contact.ID_CONTACT] ? (
                                                                        <Spinner className="h-3 w-3" />
                                                                    ) : (
                                                                        <XCircleIcon className="h-3 w-3" />
                                                                    )}
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex items-center gap-2">
                                                            <Tooltip content="Voir les détails">
                                                                <IconButton
                                                                    variant="text"
                                                                    size="sm"
                                                                    color="blue"
                                                                    onClick={() => handleViewContact(contact)}
                                                                    className="hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {contact.url && (
                                                                <Tooltip content="Voir le profil LinkedIn">
                                                                    <IconButton
                                                                        variant="text"
                                                                        size="sm"
                                                                        color="blue"
                                                                        onClick={() => window.open(contact.url, '_blank', 'noopener,noreferrer')}
                                                                        className="hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                                        </svg>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            <Menu>
                                                                <MenuHandler>
                                                                    <IconButton variant="text" size="sm" className="hover:bg-blue-gray-50 transition-colors">
                                                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                                                    </IconButton>
                                                                </MenuHandler>
                                                                <MenuList>
                                                                    <MenuItem
                                                                        as={Link}
                                                                        to={`/dashboard/contact/edit/${contact.ID_CONTACT}`}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <PencilIcon className="h-4 w-4" />
                                                                        Modifier
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        className="flex items-center gap-2 text-red-600"
                                                                        onClick={() => {
                                                                            setSelectedContact(contact);
                                                                            setDeleteDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <TrashIcon className="h-4 w-4" />
                                                                        Supprimer
                                                                    </MenuItem>
                                                                </MenuList>
                                                            </Menu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className="py-8 px-5 text-center">
                                                <Typography variant="small" className="text-blue-gray-500">
                                                    {statusFilter || profileFilter || search ? 
                                                        "Aucun contact ne correspond aux critères de recherche" :
                                                        "Aucun contact associé à cette campagne"
                                                    }
                                                </Typography>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    limit={limit}
                                    onPageChange={handlePageChange}
                                    onLimitChange={handleLimitChange}
                                    itemName="contacts"
                                />
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Dialog détails du contact */}
            <Dialog 
                open={contactDetailsOpen} 
                handler={() => setContactDetailsOpen(false)}
                size="lg"
                className="max-h-[90vh] overflow-y-auto"
            >
                <DialogHeader className="flex items-center justify-between border-b border-blue-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        {selectedContact?.image ? (
                            <Avatar
                                src={selectedContact.image}
                                alt={selectedContact.nom}
                                size="md"
                                className="border border-blue-gray-200"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center">
                                <Typography variant="h6" className="text-white font-bold">
                                    {selectedContact?.nom ? selectedContact.nom.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                                </Typography>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <Typography variant="h6" color="blue-gray">
                                    {selectedContact?.nom || 'Contact'}
                                </Typography>
                                {selectedContact?.connection && (
                                    <Chip
                                        size="sm"
                                        color={getConnectionBadge(parseInt(selectedContact.connection))}
                                        value={`${selectedContact.connection}° connexion`}
                                        className="text-[10px]"
                                    />
                                )}
                            </div>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {selectedContact?.posteActuel || 'Poste non renseigné'}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                                <Chip
                                    variant="ghost"
                                    color={getProfileColor(selectedContact?.profil)}
                                    value={
                                        <div className="flex items-center gap-1">
                                            {getProfileIcon(selectedContact?.profil)}
                                            <span>
                                                {selectedContact?.profil === "GARDE" ? "Profil gardé" :
                                                 selectedContact?.profil === "REJETE" ? "Profil rejeté" :
                                                 selectedContact?.profil === "En attente" ? "En attente" :
                                                 "Non qualifié"}
                                            </span>
                                        </div>
                                    }
                                    className="text-[10px] font-medium"
                                />
                            </div>
                        </div>
                    </div>
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        onClick={() => setContactDetailsOpen(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>
                
                <DialogBody className="p-6">
                    {selectedContact && (
                        <div className="space-y-6">
                            {/* Informations de contact */}
                            <div>
                                <Typography variant="h6" color="blue-gray" className="mb-3">
                                    Informations de contact
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedContact.email && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                            <EnvelopeIcon className="h-5 w-5 text-blue-gray-600" />
                                            <div>
                                                <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                    Email
                                                </Typography>
                                                <Typography className="text-blue-gray-900">
                                                    {selectedContact.email}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.telephone && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                            <PhoneIcon className="h-5 w-5 text-blue-gray-600" />
                                            <div>
                                                <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                    Téléphone
                                                </Typography>
                                                <Typography className="text-blue-gray-900">
                                                    {selectedContact.telephone}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.localisation && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                            <MapPinIcon className="h-5 w-5 text-blue-gray-600" />
                                            <div>
                                                <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                    Localisation
                                                </Typography>
                                                <Typography className="text-blue-gray-900">
                                                    {selectedContact.localisation}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations professionnelles */}
                            <div>
                                <Typography variant="h6" color="blue-gray" className="mb-3">
                                    Informations professionnelles
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                        <BuildingOfficeIcon className="h-5 w-5 text-blue-gray-600" />
                                        <div>
                                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                Entreprise actuelle
                                            </Typography>
                                            <Typography className="text-blue-gray-900">
                                                {selectedContact.entrepriseActuelle || 'Non renseignée'}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                        <div className="h-5 w-5 text-blue-gray-600">💼</div>
                                        <div>
                                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                Poste actuel
                                            </Typography>
                                            <Typography className="text-blue-gray-900">
                                                {selectedContact.posteActuel || 'Non renseigné'}
                                            </Typography>
                                        </div>
                                    </div>
                                    {selectedContact.parcours && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                            <div className="h-5 w-5 text-blue-gray-600">🏢</div>
                                            <div>
                                                <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                    Parcours professionnel
                                                </Typography>
                                                <Typography className="text-blue-gray-900">
                                                    {selectedContact.parcours}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.secteurs && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                            <div className="h-5 w-5 text-blue-gray-600">🏭</div>
                                            <div>
                                                <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                    Secteurs d'activité
                                                </Typography>
                                                <Typography className="text-blue-gray-900">
                                                    {selectedContact.secteurs}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Formation */}
                            {selectedContact.parcoursEducation && (
                                <div>
                                    <Typography variant="h6" color="blue-gray" className="mb-3">
                                        Formation
                                    </Typography>
                                    <div className="p-3 bg-blue-gray-50 rounded-lg">
                                        <Typography className="text-blue-gray-900">
                                            {selectedContact.parcoursEducation}
                                        </Typography>
                                    </div>
                                </div>
                            )}

                            {/* Message personnalisé */}
                            {selectedContact.messagePersonnalise && (
                                <div>
                                    <Typography variant="h6" color="blue-gray" className="mb-3">
                                        Message personnalisé
                                    </Typography>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <Typography className="text-blue-gray-900 whitespace-pre-wrap">
                                            {selectedContact.messagePersonnalise}
                                        </Typography>
                                    </div>
                                </div>
                            )}

                            {/* Liens */}
                            {selectedContact.url && (
                                <div>
                                    <Typography variant="h6" color="blue-gray" className="mb-3">
                                        Liens
                                    </Typography>
                                    <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                        <LinkIcon className="h-5 w-5 text-blue-gray-600" />
                                        <div className="flex-1">
                                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                Profil LinkedIn
                                            </Typography>
                                            <a 
                                                href={selectedContact.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700 underline break-all"
                                            >
                                                {selectedContact.url}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedContact.notes && (
                                <div>
                                    <Typography variant="h6" color="blue-gray" className="mb-3">
                                        Notes
                                    </Typography>
                                    <div className="p-3 bg-blue-gray-50 rounded-lg">
                                        <Typography className="text-blue-gray-900 whitespace-pre-wrap">
                                            {selectedContact.notes}
                                        </Typography>
                                    </div>
                                </div>
                            )}

                            {/* Historique de contact */}
                            <div>
                                <Typography variant="h6" color="blue-gray" className="mb-3">
                                    Historique
                                </Typography>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                        <CalendarIcon className="h-5 w-5 text-blue-gray-600" />
                                        <div>
                                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                Date de création
                                            </Typography>
                                            <Typography className="text-blue-gray-900">
                                                {formatDate(selectedContact.dateCreation)}
                                            </Typography>
                                        </div>
                                    </div>
                                    {selectedContact.dateMessage && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                                            <EnvelopeIcon className="h-5 w-5 text-blue-gray-600" />
                                            <div>
                                                <Typography variant="small" className="text-blue-gray-600 font-medium">
                                                    Dernier message envoyé
                                                </Typography>
                                                <Typography className="text-blue-gray-900">
                                                    {formatDate(selectedContact.dateMessage)}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.dateReponse && (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <div className="h-5 w-5 text-green-600">💬</div>
                                            <div>
                                                <Typography variant="small" className="text-green-600 font-medium">
                                                    Dernière réponse reçue
                                                </Typography>
                                                <Typography className="text-green-900">
                                                    {formatDate(selectedContact.dateReponse)}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogBody>
                
                <DialogFooter className="border-t border-blue-gray-50 pt-4">
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                            {selectedContact?.url && (
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    size="sm"
                                    onClick={() => window.open(selectedContact.url, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-2"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    LinkedIn
                                </Button>
                            )}
                            {selectedContact?.email && (
                                <Button
                                    variant="outlined"
                                    color="green"
                                    size="sm"
                                    onClick={() => window.location.href = `mailto:${selectedContact.email}`}
                                    className="flex items-center gap-2"
                                >
                                    <EnvelopeIcon className="h-4 w-4" />
                                    Email
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                color="blue-gray"
                                onClick={() => setContactDetailsOpen(false)}
                            >
                                Fermer
                            </Button>
                            <Button
                                color="blue"
                                as={Link}
                                to={`/dashboard/contact/edit/${selectedContact?.ID_CONTACT}`}
                                className="flex items-center gap-2"
                            >
                                <PencilIcon className="h-4 w-4" />
                                Modifier
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </Dialog>

            {/* Dialog de confirmation de suppression */}
            <Dialog 
                open={deleteDialogOpen} 
                handler={() => setDeleteDialogOpen(false)}
                size="sm"
            >
                <DialogHeader className="text-red-500">
                    Confirmer la suppression
                </DialogHeader>
                <DialogBody>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer le contact <strong>{selectedContact?.nom}</strong> ? 
                        Cette action est irréversible.
                    </Typography>
                </DialogBody>
                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="filled"
                        color="red"
                        onClick={handleDeleteContact}
                    >
                        Supprimer
                    </Button>
                </DialogFooter>
            </Dialog>
                <ToastContainer />
            
        </div>
    );
}

export default CampaignContactsInterface;