"use client";
import { useEffect, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";

export function CodeEditor({
  code,
  preview,
  language = "javascript",
  onChange,
  onRun,
  label = "JavaScript editor",
}: {
  code: string;
  preview: string;
  language?: string;
  onChange: (code: string) => void;
  onRun?: () => void;
  label?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const latest = useRef({ code, onChange, onRun });
  useEffect(() => {
    latest.current = { code, onChange, onRun };
  }, [code, onChange, onRun]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let started = false;
    async function load() {
      if (started || cancelled) return;
      started = true;
      try {
        const [
          { EditorView, keymap },
          { EditorState },
          { HighlightStyle, syntaxHighlighting },
          { tags },
          { javascript },
          { html },
          { css },
        ] = await Promise.all([
          import("@codemirror/view"),
          import("@codemirror/state"),
          import("@codemirror/language"),
          import("@lezer/highlight"),
          import("@codemirror/lang-javascript"),
          import("@codemirror/lang-html"),
          import("@codemirror/lang-css"),
        ]);
        if (cancelled || !mount.current) return;
        const style = HighlightStyle.define([
          { tag: [tags.keyword, tags.modifier], color: "var(--code-keyword)" },
          { tag: tags.string, color: "var(--code-string)" },
          {
            tag: [tags.number, tags.bool, tags.null],
            color: "var(--code-number)",
          },
          {
            tag: [
              tags.function(tags.variableName),
              tags.function(tags.propertyName),
            ],
            color: "var(--code-function)",
          },
          { tag: tags.comment, color: "var(--code-comment)" },
          {
            tag: [
              tags.variableName,
              tags.propertyName,
              tags.tagName,
              tags.attributeName,
            ],
            color: "var(--code-variable)",
          },
        ]);
        view.current = new EditorView({
          parent: mount.current,
          state: EditorState.create({
            doc: latest.current.code,
            extensions: [
              language === "html"
                ? html()
                : language === "css"
                  ? css()
                  : javascript({ typescript: language === "typescript" }),
              syntaxHighlighting(style),
              EditorView.contentAttributes.of({
                "aria-label": label,
                spellcheck: "false",
              }),
              EditorView.theme({
                "&": { background: "var(--code-bg)", color: "var(--code-fg)" },
                ".cm-content": {
                  padding: "12px 0",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontVariantLigatures: "none",
                  lineHeight: "1.6",
                },
                ".cm-line": { padding: "0 12px" },
                ".cm-scroller": { overflowX: "auto" },
                "&.cm-focused": {
                  outline: "2px solid var(--dg-browser)",
                  outlineOffset: "-2px",
                },
              }),
              keymap.of([
                {
                  key: "Mod-Enter",
                  run: () => {
                    latest.current.onRun?.();
                    return true;
                  },
                },
              ]),
              EditorView.updateListener.of((update) => {
                if (update.docChanged)
                  latest.current.onChange(update.state.doc.toString());
              }),
            ],
          }),
        });
        setLoaded(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void load();
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    if (container.current) observer.observe(container.current);
    const idle = window.setTimeout(() => {
      void load();
    }, 2000);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(idle);
      view.current?.destroy();
      view.current = null;
    };
  }, [language, label]);
  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== code)
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: code },
      });
  }, [code]);
  return (
    <div ref={container} className="code-surface code-editor">
      <div className="code-toolbar">
        <span>{language}</span>
        <span className="text-xs">Tab moves to the next control</span>
      </div>
      {!loaded && !failed && (
        <div
          className="code-preview"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
      {failed && (
        <textarea
          aria-label={label}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          wrap="off"
          rows={code.split("\n").length}
        />
      )}
      <div ref={mount} hidden={!loaded} />
    </div>
  );
}
