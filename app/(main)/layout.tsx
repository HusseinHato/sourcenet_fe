import { Navbar } from "@/app/components/layout/Navbar";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Suspense } from "react";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full bg-white">
            <Navbar />
            <Suspense fallback={<div className="w-52 fixed h-screen bg-[#F5F5F5] hidden md:block" />}>
                <Sidebar />
            </Suspense>
            <main className="relative z-10 md:ml-52 min-h-screen pt-24">
                {children}
            </main>
        </div>
    );
}
