import { test, expect } from "@playwright/test";

// Responsive, keyboard and reduced-motion coverage for the JavaScript topic.
const JS_PAGES = [
  "/topics/javascript",
  "/topics/javascript/event-loop",
  "/topics/javascript/closures",
  "/topics/javascript/question-bank",
  "/topics/javascript/puzzles",
  "/topics/javascript/challenges",
  "/topics/javascript/cheat-sheet",
];

for (const width of [390, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of JS_PAGES) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1 }),
        `${path} renders`,
      ).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${path} overflows`).toBeLessThanOrEqual(1);
    }
  });
}

test("interview accordion toggles by keyboard", async ({ page }) => {
  await page.goto("/topics/javascript/closures");
  const first = page
    .getByLabel("Interview questions")
    .locator("summary")
    .first();
  await first.scrollIntoViewIfNeeded();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByLabel("Interview questions").locator("details").first(),
  ).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(
    page.getByLabel("Interview questions").locator("details").first(),
  ).not.toHaveAttribute("open", "");
});

test("reduced motion still plays the simulator", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/topics/javascript/event-loop");
  const player = page
    .locator("div.my-6.overflow-hidden")
    .filter({ hasText: "Sync, promise, timer" });
  await player.scrollIntoViewIfNeeded();
  await expect(player).toBeVisible();
  await player.getByRole("button", { name: "Advance one step" }).click();
  await expect(player.locator("p[aria-live]")).not.toBeEmpty();
  expect(errors).toEqual([]);
});
