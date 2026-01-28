import { api } from "../api/api";

export class AuthService {
    static login = async (email: string, password: string) => {
        try {
            const { data } = await api.post("api/auth/login", { email, password });
            return data;
        } catch (error) {
            console.log(error);
            throw new Error("An error occurred while trying to login");
        }
    }
}