"use client";

import { useActionState, useState, useTransition } from "react";
import { updatePost, type PostState } from "@/app/actions/posts";
import { uploadFile } from "@/app/actions/upload";
import { DirectPreviewEditor } from "@/components/editor/direct-preview-editor";
import { Save } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface EditPostFormProps {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    category: string;
    tags: string[] | null;
    coverImageUrl: string | null;
    mediaUrls: { url: string; type: string }[] | null;
  };
}

const CATEGORIES = [
  { value: "campus", label: "Campus" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "events", label: "Events" },
  { value: "opinion", label: "Opinion" },
  { value: "clubs", label: "Clubs" },
];

export function EditPostForm({ post }: EditPostFormProps) {
  const boundUpdate = updatePost.bind(null, post.id);
  const [state, formAction, isPending] = useActionState<PostState, FormData>(
    boundUpdate,
    null
  );
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content || "");
  const [coverImage, setCoverImage] = useState(post.coverImageUrl || "");
  const [uploading, startUpload] = useTransition();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File too large", "File exceeds the 10MB limit.");
      return;
    }

    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadFile(formData);
      if (result.url) {
        setCoverImage(result.url);
      } else if (result.error) {
        toast.error("Upload failed", result.error);
      }
    });
  };

  return (
    <>
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

      <form action={formAction}>
        <input
          type="hidden"
          name="coverImageUrl"
          value={coverImage}
        />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="content" value={content} />
        <input
          type="hidden"
          name="mediaUrls"
          value={JSON.stringify(post.mediaUrls || [])}
        />

        <DirectPreviewEditor 
          title={title}
          onTitleChange={setTitle}
          content={content}
          onChange={setContent}
          coverImage={coverImage}
          onCoverImageClick={() => {
            document.getElementById("cover-file-input")?.click();
          }}
        />

        <input
          id="cover-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <div style={{ maxWidth: 740, margin: "2rem auto", display: "grid", gap: "1.5rem" }}>
          <div className="input-group">
            <label htmlFor="category" className="input-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="input"
              defaultValue={post.category}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="tags" className="input-label">
              Tags (comma-separated, no # needed)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="input"
              defaultValue={post.tags?.join(", ") || ""}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isPending}
          style={{ width: "100%", marginTop: "2rem" }}
        >
          {isPending ? "Saving..." : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><Save size={20} /> Save Changes</span>}
        </button>
      </form>
    </>
  );
}
