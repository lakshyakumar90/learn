import { highlight } from "@/lib/code/highlight";
import * as Client from "./client-blocks";
import { HighlightedCode } from "./HighlightedCode";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { loadQuestions } from "@/lib/interview";
import type { BankTopic } from "./QuestionBank";
import type { CodeRunnerProps } from "./CodeRunner";
import type { ExerciseProps } from "./Exercise";
import type { PredictProps } from "./Predict";
import { getScenario } from "../../../content/scenarios";

export async function CodeRunner(props: CodeRunnerProps) {
  const code = String(props.children).replace(/^\n/, "").trimEnd();
  const [preview, htmlPreview, cssPreview] = await Promise.all([
    highlight(code),
    highlight(props.html ?? "", "html"),
    highlight(props.css ?? "", "css"),
  ]);
  return (
    <Client.CodeRunner
      {...props}
      preview={preview}
      htmlPreview={htmlPreview}
      cssPreview={cssPreview}
    />
  );
}
export async function Exercise(props: ExerciseProps) {
  return (
    <Client.Exercise
      {...props}
      preview={await highlight(
        String(props.children).replace(/^\n/, "").trimEnd(),
      )}
      solutionPreview={await highlight(props.solution)}
    />
  );
}
export async function Predict(props: PredictProps) {
  return (
    <Client.Predict
      {...props}
      preview={await highlight(
        String(props.children).replace(/^\n/, "").trimEnd(),
      )}
    />
  );
}
export async function ScenarioPlayer(props: {
  scenario: string;
  title?: string;
}) {
  const { data } = getScenario(props.scenario);
  return (
    <Client.ScenarioPlayer
      {...props}
      codePreview={await highlight((data.code ?? []).join("\n"))}
    />
  );
}

/** Question bank: questions + topic titles loaded at build time. */
export function QuestionBank() {
  const questions = loadQuestions();
  const dir = join(process.cwd(), "content/topics/javascript");
  const topics: BankTopic[] = [...new Set(questions.map((q) => q.topic))]
    .sort()
    .map((slug) => {
      let title = slug;
      try {
        const { data } = matter(
          readFileSync(join(dir, `${slug}.mdx`), "utf8"),
        );
        if (typeof data.title === "string" && data.title) title = data.title;
      } catch {
        /* title falls back to the slug */
      }
      return { slug, title };
    });
  return <Client.QuestionBank questions={questions} topics={topics} />;
}

/**
 * Display-only code: the same Shiki pipeline, palette, copy button and
 * language label as the runner preview. For snippets the reader does
 * not execute; anything runnable must be a CodeRunner/Predict/Exercise.
 */
export async function CodeBlock(props: {
  language?: string;
  label?: string;
  children: string;
}) {
  const code = String(props.children).replace(/^\n/, "").trimEnd();
  const language = props.language ?? "javascript";
  const label =
    props.label ??
    (language === "html"
      ? "index.html"
      : language === "css"
        ? "style.css"
        : "script.js");
  return (
    <div className="my-6">
      <HighlightedCode
        html={await highlight(code, language)}
        code={code}
        label={label}
      />
    </div>
  );
}
