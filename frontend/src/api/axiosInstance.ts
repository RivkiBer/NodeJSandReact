/**
 * Axios instance used by the frontend to call the backend API.
 *
 * This file centralizes the API base URL and common request options.
 *
 * The base URL is read from the frontend .env file through Vite:
 *   VITE_API_BASE_URL=http://localhost:4000/api
 *
 * If the environment variable is missing, we fall back to:
 *   http://localhost:4000/api
 *
 * Usage example:
 *   import axiosInstance from "./api/axiosInstance";
 *   const response = await axiosInstance.get("/health");
 */
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
