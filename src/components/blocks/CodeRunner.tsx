"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Expand, Play, RotateCcw, Square } from "lucide-react";
import { ExpandedView } from "@/components/ExpandedView";
import { CodeEditor } from "./CodeEditor";
import { useConsoleRunner } from "./use-console-runner";
import type { OutputLine } from "@/lib/run-console";
export interface CodeRunnerProps {
  language?: string;
  env?: "console" | "dom";
  expect?: string;
  title?: string;
  html?: string;
  css?: string;
  children: string;
  preview?: string;
  htmlPreview?: string;
  cssPreview?: string;
  expectDom?: string;
}
export const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm hover:bg-stone-100 disabled:opacity-50 dark:hover:bg-stone-900";
export const KIND_STYLE: Record<OutputLine["kind"], string> = {
  log: "",
  info: "text-blue-800 dark:text-blue-300",
  warn: "text-amber-800 dark:text-amber-300",
  error: "text-red-800 dark:text-red-300",
  table: "",
  return: "text-[var(--code-comment)]",
};
function normalize(value: unknown) {
  return (Array.isArray(value) ? value.join("") : String(value ?? ""))
    .replace(/^\n/, "")
    .trimEnd();
}
export function buildSrcdoc(js: string, html: string, css: string) {
  const script = js.replace(/<\/script/gi, "<\\/script");
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; style-src 'unsafe-inline'; img-src data:;"><style>body{font:16px system-ui;padding:12px;color:#24292f;background:#fff}button,input{font:inherit}button{min-height:44px}*:focus-visible{outline:2px solid #4f46e5}${css.replace(/<\/style/gi, "<\\/style")}</style></head><body>${html}<script>
const console = Object.fromEntries(["log","info","warn","error","table"].map(kind => [kind, (...a) => parent.postMessage({channel:"learn-dom",kind,text:a.map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join(" ")}, "*")]));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
window.addEventListener("error", e => console.error(e.message));
window.addEventListener("unhandledrejection", e => console.error(String(e.reason)));
(async () => {${script}})().catch(e => console.error(e.message));
<\/script></body></html>`;
}
export function DomRunner({
  initialJs,
  initialHtml,
  initialCss,
  preview,
  htmlPreview,
  cssPreview,
}: {
  initialJs: string;
  initialHtml: string;
  initialCss: string;
  preview: string;
  htmlPreview: string;
  cssPreview: string;
}) {
  const [js, setJs] = useState(initialJs);
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [tab, setTab] = useState("javascript");
  const [runId, setRunId] = useState(0);
  const [srcdoc, setSrcdoc] = useState(() =>
    buildSrcdoc(initialJs, initialHtml, initialCss),
  );
  const [lines, setLines] = useState<OutputLine[]>([]);
  const iframe = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    function receive(e: MessageEvent) {
      if (
        e.source !== iframe.current?.contentWindow ||
        e.data?.channel !== "learn-dom"
      )
        return;
      if (!["log", "info", "warn", "error", "table"].includes(e.data.kind))
        return;
      setLines((prev) => [
        ...prev.slice(-499),
        { kind: e.data.kind, text: String(e.data.text).slice(0, 10000) },
      ]);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  const run = () => {
    setLines([]);
    setSrcdoc(buildSrcdoc(js, html, css));
    setRunId((v) => v + 1);
  };
  const tabs = ["javascript", "html", "css"];
  return (
    <div data-dom-runner className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-2">
        <div role="tablist" aria-label="Example files" className="flex gap-1">
          {tabs.map((t, i) => (
            <button
              type="button"
              key={t}
              role="tab"
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                  e.preventDefault();
                  const n = (i + (e.key === "ArrowRight" ? 1 : -1) + 3) % 3;
                  setTab(tabs[n]);
                  (
                    e.currentTarget.parentElement?.children[n] as HTMLElement
                  )?.focus();
                }
              }}
              onClick={() => setTab(t)}
              className={
                BUTTON + (tab === t ? " border-[var(--dg-browser)]" : "")
              }
            >
              {t === "javascript"
                ? "script.js"
                : t === "html"
                  ? "index.html"
                  : "style.css"}
            </button>
          ))}
        </div>
        <button
          className={BUTTON}
          aria-label={"Copy " + tab}
          onClick={() => {
            void navigator.clipboard
              .writeText(
                tab === "javascript" ? js : tab === "html" ? html : css,
              )
              .catch(() => {});
          }}
        >
          <Copy size={16} />
          Copy file
        </button>
        <button className={BUTTON} onClick={run} aria-label="Run DOM demo">
          <Play size={16} />
          Run
        </button>
      </div>
      <div role="tabpanel" aria-label={tab + " code"}>
        <CodeEditor
          key={tab}
          language={tab}
          label={"Demo " + tab}
          code={tab === "javascript" ? js : tab === "html" ? html : css}
          onChange={
            tab === "javascript" ? setJs : tab === "html" ? setHtml : setCss
          }
          preview={
            tab === "javascript"
              ? preview
              : tab === "html"
                ? htmlPreview
                : cssPreview
          }
          onRun={run}
        />
      </div>
      <iframe
        ref={iframe}
        key={runId}
        title="DOM demo result"
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        className="h-80 w-full rounded-lg border bg-white"
      />
      <div className="code-output" aria-label="DOM console" aria-live="polite">
        {lines.length
          ? lines.map((l, i) => (
              <pre key={i} className={KIND_STYLE[l.kind]}>
                {l.text}
              </pre>
            ))
          : "Console output appears here."}
      </div>
      <p className="text-xs text-[var(--code-comment)]">
        Isolated browser frame. Network and imports are disabled.
      </p>
    </div>
  );
}
export function CodeRunner({
  env = "console",
  expect,
  title = "Try the code",
  html = "",
  css = "",
  children,
  preview = "",
  htmlPreview = "",
  cssPreview = "",
  expectDom,
}: CodeRunnerProps) {
  const initial = normalize(children);
  const [code, setCode] = useState(initial);
  const runner = useConsoleRunner();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const run = useCallback(() => runner.run(code), [runner, code]);
  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-auto font-medium">{title}</span>
      {env === "console" && (
        <>
          <button
            className={BUTTON}
            onClick={runner.running ? runner.stop : run}
            aria-label={
              runner.running ? "Stop run" : "Run code (Control Enter)"
            }
          >
            {runner.running ? <Square size={16} /> : <Play size={16} />}
            {runner.running ? "Stop" : "Run"}
          </button>
          <button
            className={BUTTON}
            onClick={() => {
              setCode(initial);
              runner.reset();
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </>
      )}
      {env === "console" && (
        <button
          className={BUTTON}
          aria-label="Copy code"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}Copy
        </button>
      )}
      <button
        className={BUTTON}
        aria-label="Expand runner"
        onClick={() => setOpen(true)}
      >
        <Expand size={16} />
        Expand
      </button>
    </div>
  );
  const body =
    env === "dom" ? (
      <DomRunner
        initialJs={code}
        initialHtml={html}
        initialCss={css}
        preview={preview}
        htmlPreview={htmlPreview}
        cssPreview={cssPreview}
      />
    ) : (
      <>
        <CodeEditor
          code={code}
          onChange={setCode}
          preview={preview}
          onRun={run}
        />
        <div
          className="code-output"
          aria-label="Program output"
          aria-live="polite"
        >
          {!runner.lines.length &&
            !runner.error &&
            (runner.running ? "Running…" : "Press Run to see the output.")}
          {runner.lines.map((l, i) => (
            <pre className={KIND_STYLE[l.kind]} key={i}>
              {l.text}
            </pre>
          ))}
          {runner.error && (
            <pre className={KIND_STYLE.error}>{runner.error.message}</pre>
          )}
          {runner.timedOut && <p>Stopped after 5 seconds.</p>}
          {runner.truncated && <p>Output limit reached.</p>}
        </div>
        {expect && (
          <details className="text-sm">
            <summary>Expected output</summary>
            <pre className="code-output">{expect.replaceAll("\\n", "\n")}</pre>
          </details>
        )}
        <details className="text-xs text-[var(--code-comment)]">
          <summary>Runner helpers</summary>
          <p>
            <code>sleep(ms)</code> waits; <code>fakeFetch(url)</code> returns
            deterministic sample data. Console code runs in a worker with a
            5-second limit.
          </p>
        </details>
      </>
    );
  return (
    <>
      <div
        role="group"
        aria-label={title}
        data-expected-dom={expectDom}
        className="my-6 min-w-0 space-y-3 rounded-xl border p-3 sm:p-4"
      >
        {toolbar}
        {!open && body}
      </div>
      <ExpandedView
        open={open}
        onOpenChange={setOpen}
        title={title}
        description="Edit and run code. Escape closes."
        panKeys={false}
        noFlow
        headerControls={<span />}
      >
        <div className="w-full min-w-0 space-y-3 overflow-y-auto p-4">
          {toolbar}
          {body}
        </div>
      </ExpandedView>
    </>
  );
}
