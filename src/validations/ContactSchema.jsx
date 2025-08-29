import * as yup from "yup";

export const ContactSchema = yup.object().shape({
  // Informations de base - tous optionnels mais avec validation de format si remplis
  nom: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

    id: yup
    .string()
    .required()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  localisation: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  posteActuel: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(200, "Le poste ne peut pas dépasser 200 caractères"),

  entrepriseActuelle: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(150, "Le nom de l'entreprise ne peut pas dépasser 150 caractères"),

  url: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .url("L'URL doit être valide (ex: https://www.linkedin.com/in/...)")
    .matches(
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      "L'URL doit être un profil LinkedIn valide"
    ),

  statut: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .oneOf(
      [
        "À contacter",
        "Message envoyé", 
        "Répondu",
        "Pas intéressé",
        "Rendez-vous pris",
        "Non intéressé",
        "À recontacter"
      ],
      "Statut invalide"
    ),

  campagne: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  secteurs: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  parcours: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(2000, "Le parcours ne peut pas dépasser 2000 caractères"),

  parcoursEducation: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(1500, "Le parcours éducation ne peut pas dépasser 1500 caractères"),

  messagePersonnalise: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(1000, "Le message personnalisé ne peut pas dépasser 1000 caractères"),

  connection: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .oneOf(["1st", "2nd", "3rd", "Out of network"], "Type de connexion invalide"),

  // Validation email avec format si rempli
  email: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .email("L'email doit être valide")
    .max(100, "L'email ne peut pas dépasser 100 caractères"),

  // Validation téléphone avec format flexible si rempli
  telephone: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(
      /^(\+33|0)[1-9](\d{8})$|^(\+33\s?|0)[1-9](\s?\d{2}){4}$|^(\+\d{1,3}\s?)?\d{4,15}$/,
      "Le numéro de téléphone n'est pas valide"
    ),


  reponseRecue: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .oneOf(["Oui", "Non"], "La réponse doit être 'Oui' ou 'Non'"),


  notes: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(3000, "Les notes ne peuvent pas dépasser 3000 caractères"),
});

export default ContactSchema;