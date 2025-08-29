import * as yup from "yup";

export const ProduitSchema = yup.object().shape({
    nom: yup.string().required("leniom du produit"),
    prix:  yup.number().required(),
    description:  yup.string(),
    qte:yup.number(),
    fournisseurId: yup.number().required(),
    categorieId: yup.number().required(),
    seuilAlerte:yup.number().required()

});
