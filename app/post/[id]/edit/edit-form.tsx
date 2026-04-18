"use client";

import { useActionState, useState } from "react";
import { updatePost, type PostState } from "@/app/actions/posts";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Save } from "lucide-react";

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
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

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
          value={post.coverImageUrl || ""}
        />
        <input
          type="hidden"
          name="mediaUrls"
          value={JSON.stringify(post.mediaUrls || [])}
        />

        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="input-group">
            <label htmlFor="title" className="input-label">
              Headline *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            />
          </div>

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
            <label htmlFor="content" className="input-label">
              Story *
            </label>
            <input type="hidden" name="content" value={content} />
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your story here..."
            />
          </div>

          <div className="input-group">
            <label htmlFor="tags" className="input-label">
              Tags (comma-separated)
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
