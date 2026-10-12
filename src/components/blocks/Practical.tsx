import { highlight } from "@/lib/code/highlight";
import { HighlightedCode } from "./HighlightedCode";
import { Exercise } from "./server-blocks";
import type { ExerciseProps } from "./Exercise";

export interface RealWorldItem {
  name: string;
  detail: string;
  source: string;
  year: number;
}
export function RealWorld({ items }: { items: RealWorldItem[] }) {
  return (
    <ul className="my-4 space-y-3" aria-label="Real-world examples">
      {items.map((item) => (
        <li key={item.name}>
          <strong>{item.name}</strong> — {item.detail}{" "}
          <a href={item.source} target="_blank" rel="noreferrer">
            Source ({item.year})
          </a>
        </li>
      ))}
    </ul>
  );
}
export function WhenToUse({
  use,
  avoid,
  alternative,
}: {
  use: string;
  avoid: string;
  alternative: string;
}) {
  return (
    <div className="my-5 overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Use it when</th>
            <th>Avoid it when</th>
            <th>Better alternative</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{use}</td>
            <td>{avoid}</td>
            <td>{alternative}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export async function CodeCompare({
  before,
  after,
  title = "Before and after",
}: {
  before: string;
  after: string;
  title?: string;
}) {
  const markedBefore = before
    .split("\n")
    .map((line) => line + " // [!code --]")
    .join("\n");
  const markedAfter = after
    .split("\n")
    .map((line) => line + " // [!code ++]")
    .join("\n");
  const [oldHtml, newHtml] = await Promise.all([
    highlight(markedBefore),
    highlight(markedAfter),
  ]);
  return (
    <section aria-label={title} className="my-6 space-y-3">
      <h3>{title}</h3>
      <div className="grid min-w-0 gap-3 xl:grid-cols-2">
        <HighlightedCode html={oldHtml} code={before} label="before.js" />
        <HighlightedCode html={newHtml} code={after} label="after.js" />
      </div>
    </section>
  );
}
export function BugHunt(props: ExerciseProps) {
  return <Exercise {...props} />;
}
