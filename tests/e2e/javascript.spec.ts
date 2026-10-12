import { test, expect } from "@playwright/test";

// Step 2: one shared code look (static + editor, light + dark) and a
// DOM sandbox that runs without console errors.
for (const theme of ["light", "dark"] as const) {
  test(`code has distinct tokens before focus in ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("theme", value),
      theme,
    );
    await page.goto("/_kitchen-sink");
    const colors = await page
      .locator("[data-static-code] .code-preview .line span")
      .evaluateAll((elements) => [
        ...new Set(elements.map((e) => getComputedStyle(e).color)),
      ]);
    expect(colors.length).toBeGreaterThanOrEqual(4);
    const editor = page
      .getByRole("group", { name: "Console token check" })
      .locator(".cm-content");
    await editor.scrollIntoViewIfNeeded();
    await expect(editor).toBeVisible();
    const editorColors = await editor
      .locator("span")
      .evaluateAll((elements) => [
        ...new Set(elements.map((e) => getComputedStyle(e).color)),
      ]);
    expect(editorColors.length).toBeGreaterThanOrEqual(4);
    const output = page
      .getByRole("group", { name: "Console token check" })
      .getByLabel("Program output");
    const color = await output.evaluate(
      (e) => getComputedStyle(e).backgroundColor,
    );
    expect(color).toBe(
      theme === "light" ? "rgb(255, 255, 255)" : "rgb(28, 25, 23)",
    );
    await page
      .getByRole("group", { name: "Console token check" })
      .getByRole("button", { name: "Run code (Control Enter)" })
      .click();
    await expect(output).toContainText("8");
  });
}

test("a DOM example runs without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/_kitchen-sink");
  const group = page.getByRole("group", { name: "DOM smoke check" });
  await group.getByRole("button", { name: "Run DOM demo" }).click();
  await expect(group.getByLabel("DOM console")).toContainText("DOM ready");
  const frame = group.locator("iframe");
  await expect(frame).toBeVisible();
  expect(errors).toEqual([]);
});
