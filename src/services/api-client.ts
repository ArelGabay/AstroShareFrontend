import axios, { CanceledError } from "axios";

export { CanceledError };

// Set base URL for API requests
const backend_url = import.meta.env.VITE_BACKEND_URL
const apiClient = axios.create({
  baseURL: backend_url
});

export default apiClient
