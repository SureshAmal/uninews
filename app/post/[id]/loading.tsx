export default function PostLoading() {
  return (
    <div className="container-news pt-8 pb-16">
      <div className="skeleton w-[80px] h-8 mb-8" /> {/* Back Button */}

      <article className="animate-fade-in max-w-[740px] mx-auto">
        {/* Category + Date Skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-[80px] h-6 rounded-full" />
          <div className="skeleton w-[120px] h-4" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-8">
          <div className="skeleton w-full h-[3rem]" />
          <div className="skeleton w-[85%] h-[3rem]" />
        </div>

        {/* Author Info Skeleton */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-3">
            <div className="skeleton w-[48px] h-[48px] rounded-full" />
            <div className="space-y-1.5">
              <div className="skeleton w-[140px] h-4" />
              <div className="skeleton w-[100px] h-3" />
            </div>
          </div>
        </div>

        {/* Cover Image Skeleton */}
        <div className="mb-8 rounded-md overflow-hidden">
          <div className="skeleton w-full aspect-[16/9] rounded-none" />
        </div>

        {/* Article Body Skeleton */}
        <div className="space-y-4">
          <div className="skeleton w-full h-4" />
          <div className="skeleton w-full h-4" />
          <div className="skeleton w-[98%] h-4" />
          <div className="skeleton w-[95%] h-4" />
          <div className="skeleton w-[40%] h-4" />
          
          <div className="pt-6 space-y-4">
            <div className="skeleton w-full h-4" />
            <div className="skeleton w-[97%] h-4" />
            <div className="skeleton w-[92%] h-4" />
          </div>
        </div>
      </article>
    </div>
  );
}
