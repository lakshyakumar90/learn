import { createHighlighter } from "shiki";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerMetaHighlight,
} from "@shikijs/transformers";
import { lightTheme, darkTheme } from "./theme";

const highlighter = createHighlighter({
  themes: [lightTheme, darkTheme],
  langs: ["javascript", "typescript", "html", "css", "json", "bash"],
});
export async function highlight(code: string, lang = "javascript", meta = "") {
  const h = await highlighter;
  return h.codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "learn-light", dark: "learn-dark" },
    defaultColor: false,
    meta: { __raw: meta },
    transformers: [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerMetaHighlight(),
    ],
  });
}
