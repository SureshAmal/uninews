export default function CreateLoading() {
  return (
    <div className="container-news pt-8 pb-16">
      <div className="skeleton w-[80px] h-8 mb-8" /> {/* Back Button */}

      <div className="animate-fade-in max-w-[740px] mx-auto mt-2">
        {/* Header Title Skeletons */}
        <div className="mb-2">
          <div className="skeleton w-[220px] h-10 mb-2" />
          <div className="skeleton w-[280px] h-4 mb-8" />
        </div>

        {/* Headline Input Skeleton */}
        <div className="mb-6">
          <div className="skeleton w-full h-[60px] rounded-md" />
        </div>

        {/* Cover Image Placeholder Skeleton */}
        <div className="mb-8 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-light)] h-[200px] flex items-center justify-center">
           <div className="skeleton w-10 h-10 rounded-md" />
        </div>

        {/* Content Area Skeleton */}
        <div className="space-y-4">
          <div className="skeleton w-full h-4" />
          <div className="skeleton w-[95%] h-4" />
          <div className="skeleton w-[98%] h-4" />
          <div className="skeleton w-[60%] h-4" />
          <div className="pt-4 space-y-4">
            <div className="skeleton w-full h-4" />
            <div className="skeleton w-[92%] h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
