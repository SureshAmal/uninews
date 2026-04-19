"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { StarterKit } from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Link } from "@tiptap/extension-link";
import { ResizableImage } from "./extensions/resizable-image";
import { Sticker } from "./extensions/sticker";
import { Pill } from "./extensions/pill";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Smile,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2
} from "lucide-react";
import { useState, useTransition } from "react";
import { uploadFile } from "@/app/actions/upload";
import { toast } from "@/components/ui/toast";

const COLORS = [
  { name: "Default", color: "inherit" },
  { name: "Accent", color: "var(--accent)" },
  { name: "Success", color: "var(--success)" },
  { name: "Warning", color: "var(--warning)" },
  { name: "Error", color: "var(--error)" },
  { name: "Blue", color: "#2563eb" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Orange", color: "#f97316" },
];

const STICKERS = ["❤️", "🔥", "🚀", "✨", "📢", "🎓", "⚽", "📅", "💡", "✅", "⚠️", "🤔"];

function ensureAbsoluteUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
}

export function DirectPreviewEditor({
  content,
  onChange,
  title,
  onTitleChange,
  coverImage,
  onCoverImageClick
}: {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  coverImage?: string;
  onCoverImageClick?: () => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploading, startUpload] = useTransition();

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File too large", "File exceeds the 10MB limit.");
      return;
    }

    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadFile(formData);
      if (result.url) {
        editor?.chain().focus().insertContent({
          type: "resizableImage",
          attrs: { src: result.url }
        }).run();
      } else {
        toast.error("Upload failed", result.error || "Could not upload image");
      }
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "reference-link",
        },
      }),
      ResizableImage,
      Sticker,
      Pill,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-newspaper direct-preview-canvas",
        style: "outline: none; min-height: 500px;",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleFileUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            handleFileUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="direct-editor-container animate-fade-in">
      {/* Uploading Indicator */}
      {isUploading && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "var(--accent)",
          color: "white",
          padding: "0.75rem 1.25rem",
          borderRadius: "var(--radius-pill)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 600
        }}>
          <div className="spinner-sm" style={{ borderTopColor: "white" }} />
          Uploading image...
        </div>
      )}

      {/* Floating Toolbar */}
      <div className="editor-sticky-toolbar">
        <div className="toolbar-group">
          <button type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
          >
            <Heading2 size={18} />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
          >
            <Heading3 size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`}
            title="Number List"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`toolbar-btn ${showColorPicker ? "active" : ""}`}
            title="Text Color"
          >
            <Palette size={18} />
          </button>
          {showColorPicker && (
            <div className="color-picker-popup">
              {COLORS.map((c) => (
                <button type="button"
                  key={c.name}
                  onClick={() => {
                    if (c.color === "inherit") editor.chain().focus().unsetColor().run();
                    else editor.chain().focus().setColor(c.color).run();
                    setShowColorPicker(false);
                  }}
                  className="color-swatch"
                  style={{ backgroundColor: c.color.startsWith("var") ? `var(--text-primary)` : c.color, border: c.color === "inherit" ? "1px solid var(--border-color)" : "none" }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => document.getElementById("inline-image-input")?.click()}
            className="toolbar-btn"
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </button>
          <input
            id="inline-image-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowStickerPicker(!showStickerPicker)}
              className={`toolbar-btn ${showStickerPicker ? "active" : ""}`}
              title="Insert Sticker"
            >
              <Smile size={18} />
            </button>
            {showStickerPicker && (
              <div className="sticker-picker-popup">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertContent({ type: "sticker", attrs: { name: s } }).run();
                      setShowStickerPicker(false);
                    }}
                    className="sticker-option"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button"
            onClick={() => editor.chain().focus().toggleMark("pill").run()}
            className={`toolbar-btn ${editor.isActive("pill") ? "active" : ""}`}
            title="Pill text"
          >
            <div style={{ padding: "0 4px", fontSize: "10px", fontWeight: 700, border: "1px solid currentColor", borderRadius: 4 }}>PILL</div>
          </button>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setLinkUrl(editor.getAttributes("link").href || "");
                setShowLinkPicker(!showLinkPicker);
              }}
              className={`toolbar-btn ${editor.isActive("link") ? "active" : ""}`}
              title="Insert Link"
            >
              <LinkIcon size={18} />
            </button>
            {showLinkPicker && (
              <div className="link-picker-popup">
                <input
                  type="text"
                  placeholder="Paste or type link..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const absoluteUrl = ensureAbsoluteUrl(linkUrl);
                      if (absoluteUrl) {
                        editor.chain().focus().setLink({ href: absoluteUrl }).run();
                      } else {
                        editor.chain().focus().unsetLink().run();
                      }
                      setShowLinkPicker(false);
                    }
                  }}
                  autoFocus
                  className="link-input"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bubble Menu for Selections - Only show for text, not images/stickers */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor, from, to }) => {
          // Don't show for images or stickers
          if (editor.isActive("resizableImage") || editor.isActive("sticker")) return false;
          // Only show if there's a selection
          return from !== to;
        }}
      >
        <div className="bubble-menu">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "is-active" : ""}>Bold</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "is-active" : ""}>Italic</button>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              type="button"
              onClick={() => {
                setLinkUrl(editor.getAttributes("link").href || "");
                setShowLinkPicker(!showLinkPicker);
              }}
              className={editor.isActive("link") ? "is-active" : ""}
            >
              Link
            </button>
            {showLinkPicker && (
              <div className="link-picker-popup" style={{ transform: "translateX(-50%)", bottom: "100%", top: "auto", marginBottom: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Paste or type link..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const absoluteUrl = ensureAbsoluteUrl(linkUrl);
                      if (absoluteUrl) {
                        editor.chain().focus().setLink({ href: absoluteUrl }).run();
                      } else {
                        editor.chain().focus().unsetLink().run();
                      }
                      setShowLinkPicker(false);
                    }
                  }}
                  autoFocus
                  className="link-input"
                />
              </div>
            )}
          </div>
        </div>
      </BubbleMenu>

      {/* Canvas Area (Matches Post Page) */}
      <div className="editor-canvas-wrapper">
        <div className="editor-post-header">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="editor-title-input"
            placeholder="Enter your headline..."
          />
        </div>

        {/* Cover Image Placeholder */}
        <div
          onClick={onCoverImageClick}
          className="editor-cover-placeholder"
          style={{
            backgroundImage: coverImage ? `url(${coverImage})` : "none",
            height: coverImage ? "400px" : "120px"
          }}
        >
          {!coverImage && (
            <div className="placeholder-content">
              <ImageIcon size={32} />
              <span>Click to upload cover photo</span>
            </div>
          )}
        </div>

        <div className="editor-content-area">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .image-resizer-wrapper:hover .image-alignment-toolbar {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .image-alignment-toolbar {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          padding: 4px;
          border-radius: 8px;
          display: flex;
          gap: 4px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s;
          z-index: 50;
        }
        .image-alignment-toolbar button {
          background: transparent;
          border: none;
          color: white;
          padding: 4px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-alignment-toolbar button:hover, .image-alignment-toolbar button.active {
          background: rgba(255,255,255,0.2);
        }

        .sticker-wrapper:hover .sticker-toolbar {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .sticker-toolbar {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-5px);
          background: rgba(0,0,0,0.8);
          padding: 4px;
          border-radius: 8px;
          display: flex;
          gap: 4px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s;
          z-index: 50;
        }
        .sticker-toolbar button {
          background: transparent;
          border: none;
          color: white;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
          line-height: 1;
        }
        .sticker-toolbar button:hover {
          background: rgba(255,255,255,0.2);
        }

        .direct-editor-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          background: var(--bg-primary);
        }
        .editor-sticky-toolbar {
          position: sticky;
          top: 80px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 100px;
          box-shadow: var(--shadow-lg);
          margin-bottom: 2rem;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          transition: all 0.3s ease;
        }

        @media (max-width: 640px) {
          .editor-sticky-toolbar {
            top: 60px;
            padding: 0.375rem;
            border-radius: 12px;
            width: 100%;
            overflow-x: auto;
            justify-content: flex-start;
            gap: 0.125rem;
          }
          .toolbar-btn {
            width: 28px !important;
            height: 28px !important;
          }
          .toolbar-divider {
             height: 16px !important;
          }
        }

        .toolbar-group {
          display: flex;
          gap: 0.125rem;
        }
        .toolbar-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .toolbar-btn.active {
          background: var(--accent-soft);
          color: var(--accent);
        }
        .toolbar-divider {
          width: 1px;
          height: 20px;
          background: var(--border-color);
          margin: 0 0.25rem;
        }
        .color-picker-popup {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: var(--radius-md);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: 0.5rem;
          box-shadow: var(--shadow-md);
        }
        .sticker-picker-popup {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: var(--radius-md);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.25rem;
          margin-top: 0.5rem;
          box-shadow: var(--shadow-md);
          z-index: 100;
        }
        .sticker-option {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1.25rem;
          transition: background 0.2s;
        }
        .sticker-option:hover {
          background: var(--bg-hover);
        }
        .link-picker-popup {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: var(--radius-md);
          margin-top: 0.5rem;
          box-shadow: var(--shadow-md);
          z-index: 100;
          min-width: 250px;
        }
        .link-input {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          outline: none;
          font-size: 0.8125rem;
        }
        .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
        .editor-canvas-wrapper {
          padding: 2rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
        }

        @media (max-width: 640px) {
          .editor-canvas-wrapper {
            padding: 1rem;
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          .editor-title-input {
            font-size: 1.75rem !important;
            margin-bottom: 1rem !important;
          }
          .editor-cover-placeholder {
            height: 160px !important;
          }
        }

        .editor-title-input {
          width: 100%;
          border: none;
          background: transparent;
          font-family: var(--font-heading);
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          outline: none;
        }
        .editor-title-input::placeholder {
          color: var(--border-color);
        }
        .editor-cover-placeholder {
          width: 100%;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-size: cover;
          background-position: center;
          margin-bottom: 2rem;
          transition: all 0.2s;
        }
        .editor-cover-placeholder:hover {
          opacity: 0.8;
        }
        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-tertiary);
        }
        .direct-preview-canvas {
          font-family: var(--font-body);
          font-size: 1.125rem;
          line-height: 1.8;
        }
        .bubble-menu {
          display: flex;
          background-color: #0d0d0d;
          padding: 0.2rem;
          border-radius: 0.5rem;
        }
        .bubble-menu button {
          border: none;
          background: none;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0 0.5rem;
          opacity: 0.7;
          cursor: pointer;
        }
        .bubble-menu button:hover, .bubble-menu button.is-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
