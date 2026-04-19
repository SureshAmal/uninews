export default function ExploreLoading() {
  return (
    <div className="container-news animate-fade-in pt-8 pb-16">
      {/* Title + Subtitle Skeletons */}
      <div className="mt-4 mb-2">
        <div className="skeleton w-[180px] h-9 mb-2" />
        <div className="skeleton w-[240px] h-4" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-6 mt-6">
        <div className="skeleton max-w-[400px] h-[42px] rounded-md" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-1.5 flex-wrap mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton w-[60px] h-[32px] rounded-full" />
        ))}
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
