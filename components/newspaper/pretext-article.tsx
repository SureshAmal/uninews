"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { prepareRichInline, materializeRichInlineLineRange } from "@chenglou/pretext/rich-inline";

interface PretextArticleProps {
  content: string;
  columnCount?: number;
}

// Registry to store rich-inline item metadata for rendering
interface ItemMetadata {
  isLink?: boolean;
  href?: string;
  isPill?: boolean;
  isSticker?: boolean;
  isInlineImage?: boolean;
  src?: string;
  width?: string;
  color?: string;
  background?: string;
  fontWeight?: string;
  textDecoration?: string;
}

// ─── Block Splitter ────────────────────────────────────────────────────
// Pretext's prepareRichInline is an inline-only, white-space:normal engine.
// It collapses ALL whitespace including \n. So we split the HTML into
// block-level segments (paragraphs, headings) and run each through
// prepareRichInline independently, stacking them with paragraph gap spacing.
// ───────────────────────────────────────────────────────────────────────

function parseInlineContent(
  blockEl: Node,
  metadataMap: Record<number, ItemMetadata>,
  itemsOffset: number,
  obstacles: any[]
) {
  const items: any[] = [];

  const walk = (node: Node, currentFont: string = "400 17px Georgia", extraMeta: ItemMetadata = {}) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (text) {
          metadataMap[itemsOffset + items.length] = { ...extraMeta };
          items.push({
            text,
            font: currentFont,
            ...(extraMeta.isPill ? { break: "never" as const, extraWidth: 16 } : {})
          });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        let nextFont = currentFont;
        let nextMeta = { ...extraMeta };

        if (el.tagName === "STRONG" || el.tagName === "B") nextFont = nextFont.replace("400", "700");
        if (el.tagName === "EM" || el.tagName === "I") nextFont += " italic";
        if (el.tagName === "H1") nextFont = nextFont.replace("17px", "32px").replace("400", "700");
        if (el.tagName === "H2") nextFont = nextFont.replace("17px", "24px").replace("400", "700");
        if (el.tagName === "H3") nextFont = nextFont.replace("17px", "20px").replace("400", "700");

        if (el.style && el.style.color) {
          nextMeta.color = el.style.color;
        } else if (el.hasAttribute("color")) {
          nextMeta.color = el.getAttribute("color") || undefined;
        }

        if (el.style && el.style.backgroundColor) {
          nextMeta.background = el.style.backgroundColor;
        }

        if (el.tagName === "A") {
          nextMeta.isLink = true;
          nextMeta.href = el.getAttribute("href") || "";
          nextMeta.color = "var(--accent-text)";
          nextMeta.textDecoration = "underline";
        }

        if (el.classList.contains("badge") || el.hasAttribute("data-pill") || el.tagName === "MARK") {
          nextMeta.isPill = true;
          nextMeta.background = "var(--accent-soft)";
          nextMeta.color = "var(--accent-text)";
          nextMeta.fontWeight = "600";
        }

        // Handle images
        if (el.tagName === "IMG") {
          const align = el.getAttribute("data-align") || el.getAttribute("align") || "left";
          const widthStr = el.getAttribute("data-width") || el.getAttribute("width") || "300px";
          const width = parseInt(widthStr) || 300;
          const src = el.getAttribute("src") || "";

          if (align === "inline") {
            const cappedWidth = Math.min(width, 48);
            metadataMap[itemsOffset + items.length] = { isInlineImage: true, src, width: String(cappedWidth), fontWeight: "400" };
            items.push({
              text: "\uFFFC",
              font: "400 17px Georgia",
              break: "never" as const,
              extraWidth: cappedWidth
            });
          } else {
            metadataMap[itemsOffset + items.length] = {};
            obstacles.push({ src, align, width: String(width), node: el, itemIndex: itemsOffset + items.length });
            items.push({ text: "\u200B", font: currentFont, extraWidth: 0 });
          }
        } else if (el.classList.contains("sticker-wrapper") || el.hasAttribute("data-sticker")) {
          const stickerText = el.getAttribute("name") || el.textContent?.trim() || el.querySelector("img")?.alt || "✨";
          metadataMap[itemsOffset + items.length] = { isSticker: true, fontWeight: "400" };
          items.push({
            text: stickerText,
            font: "400 24px Apple Color Emoji, system-ui",
            break: "never" as const,
            extraWidth: 8
          });
        } else if (el.tagName === "BR") {
          // BR inside a block — skip, handled by block splitter
        } else {
          walk(child, nextFont, nextMeta);
        }
      }
    });
  };

  walk(blockEl);
  return items;
}

