"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isAuthenticated) {
            router.push("/login");
        }
    }, [isMounted, isAuthenticated, router]);

    if (!isMounted || !isAuthenticated) return null;
    
    return <>{children}</>;
}
