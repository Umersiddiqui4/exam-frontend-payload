// utils/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with actual base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
