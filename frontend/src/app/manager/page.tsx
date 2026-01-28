"use client";
import AuthGuard from "@/components/common/AuthGuard";

export default function ManagerPage() {
    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-4">
                <h1 className="text-4xl font-bold text-blue-800">Manager Dashboard</h1>
                <p className="mt-4 text-lg text-blue-600">Welcome, Manager.</p>
            </div>
        </AuthGuard>
    );
}
