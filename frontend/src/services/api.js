// frontend/src/services/api.js
import axios from "axios";

// Create a configured Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Matches the backend server address
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach the JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