interface ParsedBlock {
  items: any[];
  itemsOffset: number;
  gapBefore: number; // vertical gap in px before this block
}

const BLOCK_TAGS = new Set(["P", "H1", "H2", "H3", "DIV", "BLOCKQUOTE", "UL", "OL", "LI", "PRE"]);

function parseTipTapToBlocks(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: ParsedBlock[] = [];
  const metadataMap: Record<number, ItemMetadata> = {};
  const obstacles: any[] = [];
  let globalItemOffset = 0;

  const bodyChildren = doc.body.childNodes;
  for (let i = 0; i < bodyChildren.length; i++) {
    const child = bodyChildren[i];

    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;

      if (BLOCK_TAGS.has(el.tagName)) {
        let gapBefore = 14; // default paragraph gap
        if (el.tagName === "H1") gapBefore = 24;
        else if (el.tagName === "H2") gapBefore = 20;
        else if (el.tagName === "H3") gapBefore = 16;

        // Check for empty paragraph (user pressed Enter for a blank line)
        const isEmpty = !el.textContent?.trim() && !el.querySelector("img");
        if (isEmpty) {
          blocks.push({ items: [], itemsOffset: globalItemOffset, gapBefore });
          continue;
        }

        const blockItems = parseInlineContent(el, metadataMap, globalItemOffset, obstacles);
        if (blockItems.length > 0) {
          blocks.push({ items: blockItems, itemsOffset: globalItemOffset, gapBefore });
          globalItemOffset += blockItems.length;
        }
      } else if (el.tagName === "IMG") {
        // Top-level image (not inside a paragraph)
        const align = el.getAttribute("data-align") || el.getAttribute("align") || "center";
        const widthStr = el.getAttribute("data-width") || el.getAttribute("width") || "300px";
        const width = parseInt(widthStr) || 300;
        const src = el.getAttribute("src") || "";
        metadataMap[globalItemOffset] = {};
        obstacles.push({ src, align, width: String(width), node: el, itemIndex: globalItemOffset });
        blocks.push({
          items: [{ text: "\u200B", font: "400 17px Georgia", extraWidth: 0 }],
          itemsOffset: globalItemOffset,
          gapBefore: 14
        });
        globalItemOffset += 1;
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) {
        metadataMap[globalItemOffset] = {};
        blocks.push({
          items: [{ text, font: "400 17px Georgia" }],
          itemsOffset: globalItemOffset,
          gapBefore: 14
        });
        globalItemOffset += 1;
      }
    }
  }

  // Build flat items array for rendering metadata lookups
  const allItems: any[] = [];
  for (const block of blocks) {
    allItems.push(...block.items);
  }

  return { blocks, metadataMap, obstacles, allItems };
}


// ─── Layout Engine ─────────────────────────────────────────────────────
// Each block gets its own prepareRichInline handle. Blocks are stacked
// vertically with paragraph gap spacing. Multi-column flow, obstacle
// avoidance, and all rendering metadata work exactly as before.
// ───────────────────────────────────────────────────────────────────────

