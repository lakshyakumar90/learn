/**
 * Interview question validation: unique ids, known topics, short answers.
 * The build check (check-topics) runs the same validator on the real file.
 */
import { describe, expect, it } from "vitest";
import {
  answerWordCount,
  validateQuestionList,
  type InterviewQuestion,
} from "../src/lib/interview";

function q(over: Partial<InterviewQuestion>): InterviewQuestion {
  return {
    id: "x-1",
    topic: "closures",
    level: "basic",
    question: "What is a closure?",
    answer: "A function that remembers its scope.",
    followUps: [],
    tags: [],
    ...over,
  };
}

describe("validateQuestionList", () => {
  it("accepts a clean list", () => {
    expect(validateQuestionList([q({}), q({ id: "x-2" })], ["closures"])).toEqual([]);
  });
  it("rejects duplicate ids", () => {
    expect(validateQuestionList([q({}), q({})], ["closures"]).join(" ")).toMatch(
      /duplicate/,
    );
  });
  it("rejects unknown topics", () => {
    expect(
      validateQuestionList([q({ topic: "nope" })], ["closures"]).join(" "),
    ).toMatch(/unknown topic/);
  });
  it("rejects answers over 120 words", () => {
    const long = Array(121).fill("word").join(" ");
    expect(
      validateQuestionList([q({ answer: long })], ["closures"]).join(" "),
    ).toMatch(/120/);
    expect(answerWordCount(long)).toBe(121);
  });
});
