import axios from "axios";

const api = axios.create({
  // Vite serves /api through the development proxy; production uses VITE_API_URL.
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_API_URL || "" : "",
  withCredentials: true,
});

export default api;