export function computePretextLayout(content: string, containerWidth: number, columnCount: number) {
  if (!containerWidth || typeof window === 'undefined') return null;

  const { blocks, metadataMap, obstacles, allItems } = parseTipTapToBlocks(content);

  const COLUMN_GAP = 40;
  let actualColumnCount = columnCount;
  let colWidth = (containerWidth - (COLUMN_GAP * (actualColumnCount - 1))) / actualColumnCount;
  const LINE_HEIGHT = 28;

  const { layoutNextRichInlineLineRange } = require("@chenglou/pretext/rich-inline");

  const getLineHeightForRange = (range: any, blockItems: any[], blockOffset: number) => {
    let maxLineHeight = LINE_HEIGHT;
    for (const f of range.fragments) {
      const itemFont = blockItems[f.itemIndex]?.font || "400 17px Georgia";
      if (itemFont.includes("32px")) maxLineHeight = Math.max(maxLineHeight, 46);
      else if (itemFont.includes("24px")) maxLineHeight = Math.max(maxLineHeight, 36);
      else if (itemFont.includes("20px")) maxLineHeight = Math.max(maxLineHeight, 30);

      const globalIdx = blockOffset + f.itemIndex;
      const meta = metadataMap[globalIdx] || {};
      if (meta.isInlineImage) {
        maxLineHeight = Math.max(maxLineHeight, parseInt(meta.width || "48") * 0.75 + 10);
      } else if (meta.isSticker) {
        maxLineHeight = Math.max(maxLineHeight, 36);
      }
    }
    return maxLineHeight;
  };

  // Pass 1: Measure total content height across all blocks
  let totalContentHeight = 0;
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    if (bi > 0) totalContentHeight += block.gapBefore;
    if (block.items.length === 0) continue;

    const prepared = prepareRichInline(block.items);
    let tempCursor = { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 };
    while (true) {
      const r = layoutNextRichInlineLineRange(prepared, colWidth, tempCursor);
      if (!r) break;
      totalContentHeight += getLineHeightForRange(r, block.items, block.itemsOffset);
      tempCursor = r.end;
    }
  }

  // Adaptive Column Reduction
  const MIN_COL_HEIGHT = 120;
  while (actualColumnCount > 1 && totalContentHeight / actualColumnCount < MIN_COL_HEIGHT) {
    actualColumnCount--;
  }

  if (actualColumnCount !== columnCount) {
    colWidth = (containerWidth - (COLUMN_GAP * (actualColumnCount - 1))) / actualColumnCount;
  }
  const targetColHeight = Math.ceil(totalContentHeight / actualColumnCount);

  const renderedLines: any[] = [];
  let columnIndex = 0;
  let yInColumn = 0;
  let maxHeight = 0;

  let pendingObstacles = [...obstacles];
  let placedObstacles: any[] = [];

  // Pass 2: Lay out each block independently, stacking vertically
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];

    // Add paragraph gap before this block (except the first)
    if (bi > 0) {
      yInColumn += block.gapBefore;
      maxHeight = Math.max(maxHeight, yInColumn);
    }

    // Empty block = just the gap, no text to lay out
    if (block.items.length === 0) continue;

    const prepared = prepareRichInline(block.items);
    let currentCursor = { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 };

    while (true) {
      const colX = columnIndex * (colWidth + COLUMN_GAP);

      // Place obstacles
      while (pendingObstacles.length > 0 && block.itemsOffset + currentCursor.itemIndex >= pendingObstacles[0].itemIndex) {
        const obs = pendingObstacles.shift()!;
        let obsX = colX;
        if (obs.align === "right") obsX = colX + colWidth - parseInt(obs.width);
        if (obs.align === "center") obsX = colX + (colWidth - parseInt(obs.width)) / 2;

        const prevObs = placedObstacles[placedObstacles.length - 1];
        let placedY = yInColumn;
        if (prevObs && prevObs.column === columnIndex && yInColumn < prevObs.y + prevObs.height) {
          placedY = prevObs.y + prevObs.height + 20;
        }

        placedObstacles.push({
          ...obs,
          x: obsX,
          y: placedY,
          height: parseInt(obs.width) * 0.75,
          column: columnIndex
        });
      }

      let availableWidth = colWidth;
      let xOffset = 0;

      const activeObs = placedObstacles.filter(o =>
        o.column === columnIndex && yInColumn >= o.y && yInColumn < o.y + o.height
      );

      if (activeObs.length > 0) {
        const obs = activeObs[0];
        if (obs.align === "center") {
          availableWidth = 0;
        } else {
          availableWidth = Math.max(0, colWidth - parseInt(obs.width) - 20);
          if (obs.align === "left") xOffset = parseInt(obs.width) + 20;
        }
      }

      const rangeResult = layoutNextRichInlineLineRange(prepared, availableWidth || colWidth, currentCursor);
      if (!rangeResult) break;

      const line = materializeRichInlineLineRange(prepared, rangeResult);
      const maxLineHeight = getLineHeightForRange(rangeResult, block.items, block.itemsOffset);

      // Remap fragment itemIndex to global offset for rendering metadata lookups
      const remappedFragments = line.fragments.map((f: any) => ({
        ...f,
        itemIndex: block.itemsOffset + f.itemIndex,
      }));

      renderedLines.push({
        fragments: remappedFragments,
        x: colX + (availableWidth === 0 ? 0 : xOffset),
        y: yInColumn,
        width: line.width,
        height: maxLineHeight,
        column: columnIndex,
        isHidden: availableWidth === 0
      });

      currentCursor = rangeResult.end;
      yInColumn += maxLineHeight;
      maxHeight = Math.max(maxHeight, yInColumn);
      if (activeObs.length > 0) { maxHeight = Math.max(maxHeight, activeObs[0].y + activeObs[0].height); }

      if (actualColumnCount > 1 && yInColumn >= targetColHeight && columnIndex < actualColumnCount - 1) {
        columnIndex++;
        yInColumn = 0;
      }
    }
  }

  // Ensure maxHeight accounts for obstacles
  placedObstacles.forEach(obs => {
    if (obs.column === columnIndex) {
      maxHeight = Math.max(maxHeight, obs.y + obs.height + 40);
    } else {
      maxHeight = Math.max(maxHeight, targetColHeight);
    }
  });

  return { renderedLines, colWidth, placedObstacles, maxHeight, metadataMap, items: allItems, COLUMN_GAP, actualColumnCount };
}

