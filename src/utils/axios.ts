// utils/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://exam-cms-payload.vercel.app/api", // Replace with actual base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
