/**
 * Interview questions: single source of truth in
 * content/topics/<dir>/interview/questions.yaml.
 *
 * Server components and build scripts import the loader; the client
 * question bank receives questions as props (type-only import).
 * `dir` defaults to 'javascript' so existing callers keep working.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  level: z.enum(["basic", "intermediate"]),
  question: z.string().min(1),
  answer: z.string().min(1),
  followUps: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type InterviewQuestion = z.infer<typeof questionSchema>;

export const MAX_ANSWER_WORDS = 120;

const cache = new Map<string, InterviewQuestion[]>();

export function questionsPath(dir = 'javascript'): string {
  return join(process.cwd(), 'content', 'topics', dir, 'interview', 'questions.yaml');
}

export function loadQuestions(dir = 'javascript'): InterviewQuestion[] {
  const hit = cache.get(dir);
  if (hit) return hit;
  const file = questionsPath(dir);
  const parsed = z.array(questionSchema).parse(loadYaml(readFileSync(file, "utf8")));
  cache.set(dir, parsed);
  return parsed;
}

export function getQuestionsByTopic(topic: string, dir = 'javascript'): InterviewQuestion[] {
  return loadQuestions(dir).filter((q) => q.topic === topic);
}

export function answerWordCount(answer: string): number {
  return (
    answer.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? []
  ).length;
}

/** Pure validation over data (unit-tested); returns error strings. */
export function validateQuestionList(
  questions: InterviewQuestion[],
  topicSlugs: string[],
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const slugs = new Set(topicSlugs);
  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`duplicate question id "${q.id}"`);
    seen.add(q.id);
    if (!slugs.has(q.topic))
      errors.push(`question "${q.id}" references unknown topic "${q.topic}"`);
    const words = answerWordCount(q.answer);
    if (words > MAX_ANSWER_WORDS)
      errors.push(
        `question "${q.id}" answer is ${words} words (max ${MAX_ANSWER_WORDS})`,
      );
  }
  return errors;
}

/** Build-time validation against the real files. */
export function validateQuestions(topicSlugs: string[], dir = 'javascript'): string[] {
  try {
    return validateQuestionList(loadQuestions(dir), topicSlugs);
  } catch (e) {
    return [`${dir} questions.yaml: ${(e as Error).message}`];
  }
}
