import { cn } from "@/lib/cn";

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-white/10 bg-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
