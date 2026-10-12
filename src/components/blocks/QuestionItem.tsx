/**
 * Shared presentational pieces for interview questions. Pure rendering
 * (no fs access) so both the server accordion and the client question
 * bank use the exact same markup.
 */
import type { InterviewQuestion } from "@/lib/interview";

/** Minimal inline markdown for short answers: paragraphs, `- ` lists,
 *  `code` spans and **bold**. Everything else renders as plain text. */
export function AnswerText({ markdown }: { markdown: string }) {
  const blocks: Array<{ type: "p" | "ul"; lines: string[] }> = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === "") continue;
    if (line.trimStart().startsWith("- ")) {
      const text = line.trimStart().slice(2);
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.lines.push(text);
      else blocks.push({ type: "ul", lines: [text] });
    } else {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "p") last.lines.push(line.trim());
      else blocks.push({ type: "p", lines: [line.trim()] });
    }
  }
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="mt-1 list-disc space-y-1 pl-5">
            {b.lines.map((l, j) => (
              <li key={j}>
                <Inline text={l} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="mt-1 first:mt-0">
            <Inline text={b.lines.join(" ")} />
          </p>
        ),
      )}
    </>
  );
}

function Inline({ text }: { text: string }) {
  // Split on `code` and **bold** markers, keeping the delimiters.
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function QuestionDetails({
  item,
  topicTitle,
}: {
  item: InterviewQuestion;
  topicTitle?: string;
}) {
  return (
    <details className="group rounded-xl border px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
      <summary className="cursor-pointer list-none font-medium marker:hidden">
        <span
          aria-hidden
          className="mr-2 inline-block text-xs opacity-50 transition-transform group-open:rotate-90"
        >
          ▶
        </span>
        {item.question}
        <span className="ml-2 inline-flex gap-1 align-middle">
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-normal opacity-70">
            {item.level}
          </span>
          {topicTitle ? (
            <span className="rounded-full border px-2 py-0.5 text-[11px] font-normal opacity-70">
              {topicTitle}
            </span>
          ) : null}
        </span>
      </summary>
      <div className="mt-2 text-sm leading-relaxed opacity-90">
        <AnswerText markdown={item.answer} />
        {item.followUps.length > 0 ? (
          <div className="mt-2">
            <p className="font-semibold">Interviewers also ask</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {item.followUps.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}
