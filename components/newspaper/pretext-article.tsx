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

function parseTipTapToRichInline(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: any[] = [];
  const metadataMap: Record<number, ItemMetadata> = {};
  const obstacles: { src: string, align: string, width: string, node: HTMLElement }[] = [];

  const walk = (node: Node, currentFont: string = "400 17px Georgia", extraMeta: ItemMetadata = {}) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (text) {
          metadataMap[items.length] = { ...extraMeta };
          items.push({ 
            text: text, 
            font: currentFont,
            ...(extraMeta.isPill ? { break: "never", extraWidth: 16 } : {})
          });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        let nextFont = currentFont;
        let nextMeta = { ...extraMeta };

        if (el.tagName === "STRONG" || el.tagName === "B") nextFont = nextFont.replace("400", "700");
        if (el.tagName === "EM" || el.tagName === "I") nextFont += " italic";
        
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
            nextMeta.background = "var(--accent-soft)"; // Match editor
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
             metadataMap[items.length] = { isInlineImage: true, src, width: String(width), fontWeight: "400" };
             items.push({ 
               text: "\uFFFC", // Object Replacement Character (prevents collapse, behaves as non-breaking)
               font: "400 17px Georgia",
               break: "never", 
               extraWidth: width 
             });
          } else {
             metadataMap[items.length] = {};
             obstacles.push({ src, align, width: String(width), node: el, itemIndex: items.length });
             items.push({ text: "\u200B", font: currentFont, extraWidth: 0 });
          }
        } else if (el.classList.contains("sticker-wrapper") || el.hasAttribute("data-sticker")) {
          const stickerText = el.getAttribute("name") || el.textContent?.trim() || el.querySelector("img")?.alt || "✨";
          metadataMap[items.length] = { isSticker: true, fontWeight: "400" };
          items.push({ 
            text: stickerText, 
            font: "400 24px Apple Color Emoji, system-ui", 
            break: "never", 
            extraWidth: 8 
          });
        } else {
          walk(child, nextFont, nextMeta);
        }

        if (el.tagName === "P" || el.tagName === "H1" || el.tagName === "H2" || el.tagName === "H3") {
            metadataMap[items.length] = {};
            items.push({ text: "\n", font: currentFont });
        }
      }
    });
  };

  walk(doc.body);
  return { items, metadataMap, obstacles };
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

  const layoutData = useMemo(() => {
    if (!containerWidth) return null;

    const { items, metadataMap, obstacles } = parseTipTapToRichInline(content);
    const prepared = prepareRichInline(items);

    const COLUMN_GAP = 40;
    const colWidth = (containerWidth - (COLUMN_GAP * (columnCount - 1))) / columnCount;
    const LINE_HEIGHT = 28;

    const { layoutNextRichInlineLineRange } = require("@chenglou/pretext/rich-inline");
    
    // Pass 1: Measure total lines
    let totalLineCount = 0;
    let tempCursor = { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 };
    while (true) {
        const r = layoutNextRichInlineLineRange(prepared, colWidth, tempCursor);
        if (!r) break;
        tempCursor = r.end;
        totalLineCount++;
    }

    const linesPerColumn = Math.ceil(totalLineCount / columnCount);
    const targetColHeight = Math.max(1, linesPerColumn) * LINE_HEIGHT;
    
    const renderedLines: any[] = [];
    let currentCursor = { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 };
    let columnIndex = 0;
    let yInColumn = 0;
    let maxHeight = 0;

    let pendingObstacles = [...obstacles];
    let placedObstacles: any[] = [];

    while (true) {
        const colX = columnIndex * (colWidth + COLUMN_GAP);
        
        // Place obstacles
        while (pendingObstacles.length > 0 && currentCursor.itemIndex >= pendingObstacles[0].itemIndex) {
            const obs = pendingObstacles.shift()!;
            let obsX = colX;
            if (obs.align === "right") obsX = colX + colWidth - parseInt(obs.width);
            if (obs.align === "center") obsX = colX + (colWidth - parseInt(obs.width)) / 2;

            // Simple handling of consecutive images by adding arbitrary spacing
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
        
        let maxLineHeight = LINE_HEIGHT;
        for (const f of line.fragments) {
            const meta = metadataMap[f.itemIndex] || {};
            if (meta.isInlineImage) {
                // assume 4:3 ratio + 10px padding for inline images
                maxLineHeight = Math.max(maxLineHeight, parseInt(meta.width || "300") * 0.75 + 10);
            } else if (meta.isSticker) {
                maxLineHeight = Math.max(maxLineHeight, 36);
            }
        }

        renderedLines.push({
            fragments: line.fragments,
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

        if (columnCount > 1 && yInColumn >= targetColHeight && columnIndex < columnCount - 1) {
            columnIndex++;
            yInColumn = 0;
        }
    }

    // Ensure maxHeight accounts for any obstacles that extend beyond the text
    placedObstacles.forEach(obs => {
        if (obs.column === columnIndex) {
            maxHeight = Math.max(maxHeight, obs.y + obs.height + 40); // +40 for bottom padding
        } else {
            maxHeight = Math.max(maxHeight, targetColHeight); // At least fill the column if there are items there
        }
    });

    return { renderedLines, colWidth, placedObstacles, maxHeight, metadataMap };
  }, [content, containerWidth, columnCount]);

  return (
    <div
      ref={containerRef}
      className="pretext-article-container"
      style={{
        width: "100%",
        height: layoutData ? `${layoutData.maxHeight}px` : "auto",
        position: "relative",
        fontFamily: "var(--font-body)",
        lineHeight: 1.6,
        overflow: "hidden"
      }}
    >
      {layoutData && layoutData.placedObstacles.map((obs: any, i: number) => (
        <div
          key={`obs-${i}`}
          style={{
            position: "absolute",
            left: obs.x,
            top: obs.y,
            width: obs.width + "px",
            height: obs.height + "px",
            zIndex: 5,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)"
          }}
        >
          <img src={obs.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}

      {layoutData && layoutData.renderedLines.map((line: any, i: number) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: line.x,
            top: line.y,
            width: line.width + 20,
            height: line.height,
            whiteSpace: "pre",
            fontSize: "17px",
            color: "var(--text-secondary)",
            fontFamily: "Georgia, serif",
            visibility: line.isHidden ? "hidden" : "visible",
            display: "flex", // Use flex to respect gaps easily
            alignItems: line.height > 28 ? "center" : "baseline"
          }}
        >
          {line.fragments.map((f: any, fi: number) => {
            const meta = layoutData.metadataMap[f.itemIndex] || {};
            const style = { 
                font: f.font,
                color: meta.color || "inherit",
                background: meta.background || "none",
                padding: meta.isPill ? "2px 8px" : "0",
                borderRadius: meta.isPill ? "100px" : "0",
                fontWeight: meta.fontWeight || "inherit",
                textDecoration: meta.textDecoration || "none",
                marginLeft: f.gapBefore + "px", // RESTORE THE SPACING
                display: "inline-block",
                lineHeight: "1.2",
                alignSelf: "center",
                ...(meta.isPill ? { fontSize: "0.85em", transform: "translateY(-1px)" } : {})
            };

            if (meta.isInlineImage) {
                return (
                    <span key={fi} style={{...style, display: "inline-block", position: "relative", width: parseInt(meta.width || "0")}}>
                      <img src={meta.src} style={{ width: "100%", height: "auto", borderRadius: "12px", verticalAlign: "middle", display: "inline-block" }} />
                    </span>
                )
            }

            if (meta.isLink) {
                return (
                    <a 
                        key={fi} 
                        href={meta.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={style}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {f.text}
                    </a>
                );
            }

            return (
                <span key={fi} style={style}>
                    {f.text}
                </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
