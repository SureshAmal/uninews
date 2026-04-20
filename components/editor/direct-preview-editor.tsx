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
  Loader2,
  Maximize2
} from "lucide-react";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
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

    const localUrl = URL.createObjectURL(file);
    const uploadId = `upload-${Date.now()}`;

    // Insert placeholder immediately with loading state
    editor?.chain().focus().insertContent({
      type: "resizableImage",
      attrs: { src: localUrl, id: uploadId, isLoading: true }
    }).run();

    startUpload(async () => {
      try {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadFile(formData);
        
        if (result.url) {
          // Replace placeholder with final image URL
          editor?.commands.command(({ tr }) => {
            let posToUpdate: number | null = null;
            let nodeAttrs: Record<string, any> | null = null;
            
            editor.state.doc.descendants((node, pos) => {
              if (node.type.name === 'resizableImage' && node.attrs.id === uploadId) {
                posToUpdate = pos;
                nodeAttrs = node.attrs;
              }
            });

            if (posToUpdate !== null && nodeAttrs) {
              tr.setNodeMarkup(posToUpdate, null, {
                ...(nodeAttrs as any),
                src: result.url,
                isLoading: false,
                id: null
              });
            }
            return true;
          });
        } else {
          // Remove placeholder if upload fails
          editor?.commands.command(({ tr }) => {
            let posToDelete: number | null = null;
            let nodeSize = 0;
            
            editor.state.doc.descendants((node, pos) => {
              if (node.type.name === 'resizableImage' && node.attrs.id === uploadId) {
                posToDelete = pos;
                nodeSize = node.nodeSize;
              }
            });
            
            if (posToDelete !== null) {
              tr.delete(posToDelete, posToDelete + nodeSize);
            }
            return true;
          });
          toast.error("Upload failed", result.error || "Could not upload image");
        }
      } catch (err) {
        editor?.commands.command(({ tr }) => {
          let posToDelete: number | null = null;
          let nodeSize = 0;
          
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'resizableImage' && node.attrs.id === uploadId) {
              posToDelete = pos;
              nodeSize = node.nodeSize;
            }
          });
          
          if (posToDelete !== null) {
            tr.delete(posToDelete, posToDelete + nodeSize);
          }
          return true;
        });
        toast.error("Upload failed", "File may be too large or server errored.");
      } finally {
        URL.revokeObjectURL(localUrl);
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
        class: "prose-newspaper direct-preview-canvas outline-none min-h-[500px]",
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
      {/* Uploading Indicator Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-bg-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-divider rounded-full px-5 py-3 flex items-center gap-3 font-medium min-w-[200px] justify-center"
          >
            <Loader2 className="animate-spin text-accent" size={20} />
            Uploading image...
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="color-picker-popup z-10">
              {COLORS.map((c) => (
                <button type="button"
                  key={c.name}
                  onClick={() => {
                    if (c.color === "inherit") editor.chain().focus().unsetColor().run();
                    else editor.chain().focus().setColor(c.color).run();
                    setShowColorPicker(false);
                  }}
                  className={`color-swatch ${c.color === "inherit" ? "color-swatch-border" : ""}`}
                  style={{ backgroundColor: c.color.startsWith("var") ? `var(--text-primary)` : c.color }}
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
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <div className="relative">
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
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button"
            onClick={() => editor.chain().focus().toggleMark("pill").run()}
            className={`toolbar-btn ${editor.isActive("pill") ? "active" : ""}`}
            title="Pill text"
          >
            <div className="pill-text-trigger">PILL</div>
          </button>
        </div>
      </div>

      {/* Bubble Menu for Selections - Only show for text, not images/stickers */}
      <BubbleMenu
        editor={editor}
        // @ts-expect-error - tippyOptions is passed to the underlying tippy.js instance
        tippyOptions={{ duration: 100, zIndex: 9999, offset: [0, 8] }}
        shouldShow={({ editor, from, to }) => {
          // Don't show for images or stickers
          if (editor.isActive("resizableImage") || editor.isActive("sticker")) return false;
          // Only show if there's a selection
          return from !== to;
        }}
      >
        <div className="bubble-menu">
          {!showLinkPicker ? (
            <>
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "is-active" : ""}>
                <Bold size={18} />
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "is-active" : ""}>
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkUrl(editor.getAttributes("link").href || "");
                  setShowLinkPicker(true);
                }}
                className={editor.isActive("link") ? "is-active" : ""}
              >
                <LinkIcon size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-1">
              <input
                type="text"
                placeholder="Paste or type link..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    const absoluteUrl = ensureAbsoluteUrl(linkUrl);
                    if (absoluteUrl) {
                      editor.chain().focus().setLink({ href: absoluteUrl }).run();
                    } else {
                      editor.chain().focus().unsetLink().run();
                    }
                    setShowLinkPicker(false);
                  } else if (e.key === "Escape") {
                    setShowLinkPicker(false);
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="link-input"
                style={{ width: "200px", minWidth: "150px" }}
              />
              <button
                type="button"
                onClick={() => setShowLinkPicker(false)}
                className="text-tertiary flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          )}
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
          className={`editor-cover-placeholder ${coverImage ? "editor-cover-placeholder-filled" : "editor-cover-placeholder-empty"}`}
          style={{ backgroundImage: coverImage ? `url(${coverImage})` : "none" }}
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
    </div>
  );
}
