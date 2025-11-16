'use client';

import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

interface ParticlesBackgroundProps {
  className?: string;
}

const ParticlesBackground = ({ className }: ParticlesBackgroundProps) => {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-white via-white to-[#f2f4f8]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.75),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.6),transparent_60%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.55),transparent_60%)]" />

      <InteractiveGridPattern
        squares={[34, 22]}
        width={42}
        height={42}
        className={cn(
          'h-full w-full opacity-75',
          '[mask-image:radial-gradient(92%_92%_at_center,rgba(255,255,255,0.95),transparent)]',
        )}
        squaresClassName="stroke-slate-300/55"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/70" />
    </div>
  );
};

export default ParticlesBackground;