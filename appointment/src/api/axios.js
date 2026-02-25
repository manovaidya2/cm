// // src/api/axios.js
// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", // Or hardcoded fallback
//   // baseURL: import.meta.env.VITE_API_BASE_URL || "https://crmapi.manovaidya.com/api",
//   // withCredentials: true, // Important for cookie-based auth
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // https://crmapi.manovaidya.com/

// // Optional: Add a request interceptor (for token headers etc.)
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); // Or get from context
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default axiosInstance;




// src/api/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL 
    || "https://crmapi.manovaidya.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;