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
import type { TsDiagnostic } from "@/lib/ts-compiler";
import { getScenario } from "../../../content/scenarios";

interface TypeCheckData {
  diagnostics: TsDiagnostic[];
}

function typecheckData(): Record<string, TypeCheckData> {
  try {
    return JSON.parse(
      readFileSync(
        join(process.cwd(), "generated", "ts-typechecks.json"),
        "utf8",
      ),
    ) as Record<string, TypeCheckData>;
  } catch {
    return {};
  }
}

export async function CodeRunner(props: CodeRunnerProps) {
  const code = String(props.children).replace(/^\n/, "").trimEnd();
  const lang = props.language === "typescript" || props.language === "ts" ? "typescript" : "javascript";
  const [preview, htmlPreview, cssPreview] = await Promise.all([
    highlight(code, lang),
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
  const ts = props.language === "typescript" || props.language === "ts";
  const lang = ts ? "typescript" : "javascript";
  const code = String(props.children).replace(/^\n/, "").trimEnd();
  return (
    <Client.Exercise
      {...props}
      preview={await highlight(code, lang)}
      solutionPreview={await highlight(props.solution, lang)}
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
export function QuestionBank({ dir = "javascript" }: { dir?: string }) {
  const questions = loadQuestions(dir);
  const base = join(process.cwd(), "content", "topics", dir);
  const topics: BankTopic[] = [...new Set(questions.map((q) => q.topic))]
    .sort()
    .map((slug) => {
      let title = slug;
      try {
        const { data } = matter(
          readFileSync(join(base, `${slug}.mdx`), "utf8"),
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
 * "Will it compile?" puzzle. Diagnostics were computed at build time by
 * check-ts-examples and embedded in generated/ts-typechecks.json, so the
 * page ships no compiler. The author's answer/line stay in MDX source
 * (build-verified) and are stripped here so they can't leak.
 */
export async function TypeCheck(props: {
  id: string;
  question?: string;
  answer?: string;
  line?: string;
  explanation: string;
  children: string;
}) {
  const code = String(props.children).replace(/^\n/, "").trimEnd();
  const diagnostics = typecheckData()[props.id]?.diagnostics ?? [];
  return (
    <Client.TypeCheck
      id={props.id}
      question={props.question}
      explanation={props.explanation}
      preview={await highlight(code, "typescript")}
      diagnostics={diagnostics}
    >
      {props.children}
    </Client.TypeCheck>
  );
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
        : language === "typescript" || language === "ts"
          ? "script.ts"
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
