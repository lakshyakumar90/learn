import { getQuestionsByTopic } from "@/lib/interview";
import { QuestionDetails } from "./QuestionItem";

/**
 * A page's interview questions as an accessible accordion.
 * Native <details> elements: keyboard operable, collapsed by default.
 */
export function InterviewQuestions({ topic }: { topic: string }) {
  const items = getQuestionsByTopic(topic);
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
