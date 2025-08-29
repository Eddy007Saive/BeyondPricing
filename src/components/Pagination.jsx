import React from "react";
import { IconButton, Typography } from "@material-tailwind/react";

/**
 * Composant de pagination réutilisable
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.currentPage - La page actuelle
 * @param {number} props.totalPages - Le nombre total de pages
 * @param {number} props.totalItems - Le nombre total d'éléments
 * @param {number} props.limit - Le nombre d'éléments par page
 * @param {Function} props.onPageChange - Fonction appelée lors du changement de page
 * @param {Function} props.onLimitChange - Fonction appelée lors du changement de limite par page
 * @param {string} props.itemName - Nom des éléments affichés (ex: "produits", "utilisateurs")
 * @returns {JSX.Element} Composant de pagination
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  itemName = "éléments"
}) => {
  // Fonction pour aller à une page spécifique
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
      {/* Sélecteur du nombre d'éléments par page */}
      <div className="flex items-center gap-2">
        <Typography variant="small" className="text-blue-gray-600">
          Afficher
        </Typography>
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
          }}
          className="rounded border border-blue-gray-200 p-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <Typography variant="small" className="text-blue-gray-600">
          par page | Total: {totalItems} {itemName}
        </Typography>
      </div>

      {/* Boutons de navigation */}
      <div className="flex gap-2">
        {/* Premier page */}
        <IconButton
          variant="outlined"
          color="blue-gray"
          disabled={currentPage <= 1}
          onClick={() => goToPage(1)}
        >
          {"<<"}
        </IconButton>
        
        {/* Page précédente */}
        <IconButton
          variant="outlined"
          color="blue-gray"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          {"<"}
        </IconButton>
        
        {/* Indicateur de page actuelle */}
        <div className="flex items-center gap-1">
          <Typography variant="small" className="text-blue-gray-600">
            Page {currentPage} sur {totalPages}
          </Typography>
        </div>

        {/* Page suivante */}
        <IconButton
          variant="outlined"
          color="blue-gray"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          {">"}
        </IconButton>
        
        {/* Dernière page */}
        <IconButton
          variant="outlined"
          color="blue-gray"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(totalPages)}
        >
          {">>"}
        </IconButton>
      </div>
    </div>
  );
};

export default Pagination;