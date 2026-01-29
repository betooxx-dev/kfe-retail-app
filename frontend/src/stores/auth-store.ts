import { StateCreator, create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { AuthService } from "../services/auth-service";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user?: User;
    token?: string;
    errors: string[];

    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const storeApi: StateCreator<AuthState> = (set: any) => ({
    isAuthenticated: false,
    token: undefined,
    user: undefined,
    errors: [],

    login: async (email: string, password: string) => {
        try {
            const { data } = await AuthService.login(email, password);
            set(() => ({
                isAuthenticated: true,
                token: data.token,
                user: {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    role: data.role,
                },
                errors: [],
            }));
        } catch (error) {
            set(() => ({ errors: ["An error occurred while trying to login"] }));
            throw error;
        }
    },

    logout: () => {
        try {
            set(() => ({
                isAuthenticated: false,
                token: undefined,
                user: undefined,
                errors: [],
            }));
        } catch (error) {
            throw error;
        }
    },
});

export const useAuthStore = create<AuthState>()(
    devtools(persist(storeApi, { name: "auth" }))
);