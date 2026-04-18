"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered,
  RotateCcw,
  RotateCw
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: "0.5rem",
      background: isActive ? "var(--accent-soft)" : "transparent",
      color: isActive ? "var(--accent)" : "var(--text-secondary)",
      border: "none",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    }}
  >
    {children}
  </button>
);

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-newspaper text-editor-content",
        style: "min-height: 300px; outline: none; font-family: var(--font-body); font-size: 1.125rem; line-height: 1.8; color: var(--text-primary);",
      },
    },
  });

  if (!editor) return null;

  return (
    <div 
      style={{ 
        border: "1px solid var(--border-color)", 
        borderRadius: "var(--radius-md)", 
        overflow: "hidden",
        background: "var(--bg-secondary)"
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "0.25rem", 
          padding: "0.5rem", 
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-tertiary)"
        }}
      >
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={18} />
        </MenuButton>
        <div style={{ width: 1, background: "var(--border-color)", margin: "0 0.25rem" }} />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </MenuButton>
        <div style={{ width: 1, background: "var(--border-color)", margin: "0 0.25rem" }} />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={18} />
        </MenuButton>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
          <MenuButton 
            onClick={() => editor.chain().focus().undo().run()} 
            title="Undo"
          >
            <RotateCcw size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().redo().run()} 
            title="Redo"
          >
            <RotateCw size={18} />
          </MenuButton>
        </div>
      </div>
      <div style={{ padding: "1.5rem" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
