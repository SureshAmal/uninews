import { Mark, mergeAttributes } from "@tiptap/core";

export const Pill = Mark.create({
  name: "pill",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "badge",
        "data-pill": "true",
        style: "background: var(--accent-soft); color: var(--accent); padding: 2px 8px; border-radius: 100px; font-weight: 600; font-size: 0.85em;"
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-pill]",
      },
      {
        tag: "span.badge",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
