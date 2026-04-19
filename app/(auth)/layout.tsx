export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center py-8 px-4 bg-linear-to-br from-bg-primary to-bg-tertiary">
      <div className="animate-scale-in w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-[2.5rem] font-black tracking-[0.02em] text-primary">
            Uni<span className="text-accent">News</span>
          </h1>
          <p className="text-[0.875rem] text-tertiary mt-1">
            Your university&apos;s pulse
          </p>
        </div>

        {/* Card */}
        <div className="card-glass p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
