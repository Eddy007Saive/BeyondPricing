import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Input,
  Button,
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
  Checkbox,
  Badge,
  Alert,
} from "@material-tailwind/react";
import {
  BellIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellIconSolid,
  CheckIcon as CheckIconSolid,
} from "@heroicons/react/24/solid";

import {
  getAllNotifications,
  markAllNotificationsAsRead,
  markMultipleNotificationsAsRead,
  markMultipleNotificationsAsUnread,
  getNotificationsStats,
  deleteMultipleNotifications,
  deleteNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "@/services/Notification";

export function NotificationsInterface() {
  // États pour les données
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // États pour les filtres
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [viewMode, setViewMode] = useState("list");

  // États pour les dialogues
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Calcul des workflows uniques pour le filtre
  const uniqueWorkflows = useMemo(() => {
    return [...new Set(notifications.map((notif) => notif.workflow).filter(Boolean))];
  }, [notifications]);

  // Charger les données initiales
  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [notificationsResponse, statsResponse] = await Promise.all([
        getAllNotifications(),
        getNotificationsStats(),
      ]);

      console.log('Notifications reçues:', notificationsResponse.data);
      console.log('Stats reçues:', statsResponse.data);

      setNotifications(notificationsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      setError("Erreur lors du chargement des notifications. Veuillez réessayer.");
      // Initialiser avec des données vides en cas d'erreur
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        read: 0,
        today: 0,
        byStatus: { success: 0, warning: 0, error: 0, info: 0 }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    loadData(true);
  };

  // Filtres et tri optimisés avec useMemo
  useEffect(() => {
    let filtered = [...notifications];

    // Filtre de recherche
    if (search) {
      filtered = filtered.filter(
        (notif) =>
          (notif.message && notif.message.toLowerCase().includes(search.toLowerCase())) ||
          (notif.workflow && notif.workflow.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter((notif) => notif.status === statusFilter);
    }

    // Filtre par workflow
    if (workflowFilter) {
      filtered = filtered.filter((notif) => notif.workflow === workflowFilter);
    }

    // Filtre par statut de lecture
    if (readFilter === "read") {
      filtered = filtered.filter((notif) => notif.read);
    } else if (readFilter === "unread") {
      filtered = filtered.filter((notif) => !notif.read);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "ASC") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    setFilteredNotifications(filtered);
  }, [notifications, search, statusFilter, workflowFilter, readFilter, sortBy, sortOrder]);

  // Gestion de la sélection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleSelectNotification = (id, checked) => {
    const newSelected = new Set(selectedNotifications);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedNotifications(newSelected);
  };

  // Actions sur les notifications
  const markAsRead = async (ids) => {
    setBulkActionLoading(true);
    try {
      if (ids.length === 1) {
        await markNotificationAsRead(ids[0]);
      } else {
        await markMultipleNotificationsAsRead(ids);
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.id) ? { ...notif, read: true } : notif
        )
      );

      // Recharger les stats
      const statsResponse = await getNotificationsStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Erreur lors du marquage comme lu :", error);
      setError("Erreur lors du marquage des notifications comme lues.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const markAsUnread = async (ids) => {
    setBulkActionLoading(true);
    try {
      if (ids.length === 1) {
        await markNotificationAsUnread(ids[0]);
      } else {
        await markMultipleNotificationsAsUnread(ids);
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.id) ? { ...notif, read: false } : notif
        )
      );

      // Recharger les stats
      const statsResponse = await getNotificationsStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Erreur lors du marquage comme non lu :", error);
      setError("Erreur lors du marquage des notifications comme non lues.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const deleteNotifications = async (ids) => {
    setBulkActionLoading(true);
    try {
      if (ids.length === 1) {
        await deleteNotification(ids[0]);
      } else {
        await deleteMultipleNotifications(ids);
      }

      setNotifications((prev) => prev.filter((notif) => !ids.includes(notif.id)));
      setSelectedNotifications(new Set());
      setDeleteDialogOpen(false);

      // Recharger les stats
      const statsResponse = await getNotificationsStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setError("Erreur lors de la suppression des notifications.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setBulkActionLoading(true);
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

        // Recharger les stats
        const statsResponse = await getNotificationsStats();
        setStats(statsResponse.data || {});
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues :", error);
      setError("Erreur lors du marquage de toutes les notifications comme lues.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Utilitaires
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case "error":
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "green";
      case "warning":
        return "orange";
      case "error":
        return "red";
      case "info":
      default:
        return "blue";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "À l'instant";
      if (minutes < 60) return `Il y a ${minutes} min`;
      if (hours < 24) return `Il y a ${hours} h`;
      if (days < 7) return `Il y a ${days} j`;

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date invalide";
    }
  };

  // Calculs dérivés
  const unreadCount = notifications.filter((n) => !n.read).length;
  const selectedCount = selectedNotifications.size;

  if (loading) {
    return (
      <div className="mt-12 mb-8 flex justify-center items-center p-8">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <Typography variant="h6" color="blue-gray">
              Chargement des notifications...
            </Typography>
            <Typography variant="small" color="blue-gray" className="opacity-70">
              Connexion à Airtable en cours...
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      {/* Messages d'erreur */}
      {error && (
        <Alert color="red" className="mb-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="text" color="white" onClick={() => setError(null)}>
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="border border-blue-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" className="text-blue-gray-600 font-medium">
                    Total
                  </Typography>
                  <Typography variant="h4" color="blue-gray">
                    {stats.total || 0}
                  </Typography>
                </div>
                <BellIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardBody>
          </Card>
          <Card className="border border-orange-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" className="text-blue-gray-600 font-medium">
                    Non lues
                  </Typography>
                  <Typography variant="h4" color="orange">
                    {stats.unread || 0}
                  </Typography>
                </div>
                <EnvelopeIcon className="h-8 w-8 text-orange-500" />
              </div>
            </CardBody>
          </Card>
          <Card className="border border-green-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" className="text-blue-gray-600 font-medium">
                    Lues
                  </Typography>
                  <Typography variant="h4" color="green">
                    {stats.read || 0}
                  </Typography>
                </div>
                <EnvelopeOpenIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardBody>
          </Card>
          <Card className="border border-blue-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" className="text-blue-gray-600 font-medium">
                    Aujourd'hui
                  </Typography>
                  <Typography variant="h4" color="blue">
                    {stats.today || 0}
                  </Typography>
                </div>
                <ClockIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BellIconSolid className="h-8 w-8 text-white" />
                {unreadCount > 0 && (
                  <Badge
                    content={unreadCount}
                    className="absolute -top-2 -right-2 min-w-[20px] min-h-[20px] bg-red-500 text-white text-xs"
                  />
                )}
              </div>
              <div>
                <Typography variant="h6" color="white">
                  Notifications Dynamiques
                </Typography>
                <Typography variant="small" color="white" className="opacity-80">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}{" "}
                  {unreadCount > 0 && ` • ${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}`}
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="Actualiser">
                <Button
                  size="sm"
                  variant="outlined"
                  className="text-white border-white hover:bg-white/10"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </Tooltip>
              <Tooltip content="Marquer toutes comme lues">
                <Button
                  size="sm"
                  variant="outlined"
                  className="text-white border-white hover:bg-white/10"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || bulkActionLoading}
                >
                  <CheckIconSolid className="h-4 w-4" />
                </Button>
              </Tooltip>
              <div className="flex border border-white/30 rounded-lg overflow-hidden">
                <Tooltip content="Vue liste">
                  <IconButton
                    size="sm"
                    variant={viewMode === "list" ? "filled" : "text"}
                    className={`rounded-none ${viewMode === "list" ? "bg-white text-gray-800" : "text-white hover:bg-white/10"}`}
                    onClick={() => setViewMode("list")}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Vue grille">
                  <IconButton
                    size="sm"
                    variant={viewMode === "grid" ? "filled" : "text"}
                    className={`rounded-none ${viewMode === "grid" ? "bg-white text-gray-800" : "text-white hover:bg-white/10"}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Barre d'actions en lot */}
        {selectedCount > 0 && (
          <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <Typography variant="small" className="text-blue-800 font-medium">
                {selectedCount} notification{selectedCount !== 1 ? "s" : ""} sélectionnée{selectedCount !== 1 ? "s" : ""}
              </Typography>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outlined"
                  color="green"
                  onClick={() => markAsRead([...selectedNotifications])}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2"
                >
                  {bulkActionLoading ? <Spinner className="h-3 w-3" /> : <EnvelopeOpenIcon className="h-4 w-4" />}
                  Marquer comme lues
                </Button>
                <Button
                  size="sm"
                  variant="outlined"
                  color="orange"
                  onClick={() => markAsUnread([...selectedNotifications])}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2"
                >
                  {bulkActionLoading ? <Spinner className="h-3 w-3" /> : <EnvelopeIcon className="h-4 w-4" />}
                  Marquer comme non lues
                </Button>
                <Button
                  size="sm"
                  variant="outlined"
                  color="red"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Supprimer
                </Button>
                <Button
                  size="sm"
                  variant="text"
                  color="gray"
                  onClick={() => setSelectedNotifications(new Set())}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="px-6 pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                label="Rechercher dans les notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <div className="w-full lg:w-48">
              <Select label="Statut de lecture" value={readFilter} onChange={setReadFilter}>
                <Option value="">Toutes</Option>
                <Option value="unread">Non lues</Option>
                <Option value="read">Lues</Option>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <Select label="Type de statut" value={statusFilter} onChange={setStatusFilter}>
                <Option value="">Tous les statuts</Option>
                <Option value="success">Succès</Option>
                <Option value="warning">Avertissement</Option>
                <Option value="error">Erreur</Option>
                <Option value="info">Information</Option>
              </Select>
            </div>
            {uniqueWorkflows.length > 0 && (
              <div className="w-full lg:w-48">
                <Select label="Workflow" value={workflowFilter} onChange={setWorkflowFilter}>
                  <Option value="">Tous les workflows</Option>
                  {uniqueWorkflows.map((workflow) => (
                    <Option key={workflow} value={workflow}>
                      {workflow}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </div>

        <CardBody className="px-0 pt-0 pb-2">
          {refreshing && (
            <div className="flex justify-center items-center py-4">
              <Spinner className="h-6 w-6 mr-2" />
              <Typography variant="small" className="text-blue-gray-600">
                Actualisation en cours...
              </Typography>
            </div>
          )}

          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto">
                <thead>
                  <tr className="border-b border-blue-gray-50">
                    <th className="py-3 px-5 text-left">
                      <Checkbox
                        checked={selectedCount === filteredNotifications.length && filteredNotifications.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded-none"
                      />
                    </th>
                    <th className="py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        Statut
                      </Typography>
                    </th>
                    <th className="py-3 px-5 text-left cursor-pointer" onClick={() => setSortBy("message")}>
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        Message
                      </Typography>
                    </th>
                    <th className="py-3 px-5 text-left cursor-pointer" onClick={() => setSortBy("created_at")}>
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        Date
                      </Typography>
                    </th>
                    <th className="py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        Lu
                      </Typography>
                    </th>
                    <th className="py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        Actions
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification, index) => {
                    const isSelected = selectedNotifications.has(notification.id);
                    const className = `py-4 px-5 transition-all duration-200 hover:bg-blue-gray-50/70 ${
                      index === filteredNotifications.length - 1 ? "" : "border-b border-blue-gray-50"
                    } ${!notification.read ? "bg-blue-50/30" : ""}`;

                    return (
                      <tr key={notification.id} className={`${isSelected ? "bg-blue-100" : ""}`}>
                        <td className={className}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                            className="rounded-none"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(notification.status)}
                            <Chip
                              variant="ghost"
                              color={getStatusColor(notification.status)}
                              value={notification.status || 'info'}
                              className="py-0.5 px-2 text-[10px] font-medium capitalize"
                            />
                          </div>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-3">
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                            <div className="flex-1">
                              <Typography
                                variant="small"
                                className={`${
                                  !notification.read ? "font-semibold text-blue-gray-900" : "text-blue-gray-600"
                                } cursor-pointer hover:text-blue-600 transition-colors`}
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setNotificationDetailsOpen(true);
                                  if (!notification.read) {
                                    markAsRead([notification.id]);
                                  }
                                }}
                              >
                                {notification.message || 'Message non disponible'}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-500">
                            {formatDate(notification.created_at)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="ghost"
                            color={notification.read ? "green" : "orange"}
                            value={
                              <div className="flex items-center gap-1">
                                {notification.read ? (
                                  <EnvelopeOpenIcon className="h-3 w-3" />
                                ) : (
                                  <EnvelopeIcon className="h-3 w-3" />
                                )}
                                <span>{notification.read ? "Lu" : "Non lu"}</span>
                              </div>
                            }
                            className="py-0.5 px-2 text-[10px] font-medium"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <Tooltip content={notification.read ? "Marquer comme non lu" : "Marquer comme lu"}>
                              <IconButton
                                variant="text"
                                size="sm"
                                color={notification.read ? "orange" : "green"}
                                onClick={() => {
                                  if (notification.read) {
                                    markAsUnread([notification.id]);
                                  } else {
                                    markAsRead([notification.id]);
                                  }
                                }}
                                className="hover:bg-blue-gray-50 transition-colors"
                              >
                                {notification.read ? (
                                  <EnvelopeIcon className="h-4 w-4" />
                                ) : (
                                  <EnvelopeOpenIcon className="h-4 w-4" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Menu>
                              <MenuHandler>
                                <IconButton variant="text" size="sm" className="hover:bg-blue-gray-50 transition-colors">
                                  <EllipsisVerticalIcon className="h-4 w-4" />
                                </IconButton>
                              </MenuHandler>
                              <MenuList>
                                <MenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedNotification(notification);
                                    setNotificationDetailsOpen(true);
                                    if (!notification.read) {
                                      markAsRead([notification.id]);
                                    }
                                  }}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  Voir les détails
                                </MenuItem>
                                <MenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => {
                                    setSelectedNotification(notification);
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
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredNotifications.map((notification) => {
                const isSelected = selectedNotifications.has(notification.id);
                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      !notification.read ? "border-l-4 border-l-blue-500" : ""
                    } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-none"
                          />
                          {getStatusIcon(notification.status)}
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip content={notification.read ? "Marquer comme non lu" : "Marquer comme lu"}>
                            <IconButton
                              variant="text"
                              size="sm"
                              color={notification.read ? "orange" : "green"}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notification.read) {
                                  markAsUnread([notification.id]);
                                } else {
                                  markAsRead([notification.id]);
                                }
                              }}
                            >
                              {notification.read ? (
                                <EnvelopeIcon className="h-3 w-3" />
                              ) : (
                                <EnvelopeOpenIcon className="h-3 w-3" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Menu>
                            <MenuHandler>
                              <IconButton variant="text" size="sm" onClick={(e) => e.stopPropagation()}>
                                <EllipsisVerticalIcon className="h-3 w-3" />
                              </IconButton>
                            </MenuHandler>
                            <MenuList>
                              <MenuItem
                                className="flex items-center gap-2"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setNotificationDetailsOpen(true);
                                  if (!notification.read) {
                                    markAsRead([notification.id]);
                                  }
                                }}
                              >
                                <EyeIcon className="h-4 w-4" />
                                Voir les détails
                              </MenuItem>
                              <MenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                                Supprimer
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedNotification(notification);
                          setNotificationDetailsOpen(true);
                          if (!notification.read) {
                            markAsRead([notification.id]);
                          }
                        }}
                      >
                        <div className="mb-2">
                          <Typography
                            variant="small"
                            className={`${
                              !notification.read ? "font-semibold text-blue-gray-900" : "text-blue-gray-600"
                            } line-clamp-2`}
                          >
                            {notification.message || 'Message non disponible'}
                          </Typography>
                        </div>
                        <div className="flex items-center justify-between">
                          <Typography className="text-xs text-blue-gray-500">
                            {formatDate(notification.created_at)}
                          </Typography>
                          <Chip
                            variant="ghost"
                            color={getStatusColor(notification.status)}
                            value={notification.status || 'info'}
                            className="py-0.5 px-2 text-[10px] font-medium capitalize"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredNotifications.length === 0 && !refreshing && (
            <div className="py-8 px-5 text-center">
              <BellIcon className="h-12 w-12 text-blue-gray-300 mx-auto mb-4" />
              <Typography variant="h6" className="text-blue-gray-500 mb-2">
                Aucune notification
              </Typography>
              <Typography variant="small" className="text-blue-gray-400">
                {search || statusFilter || workflowFilter || readFilter
                  ? "Aucune notification ne correspond aux critères de recherche."
                  : "Vous êtes à jour ! Aucune notification pour le moment."}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dialogue détails de la notification */}
      <Dialog
        open={notificationDetailsOpen}
        handler={() => setNotificationDetailsOpen(false)}
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="flex items-center justify-between border-b border-blue-gray-50 pb-4">
          <div className="flex items-center gap-3">
            {selectedNotification && getStatusIcon(selectedNotification.status)}
            <div>
              <Typography variant="h6" color="blue-gray">
                Détails de la notification
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-normal">
                {selectedNotification?.workflow || 'Workflow non spécifié'}
              </Typography>
            </div>
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setNotificationDetailsOpen(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="p-6">
          {selectedNotification && (
            <div className="space-y-6">
              {/* Message principal */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Message
                </Typography>
                <div className="p-4 bg-blue-gray-50 rounded-lg">
                  <Typography className="text-blue-gray-900">
                    {selectedNotification.message || 'Message non disponible'}
                  </Typography>
                </div>
              </div>

              {/* Informations */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Informations
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">📊</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Statut
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Chip
                          variant="ghost"
                          color={getStatusColor(selectedNotification.status)}
                          value={selectedNotification.status || 'info'}
                          className="py-0.5 px-2 text-[10px] font-medium capitalize"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-blue-gray-600" />
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Date de création
                      </Typography>
                      <Typography className="text-blue-gray-900">
                        {selectedNotification.created_at ? 
                          new Date(selectedNotification.created_at).toLocaleString("fr-FR") : 
                          'Date non disponible'
                        }
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">👁️</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Statut de lecture
                      </Typography>
                      <Chip
                        variant="ghost"
                        color={selectedNotification.read ? "green" : "orange"}
                        value={selectedNotification.read ? "Lu" : "Non Lu"}
                        className="py-0.5 px-2 text-[10px] font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">🏷️</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Workflow
                      </Typography>
                      <Typography className="text-blue-gray-900">
                        {selectedNotification.workflow || 'Non spécifié'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">🔗</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        ID Airtable
                      </Typography>
                      <Typography className="text-blue-gray-900 font-mono text-xs">
                        {selectedNotification.id}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Données associées */}
              {selectedNotification.data && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Données associées
                  </Typography>
                  <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
                      {typeof selectedNotification.data === 'string' 
                        ? (() => {
                            try {
                              return JSON.stringify(JSON.parse(selectedNotification.data), null, 2);
                            } catch {
                              return selectedNotification.data;
                            }
                          })()
                        : JSON.stringify(selectedNotification.data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter className="border-t border-blue-gray-50 pt-4">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {selectedNotification && (
                <Button
                  variant="outlined"
                  color={selectedNotification.read ? "orange" : "green"}
                  size="sm"
                  onClick={() => {
                    if (selectedNotification.read) {
                      markAsUnread([selectedNotification.id]);
                    } else {
                      markAsRead([selectedNotification.id]);
                    }
                  }}
                  className="flex items-center gap-2"
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? (
                    <Spinner className="h-3 w-3" />
                  ) : selectedNotification.read ? (
                    <EnvelopeIcon className="h-4 w-4" />
                  ) : (
                    <EnvelopeOpenIcon className="h-4 w-4" />
                  )}
                  {selectedNotification.read ? "Marquer non lu" : "Marquer lu"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="blue-gray"
                onClick={() => setNotificationDetailsOpen(false)}
              >
                Fermer
              </Button>
              <Button
                color="red"
                variant="outlined"
                onClick={() => {
                  if (selectedNotification) {
                    deleteNotifications([selectedNotification.id]);
                    setNotificationDetailsOpen(false);
                  }
                }}
                className="flex items-center gap-2"
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                Supprimer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} handler={() => setDeleteDialogOpen(false)} size="sm">
        <DialogHeader className="text-red-500">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
          Confirmer la suppression
        </DialogHeader>
        <DialogBody>
          <Typography>
            {selectedCount > 0
              ? `Êtes-vous sûr de vouloir supprimer ${selectedCount} notification${selectedCount !== 1 ? "s" : ""} ?`
              : "Êtes-vous sûr de vouloir supprimer cette notification ?"}
            <br />
            <span className="text-red-500 font-medium">
              Cette action est irréversible et supprimera définitivement les données d'Airtable.
            </span>
          </Typography>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={bulkActionLoading}
          >
            Annuler
          </Button>
          <Button
            variant="filled"
            color="red"
            onClick={() => {
              if (selectedCount > 0) {
                deleteNotifications([...selectedNotifications]);
              } else if (selectedNotification) {
                deleteNotifications([selectedNotification.id]);
              }
            }}
            disabled={bulkActionLoading}
            className="flex items-center gap-2"
          >
            {bulkActionLoading ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}