import { describe, expect, it } from "vitest";
import { palette } from "../src/lib/code/theme";
import { simulateEventLoop } from "../src/lib/event-loop/simulate";
import { fakeFetch } from "../src/lib/runner-helpers";
import { snippets, prose, wordCount } from "../scripts/javascript-content";
function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((s) => parseInt(s, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
describe("JavaScript teaching boundaries", () => {
  it("all code token colors meet 4.5:1 in both themes", () => {
    for (const p of Object.values(palette))
      for (const [key, color] of Object.entries(p)) {
        if (key === "bg") continue;
        const first = luminance(color),
          second = luminance(p.bg);
        expect(
          (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05),
          key,
        ).toBeGreaterThanOrEqual(4.5);
      }
  });
  it("a long synchronous task delays its due timer and explains why", () => {
    const trace = simulateEventLoop(
      [
        {
          op: "timeout",
          delay: 0,
          label: "timer",
          body: [{ op: "log", text: "timer" }],
        },
        { op: "block", ms: 200, label: "import" },
        { op: "log", text: "work" },
      ],
      "browser",
    );
    expect(trace.output).toEqual(["work", "timer"]);
    expect(trace.steps.every((step) => step.why?.length)).toBe(true);
    expect(
      trace.steps.find((step) => step.title === "Render opportunity")?.why,
    ).toContain("not a guarantee");
  });
  it("rejects Node-only queues in a browser trace", () => {
    expect(() =>
      simulateEventLoop([{ op: "nextTick", label: "n", body: [] }], "browser"),
    ).toThrow("only exists in Node");
  });
  it("the fake API distinguishes an HTTP failure from cancellation", async () => {
    expect((await fakeFetch("/missing", { latencyMs: 0 })).status).toBe(404);
    const controller = new AbortController();
    controller.abort();
    await expect(
      fakeFetch("/users", { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
  it("quality checks count a decoded runnable body and visible sourced prose", () => {
    const text =
      '<CodeRunner expect="1">{`const value = 1;\nconsole.log(value);`}</CodeRunner>\nA short explanation.';
    expect(snippets(text)[0].code.split("\n")).toHaveLength(2);
    expect(wordCount(prose(text))).toBe(3);
  });
});
