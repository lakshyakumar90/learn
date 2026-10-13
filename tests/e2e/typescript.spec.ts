import { test, expect } from "@playwright/test";

// TypeScript sandbox: lazy compiler, real diagnostics, still runs.
for (const theme of ["light", "dark"] as const) {
  test(`ts blocks share the code look in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("theme", value),
      theme,
    );
    await page.goto("/_kitchen-sink");
    const colors = await page
      .locator("[data-static-ts] .code-preview .line span")
      .evaluateAll((elements) => [
        ...new Set(elements.map((e) => getComputedStyle(e).color)),
      ]);
    expect(colors.length).toBeGreaterThanOrEqual(4);
    const editor = page
      .getByRole("group", { name: "TS token check" })
      .locator(".cm-content");
    await editor.scrollIntoViewIfNeeded();
    await expect(editor).toBeVisible();
    const editorColors = await editor
      .locator("span")
      .evaluateAll((elements) => [
        ...new Set(elements.map((e) => getComputedStyle(e).color)),
      ]);
    expect(editorColors.length).toBeGreaterThanOrEqual(4);
  });
}

test("the TS runner shows a diagnostic and the output tab still runs", async ({
  page,
}) => {
  await page.goto("/_kitchen-sink");
  const group = page.getByRole("group", { name: "TS token check" });
  await group.scrollIntoViewIfNeeded();
  // Nothing downloaded yet: the compiler loads on first interaction.
  await expect(group.getByText("Compiler not loaded")).toBeVisible();
  await group.getByRole("button", { name: "Check types" }).click();
  const types = group.getByLabel("Type diagnostics");
  await expect(types).toContainText("TS2322");
  await expect(types).toContainText("line 6");
  // Run anyway: types fail, output still prints.
  await group.getByRole("button", { name: /Run check and code/ }).click();
  const output = group.getByLabel("Program output");
  await expect(output).toContainText("Aarav Sharma");
  await expect(group).toContainText("still emits JavaScript");
  // The failing line is marked in the editor, not color-only.
  const editor = group.locator(".cm-content");
  await expect(editor).toBeVisible();
  await expect(
    group.locator(".cm-content").locator(".cm-lint-marker-error"),
  ).toHaveCount(1);
});

test("the compiler is not requested on page load", async ({ page }) => {
  const seen = new Set<string>();
  page.on("response", (r) => {
    try {
      const u = new URL(r.url());
      if (u.pathname.endsWith(".js")) seen.add(u.href);
    } catch {
      /* non-URL (data/blob) */
    }
  });
  await page.goto("/_kitchen-sink");
  await page.waitForLoadState("networkidle");
  const before = new Set(seen);
  const group = page.getByRole("group", { name: "TS token check" });
  await group.scrollIntoViewIfNeeded();
  await group.getByRole("button", { name: "Check types" }).click();
  await expect(group.getByLabel("Type diagnostics")).toContainText("TS2322");
  // Whatever else lazy-loads on scroll was already here; the compiler
  // chunk (megabytes of new JS) arrives only now, on first interaction.
  const fresh = [...seen].filter((p) => !before.has(p));
  let bigBytes = 0;
  for (const p of fresh) {
    try {
      const res = await page.request.get(p);
      bigBytes = Math.max(bigBytes, (await res.body()).length);
    } catch {
      /* gone already; ignore */
    }
  }
  expect(fresh.length).toBeGreaterThanOrEqual(1);
  expect(bigBytes).toBeGreaterThan(2_000_000);
});
