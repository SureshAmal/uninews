import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, Maximize2, Type, Trash2 } from "lucide-react";

export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: { default: "300px" },
      height: { default: "auto" },
      align: { default: "inline" }, // left, center, right, inline
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes.align || "inline";
    const width = HTMLAttributes.width || "300px";
    
    let style = "";
    if (align === 'inline') {
      style = `width: ${width}; max-width: 100%; height: auto; border-radius: 12px; display: inline-block; vertical-align: middle; margin: 0 0.5rem;`;
    } else {
      style = `width: ${width}; max-width: 100%; height: auto; border-radius: 12px; float: ${align === 'center' ? 'none' : align}; display: ${align === 'center' ? 'block' : 'inline-block'}; margin: ${align === 'center' ? '2rem auto' : align === 'left' ? '0.5rem 2rem 1rem 0' : '0.5rem 0 1rem 2rem'};`;
    }
    
    return ["img", mergeAttributes(HTMLAttributes, { style, "data-align": align, "data-width": width })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes, deleteNode, editor }) => {
      const { src, width, align } = node.attrs;

      const handleResize = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        const startX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        const startWidth = parseInt(String(width)) || 400;
        
        // Get container width
        const containerWidth = editor?.view.dom.clientWidth || 800;

        const onMove = (moveEvent: MouseEvent | TouchEvent) => {
          const currentX = 'touches' in moveEvent ? moveEvent.touches[0].pageX : (moveEvent as MouseEvent).pageX;
          let currentWidth = startWidth + (currentX - startX);
          
          // Constrain within [100px, containerWidth]
          currentWidth = Math.min(containerWidth, Math.max(100, currentWidth));
          
          updateAttributes({ width: `${currentWidth}px` });
        };

        const onEnd = () => {
          document.removeEventListener("mousemove", onMove as any);
          document.removeEventListener("mouseup", onEnd);
          document.removeEventListener("touchmove", onMove as any);
          document.removeEventListener("touchend", onEnd);
        };

        document.addEventListener("mousemove", onMove as any);
        document.addEventListener("mouseup", onEnd);
        document.addEventListener("touchmove", onMove as any, { passive: false });
        document.addEventListener("touchend", onEnd);
      };

      return (
        <NodeViewWrapper
          className={`image-resizer-wrapper align-${align}`}
          contentEditable={false}
          draggable="true"
          data-drag-handle=""
          style={
            align === "inline"
              ? { display: "inline-block", verticalAlign: "middle", margin: "0 0.5rem", position: "relative", zIndex: 1 }
              : {
                  display: align === "center" ? "flex" : "block",
                  verticalAlign: "top",
                  float: align === "center" ? "none" : align,
                  margin: align === "center" ? "2rem auto" : align === "left" ? "0.5rem 2rem 1rem 0" : "0.5rem 0 1rem 2rem",
                  width: align === "center" ? "100%" : "auto",
                  maxWidth: "100%",
                  position: "relative",
                  zIndex: 1
                }
          }
        >
          <div style={{ position: "relative", width: width, maxWidth: "100%" }}>
            <img
              src={src}
              style={{ width: "100%", height: "auto", borderRadius: "12px", display: "block" }}
              alt=""
            />

            {/* Resize Handles */}
            <div
              onMouseDown={handleResize}
              onTouchStart={handleResize}
              className="resize-handle"
              style={{
                position: "absolute",
                bottom: -10, // Larger hit area
                right: -10,  // Larger hit area
                width: 44,   // 44px is standard touch target
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "nwse-resize",
                zIndex: 10,
                background: "transparent"
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                background: "white",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Maximize2 size={12} color="#1a1a1a" />
              </div>
            </div>

            {/* Alignment Toolbar (Overlay) */}
            <div className="image-alignment-toolbar">
              <button type="button" title="Align Left" onClick={() => updateAttributes({ align: "left" })} className={align === "left" ? "active" : ""}><AlignLeft size={14} /></button>
              <button type="button" title="Align Center" onClick={() => updateAttributes({ align: "center" })} className={align === "center" ? "active" : ""}><AlignCenter size={14} /></button>
              <button type="button" title="Align Right" onClick={() => updateAttributes({ align: "right" })} className={align === "right" ? "active" : ""}><AlignRight size={14} /></button>
              <button type="button" title="Inline" onClick={() => updateAttributes({ align: "inline" })} className={align === "inline" ? "active" : ""}><Type size={14} /></button>
              
              <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
              
              <button 
                type="button" 
                title="Delete Image" 
                onClick={() => deleteNode()}
                style={{ color: "#ff4d4d" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </NodeViewWrapper>
      );
    });
  },
});
