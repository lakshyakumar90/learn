import { highlight } from "@/lib/code/highlight";
import * as Client from "./client-blocks";
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
