export default function ProfileLoading() {
  return (
    <div className="container-news animate-fade-in pt-8 pb-16">
      <div className="skeleton w-[80px] h-8 mb-8" /> {/* Back Button */}

      {/* Profile Header Skeleton */}
      <div className="flex gap-8 items-start mb-10 flex-wrap">
        {/* Avatar Skeleton */}
        <div className="skeleton w-[100px] h-[100px] rounded-full border-[3px] border-[var(--border-light)]" />

        {/* Info Skeleton */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <div className="skeleton w-[240px] h-10" />
            <div className="skeleton w-[100px] h-8 rounded-md" />
          </div>
          <div className="skeleton w-[140px] h-4 mb-3" />
          <div className="skeleton w-[80%] max-w-[400px] h-4 mb-4" />

          {/* Stats Skeleton */}
          <div className="flex gap-6">
            <div className="skeleton w-[80px] h-4" />
            <div className="skeleton w-[80px] h-4" />
            <div className="skeleton w-[80px] h-4" />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-light)] pt-8">
        {/* Feed Skeleton */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-[var(--border-light)] overflow-hidden"
            >
              <div className="skeleton w-full h-[180px] rounded-none" />
              <div className="p-4">
                <div className="skeleton w-[60px] h-3 mb-3" />
                <div className="skeleton w-[90%] h-5 mb-2" />
                <div className="skeleton w-[70%] h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
