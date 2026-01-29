import axios from "axios";
import { useAuthStore } from "../stores/auth-store";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

api.interceptors.request.use((config: any) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
});

export { api };