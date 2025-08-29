import * as yup from "yup";

export const CampagneSchema = yup.object().shape({
  nom: yup
    .string()
    .required("Le nom de la campagne est obligatoire")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  posteRecherche: yup
    .string()
    .required("Le poste recherché est obligatoire"),

  zoneGeographique: yup
    .string()
    .required("La zone géographique est obligatoire"),

  anneesExperienceMin: yup
    .number()
    .min(0, "Le nombre d'années ne peut pas être négatif")
    .max(50, "Le nombre d'années ne peut pas dépasser 50")
    .integer("Le nombre d'années doit être un entier"),

  anneesExperienceMax: yup
    .number()
    .min(0, "Le nombre d'années ne peut pas être négatif")
    .max(50, "Le nombre d'années ne peut pas dépasser 50")
    .integer("Le nombre d'années doit être un entier")
    .test(
      "max-greater-than-min",
      "Le maximum doit être supérieur ou égal au minimum",
      function (value) {
        const { anneesExperienceMin } = this.parent;
        return !anneesExperienceMin || !value || value >= anneesExperienceMin;
      }
    ),

  languesParlees: yup
    .string()
    .required("Au moins une langue est requise"),

  secteursSOuhaites: yup
    .string()
    .required("Au moins un secteur est requis"),


  Template_message: yup
    .string()
    .required("Directive pour les messages est obligatoire"),
});