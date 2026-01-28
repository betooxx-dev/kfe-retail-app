"use client";
import AuthGuard from "@/components/common/AuthGuard";
import DashboardLayout from "@/components/common/DashboardLayout";
import ReportsPage from "@/components/views/ReportsPage";

export default function ManagerPage() {
    const navItems = [
        {
            name: "Reports",
            href: "/manager",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
            )
        }
    ];

    return (
        <AuthGuard>
            <DashboardLayout titleSuffix="Manager" navItems={navItems}>
                <ReportsPage />
            </DashboardLayout>
        </AuthGuard>
    );
}
