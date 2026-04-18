"use client";

export function PretextArticle({ content, columnCount = 2 }: { content: string, columnCount?: number }) {
  // Trim and handle potentially nested HTML from Tiptap
  const cleanContent = content.trim();

  return (
    <div 
      className="rich-text-content"
      style={{
        columnCount: columnCount,
        columnGap: "2.5rem",
        columnRule: "1px solid var(--border-light)",
        fontFamily: "var(--font-body)",
        fontSize: "1.0625rem",
        lineHeight: 1.6,
        color: "var(--text-secondary)",
        minHeight: "100px",
        width: "100%",
        textAlign: "left",
        wordBreak: "break-word",
        hyphens: "auto"
      }}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
}
