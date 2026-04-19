"use client";

import { useActionState, useState, useTransition } from "react";
import { createPost, type PostState } from "@/app/actions/posts";
import { uploadFile } from "@/app/actions/upload";
import { Rocket } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { DirectPreviewEditor } from "@/components/editor/direct-preview-editor";
import { BackButton } from "@/components/layout/back-button";

const CATEGORIES = [
  { value: "campus", label: "Campus" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "events", label: "Events" },
  { value: "opinion", label: "Opinion" },
  { value: "clubs", label: "Clubs" },
];

export default function CreatePostPage() {
  const [state, formAction, isPending] = useActionState<PostState, FormData>(
    createPost,
    null
  );
  const [mediaUrls, setMediaUrls] = useState<
    { url: string; type: string }[]
  >([]);
  const [coverImage, setCoverImage] = useState("");
  const [uploading, startUpload] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isCover = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File too large", "File exceeds the 10MB limit. Please upload a smaller file.");
      return;
    }

    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadFile(formData);
      if (result.url) {
        if (isCover) {
          setCoverImage(result.url);
        } else {
          setMediaUrls((prev) => [
            ...prev,
            { url: result.url!, type: result.type! },
          ]);
        }
      } else if (result.error) {
        toast.error("Upload failed", result.error);
      }
    });
  };

  return (
    <div className="container-news" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <BackButton />

      <div 
        className="animate-fade-in" 
        style={{ maxWidth: 740, margin: "2rem auto 0 auto" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Write a Post
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-tertiary)",
            marginBottom: "2rem",
          }}
        >
          Share news, stories, and updates with your campus
        </p>

        {state?.error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(196,30,58,0.08)",
              border: "1px solid rgba(196,30,58,0.2)",
              borderRadius: "var(--radius-sm)",
              color: "var(--error)",
              fontSize: "0.8125rem",
              marginBottom: "1rem",
            }}
          >
            {state.error}
          </div>
        )}

        <div className="animate-fade-in">
          <form action={formAction}>
            <input type="hidden" name="coverImageUrl" value={coverImage} />
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="content" value={content} />
            <input
              type="hidden"
              name="mediaUrls"
              value={JSON.stringify(mediaUrls)}
            />

            <DirectPreviewEditor
              title={title}
              onTitleChange={setTitle}
              content={content}
              onChange={setContent}
              coverImage={coverImage}
              onCoverImageClick={() => {
                const fileInput = document.getElementById("cover-file-input");
                if (fileInput) fileInput.click();
              }}
            />

            <input
              id="cover-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, true)}
              style={{ display: "none" }}
            />

            <div style={{ maxWidth: 740, margin: "2rem auto" }}>
              {/* Category */}
              <div className="input-group">
                <label htmlFor="category" className="input-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  defaultValue="campus"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="input-group" style={{ marginTop: "1rem" }}>
                <label htmlFor="tags" className="input-label">
                  Tags (comma-separated, no # needed)
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  className="input"
                  placeholder="e.g. exam, library, seminar"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isPending}
                style={{ width: "100%", marginTop: "2.5rem" }}
              >
                {isPending ? "Publishing..." : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><Rocket size={20} /> Publish Post</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
