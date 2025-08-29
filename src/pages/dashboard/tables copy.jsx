// ProductTable.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

// Composant réutilisable pour afficher une table de produits
const ProductTable = ({ title, products }) => {
  return (
    <Card>
      <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
        <Typography variant="h6" color="white">
          {title || "Produits"}
        </Typography>
      </CardHeader>
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <table className="w-full min-w-[640px] table-auto">
          <thead>
            <tr>
              {["produit", "catégorie", "prix", "stock", "statut", "actions"].map((el) => (
                <th
                  key={el}
                  className="border-b border-blue-gray-50 py-3 px-5 text-left"
                >
                  <Typography
                    variant="small"
                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                  >
                    {el}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(
              ({ img, name, category, price, stock, status }, key) => {
                const className = `py-3 px-5 ${
                  key === products.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={name}>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <Avatar src={img} alt={name} size="sm" variant="rounded" />
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {name}
                        </Typography>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {category}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {price} €
                      </Typography>
                    </td>
                    <td className={className}>
                      <div className="w-10/12">
                        <Typography
                          variant="small"
                          className="mb-1 block text-xs font-medium text-blue-gray-600"
                        >
                          {stock} unités
                        </Typography>
                        <Progress
                          value={stock > 100 ? 100 : stock}
                          variant="gradient"
                          color={stock > 20 ? "green" : stock > 5 ? "yellow" : "red"}
                          className="h-1"
                        />
                      </div>
                    </td>
                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={
                          status === "disponible" 
                            ? "green" 
                            : status === "limité" 
                              ? "amber" 
                              : "red"
                        }
                        value={status}
                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                      />
                    </td>
                    <td className={className}>
                      <Typography
                        as="a"
                        href="#"
                        className="text-xs font-semibold text-blue-gray-600 mr-4"
                      >
                        Modifier
                      </Typography>
                      <Typography
                        as="a"
                        href="#"
                        className="text-xs font-semibold text-red-500"
                      >
                        Supprimer
                      </Typography>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

// Exemple d'utilisation du composant
export function ProductsPage() {
  // Exemple de données de produits
  const productsData = [
    {
      img: "/img/products/smartphone.png",
      name: "iPhone 14 Pro",
      category: "Électronique",
      price: 1299.99,
      stock: 45,
      status: "disponible"
    },
    {
      img: "/img/products/laptop.png",
      name: "MacBook Air M2",
      category: "Informatique",
      price: 1399.99,
      stock: 12,
      status: "limité"
    },
    {
      img: "/img/products/headphones.png",
      name: "AirPods Pro",
      category: "Audio",
      price: 279.99,
      stock: 78,
      status: "disponible"
    },
    {
      img: "/img/products/watch.png",
      name: "Apple Watch Series 8",
      category: "Wearables",
      price: 429.99,
      stock: 3,
      status: "critique"
    },
    {
      img: "/img/products/tablet.png",
      name: "iPad Pro 12.9",
      category: "Tablettes",
      price: 1099.99,
      stock: 25,
      status: "disponible"
    }
  ];

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <ProductTable title="Catalogue de Produits" products={productsData} />
    </div>
  );
}

export default ProductsPage;