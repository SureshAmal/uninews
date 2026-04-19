export default function Loading() {
  return (
    <div className="container-news animate-fade-in pt-8 pb-16">
      {/* Masthead skeleton */}
      <div className="text-center mb-8">
        <div className="skeleton w-[200px] h-9 mx-auto mb-2" />
        <div className="skeleton w-[300px] h-3.5 mx-auto" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-[var(--border-light)] overflow-hidden"
          >
            <div className="skeleton w-full h-[180px] rounded-none" />
            <div className="p-4">
              <div className="skeleton w-[60px] h-3 mb-3" />
              <div className="skeleton w-[90%] h-5 mb-2" />
              <div className="skeleton w-[70%] h-3.5 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton w-6 h-6 rounded-full" />
                <div className="skeleton w-[100px] h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
