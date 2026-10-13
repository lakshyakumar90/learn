import { getQuestionsByTopic } from "@/lib/interview";
import { QuestionDetails } from "./QuestionItem";

/**
 * A page's interview questions as an accessible accordion.
 * Native <details> elements: keyboard operable, collapsed by default.
 * `dir` selects the topic folder (defaults to JavaScript).
 */
export function InterviewQuestions({ topic, dir = 'javascript' }: { topic: string; dir?: string }) {
  const items = getQuestionsByTopic(topic, dir);
  if (items.length === 0) return null;
  return (
    <section aria-label="Interview questions" className="my-6">
      <h2 className="text-lg font-semibold">Interview questions</h2>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <QuestionDetails key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
