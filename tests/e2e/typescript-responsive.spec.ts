import { test, expect } from "@playwright/test";

// Viewport, keyboard, filter-persistence and reduced-motion coverage
// for the TypeScript topic (mirrors javascript-responsive.spec.ts).
const TS_PAGES = [
  "/topics/typescript",
  "/topics/typescript/why-typescript",
  "/topics/typescript/unions-narrowing",
  "/topics/typescript/generics",
  "/topics/typescript/question-bank",
  "/topics/typescript/compile-puzzles",
  "/topics/typescript/challenges",
  "/topics/typescript/cheat-sheet",
];

for (const width of [390, 1024, 1440]) {
  for (const theme of ["light", "dark"] as const) {
    test(`ts pages have no horizontal overflow at ${width}px (${theme})`, async ({
      page,
    }) => {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.setViewportSize({ width, height: 800 });
      for (const path of TS_PAGES) {
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
}

test("ts bank filters survive a reload", async ({ page }) => {
  await page.goto("/topics/typescript/question-bank");
  await page.getByLabel("Search interview questions").fill("narrowing");
  await expect(page).toHaveURL(/q=narrowing/);
  await expect(page.getByRole("status")).not.toHaveText("111 questions");
  await page.reload();
  await expect(page.getByLabel("Search interview questions")).toHaveValue(
    "narrowing",
  );
  await expect(page).toHaveURL(/q=narrowing/);
});

test("ts interview accordion toggles by keyboard", async ({ page }) => {
  await page.goto("/topics/typescript/generics");
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
});

test("ts pages run clean with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/topics/typescript/unions-narrowing");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
