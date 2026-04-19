"use client";

import { useActionState, useState, useTransition } from "react";
import { createPost, type PostState } from "@/app/actions/posts";
import { uploadFile } from "@/app/actions/upload";
import { PenLine, Eye, X, Camera, Clapperboard, Plus, Rocket } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
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
  const [preview, setPreview] = useState(false);
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
    <div
      className="container-news animate-fade-in"
      style={{
        paddingTop: "2rem",
        paddingBottom: "4rem",
        maxWidth: 740,
        margin: "0 auto",
      }}
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

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => setPreview(false)}
          className={`btn ${!preview ? "btn-primary" : "btn-ghost"} btn-sm`}
        >
          <PenLine size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Write
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`btn ${preview ? "btn-primary" : "btn-ghost"} btn-sm`}
        >
          <Eye size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Preview
        </button>
      </div>

      {preview ? (
        <div
          className="card"
          style={{ padding: "2rem" }}
        >
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover"
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
              }}
            />
          )}
          <h2 className="headline-hero">{title || "Untitled Post"}</h2>
          <div
            className="rich-text-content"
            style={{
              marginTop: "1.5rem",
              fontSize: "1.125rem",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
            }}
            dangerouslySetInnerHTML={{ __html: content || "<p>Start writing your story...</p>" }}
          />
        </div>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="coverImageUrl" value={coverImage} />
          <input
            type="hidden"
            name="mediaUrls"
            value={JSON.stringify(mediaUrls)}
          />

          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Cover Image */}
            <div className="input-group">
              <label className="input-label">Cover Image</label>
              {coverImage ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={coverImage}
                    alt="Cover"
                    style={{
                      width: "100%",
                      maxHeight: 250,
                      objectFit: "cover",
                      borderRadius: "var(--radius-md)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="btn btn-ghost btn-icon"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 150,
                    border: "2px dashed var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    fontSize: "0.875rem",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, true)}
                    style={{ display: "none" }}
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Camera size={16} /> Click to upload cover image</span>
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="input-group">
            <label htmlFor="title" className="input-label">
              Headline *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`input ${state?.fieldErrors?.title ? "input-error" : ""}`}
              placeholder="Write a compelling headline..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            />
          </div>

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

          {/* Content */}
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

          {/* Tags */}
          <div className="input-group">
            <label htmlFor="tags" className="input-label">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="input"
              placeholder="e.g. exam, library, seminar"
            />
          </div>

          {/* Additional Media */}
          <div className="input-group">
            <label className="input-label">Additional Media</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              {mediaUrls.map((media, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: 100,
                    height: 100,
                  }}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                      }}
                    >
                      <Clapperboard size={32} color="var(--text-tertiary)" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setMediaUrls((prev) => prev.filter((_, j) => j !== i))
                    }
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: "0.625rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "1px dashed var(--border-color)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
              }}
            >
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={(e) => handleFileUpload(e)}
                style={{ display: "none" }}
              />
              {uploading ? "Uploading..." : <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><Plus size={16} /> Add photo or video</span>}
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isPending}
            style={{ width: "100%", marginTop: "2rem" }}
          >
            {isPending ? "Publishing..." : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><Rocket size={20} /> Publish Post</span>}
          </button>
        </form>
      )
      }
    </div >
  );
}