export function PretextArticle({ content, columnCount = 2 }: PretextArticleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const layoutData = useMemo(() => computePretextLayout(content, containerWidth, columnCount), [content, containerWidth, columnCount]);

  return (
    <div
      ref={containerRef}
      className="pretext-article-root"
      style={{
        height: layoutData ? `${layoutData.maxHeight}px` : "auto",
      } as React.CSSProperties}
    >
      {layoutData && layoutData.actualColumnCount > 1 && Array.from({ length: layoutData.actualColumnCount - 1 }).map((_, i) => {
        const dividerX = Math.round((i + 1) * (layoutData.colWidth + layoutData.COLUMN_GAP) - layoutData.COLUMN_GAP / 2);
        return (
          <div
            key={`divider-${i}`}
            className="pretext-column-divider"
            style={{ "--x": `${dividerX}px` } as React.CSSProperties}
          />
        );
      })}

      {layoutData && layoutData.placedObstacles.map((obs: any, i: number) => (
        <div
          key={`obs-${i}`}
          className="pretext-obstacle"
          style={{
            "--x": `${obs.x}px`,
            "--y": `${obs.y}px`,
            "--w": `${obs.width}px`,
            "--h": `${obs.height}px`,
          } as React.CSSProperties}
        >
          <img src={obs.src} className="pretext-obstacle-img" alt="Illustration" />
        </div>
      ))}

      {layoutData && layoutData.renderedLines.map((line: any, i: number) => (
        <div
          key={i}
          className="pretext-line"
          style={{
            "--x": `${line.x}px`,
            "--y": `${line.y}px`,
            "--w": `${line.width + 20}px`,
            "--h": `${line.height}px`,
            visibility: line.isHidden ? "hidden" : "visible",
          } as React.CSSProperties}
        >
          {line.fragments.map((f: any, fi: number) => {
            const meta = layoutData.metadataMap[f.itemIndex] || {};
            const itemFont = layoutData.items[f.itemIndex]?.font || "400 17px Georgia";

            const varStyle: any = {
              "--gap": `${f.gapBefore}px`,
            };

            // Font & Visual metadata to CSS variables
            if (meta.color) varStyle["--f-color"] = meta.color;
            if (meta.background) varStyle["--f-bg"] = meta.background;
            if (meta.textDecoration) varStyle["--f-decor"] = meta.textDecoration;

            const fontParts = itemFont.split(" ");
            if (fontParts.length >= 3) {
              varStyle["--f-weight"] = meta.fontWeight || fontParts[0];
              varStyle["--f-size"] = meta.isPill ? "14px" : fontParts[1];
              varStyle["--f-family"] = fontParts.slice(2).join(" ");
            }

            if (meta.isInlineImage) {
              return (
                <span
                  key={fi}
                  className="pretext-fragment-img-wrapper"
                  style={{ ...varStyle, "--w": `${meta.width}px` } as React.CSSProperties}
                >
                  <img src={meta.src} className="pretext-fragment-img" alt="Inline" />
                </span>
              );
            }

            const fragmentClass = `pretext-fragment ${meta.isPill ? "pretext-pill" : ""}`;

            if (meta.isLink) {
              return (
                <a
                  key={fi}
                  href={meta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={fragmentClass}
                  style={varStyle as React.CSSProperties}
                  onClick={(e) => e.stopPropagation()}
                >
                  {f.text}
                </a>
              );
            }

            return (
              <span key={fi} className={fragmentClass} style={varStyle as React.CSSProperties}>
                {f.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
