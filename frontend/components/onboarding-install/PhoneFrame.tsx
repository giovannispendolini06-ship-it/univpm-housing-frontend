export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[220px]">
      <div className="relative overflow-hidden rounded-[28px] border-4 border-ink bg-white shadow-card">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-ink" />
        <div className="aspect-[9/18] w-full">{children}</div>
        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-ink/20" />
      </div>
    </div>
  );
}
