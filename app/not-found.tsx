import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-news animate-fade-in py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center mb-6">
        <FileQuestion size={36} className="text-accent" />
      </div>

      <h1 className="font-heading text-5xl font-black mb-2 tracking-tight">
        404
      </h1>

      <h2 className="font-heading text-xl font-semibold mb-3 text-secondary">
        Page Not Found
      </h2>

      <p className="text-[0.9375rem] text-tertiary mb-8 max-w-[400px]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex gap-3">
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
        <Link href="/explore" className="btn btn-secondary">
          Explore Posts
        </Link>
      </div>
    </div>
  );
}
