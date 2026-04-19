import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

export const Sticker = Node.create({
  name: "sticker",
  group: "inline",
  inline: true,
  draggable: true,

  addAttributes() {
    return {
      name: { default: "❤️" },
      size: { default: "2rem" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-sticker]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-sticker": "" }), HTMLAttributes.name || "✨"];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes }) => {
      const { name, size } = node.attrs;

      const incrementSize = () => {
        const currentSize = parseFloat(size);
        if (currentSize < 6) updateAttributes({ size: `${currentSize + 0.5}rem` });
      };

      const decrementSize = () => {
        const currentSize = parseFloat(size);
        if (currentSize > 1) updateAttributes({ size: `${currentSize - 0.5}rem` });
      };

      return (
        <NodeViewWrapper 
          as="span" 
          className="sticker-wrapper"
          contentEditable={false}
          style={{ 
            display: "inline-flex", 
            fontSize: size, 
            verticalAlign: "middle", 
            margin: "0 0.25rem",
            cursor: "grab",
            position: "relative"
          }}
        >
          {name}
          <div className="sticker-toolbar" contentEditable={false}>
            <button type="button" onClick={decrementSize}>-</button>
            <button type="button" onClick={incrementSize}>+</button>
          </div>
        </NodeViewWrapper>
      );
    });
  },
});
