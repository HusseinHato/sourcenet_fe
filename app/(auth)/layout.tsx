import ParticlesBackground from "@/app/components/ParticlesBackground";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f0f0f0]">
            <ParticlesBackground />
            <div className="relative z-10 w-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
