"use client";
import { useEffect, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import type { Compartment } from "@codemirror/state";

export interface EditorDiagnostic {
  line: number;
  col: number;
  message: string;
}

interface DocLine {
  from: number;
  to: number;
}

interface DocLike {
  line(n: number): DocLine;
  lines: number;
}

/** Map checker diagnostics onto document ranges for the lint gutter. */
function toMarks(
  doc: DocLike,
  diags: EditorDiagnostic[],
): Array<{ from: number; to: number; severity: "error"; message: string }> {
  const out: Array<{
    from: number;
    to: number;
    severity: "error";
    message: string;
  }> = [];
  for (const d of diags) {
    try {
      const line = doc.line(Math.min(Math.max(d.line, 1), doc.lines));
      const from = Math.min(line.from + Math.max(d.col - 1, 0), line.to);
      out.push({
        from,
        to: Math.min(from + 1, line.to),
        severity: "error",
        message: d.message,
      });
    } catch {
      /* stale position after edits; next run refreshes */
    }
  }
  return out;
}

export function CodeEditor({
  code,
  preview,
  language = "javascript",
  onChange,
  onRun,
  label = "JavaScript editor",
  diagnostics = [],
  lint = false,
}: {
  code: string;
  preview: string;
  language?: string;
  onChange: (code: string) => void;
  onRun?: () => void;
  label?: string;
  /** Type-checker diagnostics; rendered as gutter marks + underlines. */
  diagnostics?: EditorDiagnostic[];
  /** Enable the lint gutter. False by default so JS editors look unchanged. */
  lint?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const lintCompartmentRef = useRef<Compartment | null>(null);
  const relintRef = useRef<((diags: EditorDiagnostic[]) => void) | null>(null);
  const latest = useRef({ code, onChange, onRun });
  useEffect(() => {
    latest.current = { code, onChange, onRun };
  }, [code, onChange, onRun]);
  // Diagnostics are pushed into the editor via a compartment so the
  // TypeScript tab can mark lines without rebuilding the editor.
  const diagRef = useRef(diagnostics);
  useEffect(() => {
    diagRef.current = diagnostics;
  }, [diagnostics]);
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
          { EditorState, Compartment: StateCompartment },
          { HighlightStyle, syntaxHighlighting },
          { tags },
          { javascript },
          { html },
          { css },
          { linter, lintGutter },
        ] = await Promise.all([
          import("@codemirror/view"),
          import("@codemirror/state"),
          import("@codemirror/language"),
          import("@lezer/highlight"),
          import("@codemirror/lang-javascript"),
          import("@codemirror/lang-html"),
          import("@codemirror/lang-css"),
          import("@codemirror/lint"),
        ]);
        if (cancelled || !mount.current) return;
        const lintCompartment = new StateCompartment();
        lintCompartmentRef.current = lintCompartment;
        // Re-marking reconfigures the compartment (a config change makes
        // the lint plugin re-run; forceLinting alone no-ops on an
        // unchanged document). The snapshot is baked in, so no ref dance.
        relintRef.current = (diags) => {
          const editor = view.current;
          const compartment = lintCompartmentRef.current;
          if (!editor || !compartment) return;
          const snapshot = [...diags];
          editor.dispatch({
            effects: compartment.reconfigure(
              linter((v) => toMarks(v.state.doc, snapshot)),
            ),
          });
        };
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
              ...(lint
                ? [
                    lintGutter(),
                    lintCompartment.of(
                      linter((v) => toMarks(v.state.doc, diagRef.current ?? [])),
                    ),
                  ]
                : []),
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
                  caretColor: "var(--code-fg)",
                },
                ".cm-line": { padding: "0 12px" },
                ".cm-scroller": { overflowX: "auto" },
                ".cm-gutters": {
                  backgroundColor: "var(--code-bg)",
                  color: "var(--code-comment)",
                  borderColor: "var(--dg-node-border)",
                },
                ".cm-cursor, .cm-dropCursor": {
                  borderLeftColor: "var(--code-fg)",
                },
                ".cm-tooltip": {
                  backgroundColor: "var(--code-bg)",
                  color: "var(--code-fg)",
                  border: "1px solid var(--dg-node-border)",
                },
                ".cm-tooltip-arrow:before": {
                  borderTopColor: "var(--dg-node-border)",
                  borderBottomColor: "var(--dg-node-border)",
                },
                ".cm-tooltip-arrow:after": {
                  borderTopColor: "var(--code-bg)",
                  borderBottomColor: "var(--code-bg)",
                },
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
  }, [language, label, lint]);
  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== code)
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: code },
      });
  }, [code]);
  // Re-mark diagnostics without rebuilding the editor.
  useEffect(() => {
    relintRef.current?.(diagnostics ?? []);
  }, [diagnostics]);
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
