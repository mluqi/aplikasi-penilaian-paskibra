import axios, { InternalAxiosRequestConfig } from "axios";

const instance = axios.create({
  // baseURL: "/api",
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
