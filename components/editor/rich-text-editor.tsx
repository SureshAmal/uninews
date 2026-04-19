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
    className={`p-2 border-none rounded-sm cursor-pointer flex items-center justify-center transition-all duration-200 ${
      isActive ? "bg-accent-soft text-accent" : "bg-transparent text-secondary hover:bg-bg-hover"
    }`}
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
        class: "prose-newspaper text-editor-content outline-none min-h-[300px] font-body text-[1.125rem] leading-[1.8] text-primary",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-divider rounded-md overflow-hidden bg-secondary">
      <div className="flex flex-wrap gap-1 p-2 border-bottom border-divider bg-bg-tertiary">
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
        <div className="w-[1px] bg-divider mx-1 self-stretch" />
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
        <div className="w-[1px] bg-divider mx-1 self-stretch" />
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
        <div className="ml-auto flex gap-1">
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
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
