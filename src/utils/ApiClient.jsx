import axios from "axios";



// Configuration de base pour Axios
const apiClient = axios.create({
  baseURL: import.meta.env.REACT_APP_BASE_URL || "http://localhost:3000/api",
  timeout: 30000, 
  headers: {
    "Content-Type": "application/json", // Type de contenu par défaut
  },
});

// Intercepteur pour ajouter un token d'authentification (si nécessaire)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

// Intercepteur pour gérer les erreurs globales
apiClient.interceptors.response.use(
  (response) => response, // Retourne la réponse si tout est OK
  (error) => {
    if (error.response) {
      // Gère les erreurs renvoyées par le serveur
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Gère les erreurs de réseau
      console.error("Network Error:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error); // Rejette l'erreur pour un traitement local
  }
);

export default apiClient;
