import axios from "axios";

const api = axios.create({
  // Vercel rewrites /api to Render; Vite proxies it during local development.
  baseURL: "",
  withCredentials: true,
});

export default api;
