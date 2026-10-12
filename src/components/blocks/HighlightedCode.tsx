"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function HighlightedCode({
  html,
  code,
  label = "script.js",
  numbered = false,
}: {
  html: string;
  code: string;
  label?: string;
  numbered?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`code-surface ${numbered ? "code-numbered" : ""}`}>
      <div className="code-toolbar">
        <span>{label}</span>
        <button
          type="button"
          aria-label={`Copy ${label}`}
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
          {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div
        className="code-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
