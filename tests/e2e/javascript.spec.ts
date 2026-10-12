import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import redirects from "../../content/topics/javascript/redirects.json";

function pages(
  dir = join(process.cwd(), "content/topics/javascript"),
): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? pages(join(dir, e.name))
      : e.name.endsWith(".mdx")
        ? [join(dir, e.name)]
        : [],
  );
}
const files = pages();
const paths = files
  .map(
    (file) =>
      "/topics/javascript/" +
      relative(join(process.cwd(), "content/topics/javascript"), file)
        .replaceAll("\\", "/")
        .replace(/\.mdx$/, "")
        .replace(/\/index$/, ""),
  )
  .map((p) => p.replace(/\/index$/, ""));
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

test("all live demos work in their isolated frames", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/_kitchen-sink");
  const freeze = page
    .locator('[data-live-demo="freeze"] iframe')
    .contentFrame();
  await freeze.getByRole("button", { name: "Block", exact: true }).click();
  await expect(freeze.getByRole("status")).toContainText("Blocked:");
  await freeze.getByRole("button", { name: "Chunk", exact: true }).click();
  await expect(freeze.getByRole("status")).toContainText("Chunked:");
  await freeze.getByRole("button", { name: "Worker", exact: true }).click();
  await expect(freeze.getByRole("status")).toContainText("Worker:");
  const closure = page
    .locator('[data-live-demo="closure"] iframe')
    .contentFrame();
  await closure.getByRole("button", { name: "Add to first cart" }).click();
  await expect(closure.getByRole("status")).toHaveText("First: 1 · Second: 1");
  await closure
    .getByRole("button", { name: "Fix: separate the carts" })
    .click();
  await closure.getByRole("button", { name: "Add to first cart" }).click();
  await expect(closure.getByRole("status")).toHaveText("First: 1 · Second: 0");
  const debounce = page
    .locator('[data-live-demo="debounce"] iframe')
    .contentFrame();
  await debounce
    .getByRole("textbox", { name: "Search" })
    .pressSequentially("tea", { delay: 20 });
  await expect(debounce.getByRole("status")).toHaveText("Search 1: tea");
  const bubbling = page
    .locator('[data-live-demo="bubbling"] iframe')
    .contentFrame();
  await bubbling.getByRole("button", { name: "Click target" }).click();
  await expect(bubbling.getByRole("status")).toHaveText(
    "target → inner → outer",
  );
  const stale = page.locator('[data-live-demo="stale"] iframe').contentFrame();
  await stale.getByRole("button", { name: "Schedule receipt" }).click();
  await stale.getByRole("button", { name: "Add £5" }).click();
  await expect(stale.getByRole("status")).toHaveText(
    "Snapshot: £10; current: £15",
  );
  const leak = page.locator('[data-live-demo="leak"] iframe').contentFrame();
  await leak.getByRole("button", { name: "Mount view" }).click();
  await leak.getByRole("button", { name: "Mount view" }).click();
  await leak.getByRole("button", { name: "Dispatch event" }).click();
  await expect(leak.getByRole("status")).toHaveText("Calls: 2");
  await leak.getByRole("button", { name: "Unmount with cleanup" }).click();
  await leak.getByRole("button", { name: "Dispatch event" }).click();
  await expect(leak.getByRole("status")).toHaveText("Calls: 0");
  expect(errors).toEqual([]);
});

for (const file of files)
  if (readFileSync(file, "utf8").includes('<CodeRunner env="dom"')) {
    const url =
      "/topics/javascript/" +
      relative(join(process.cwd(), "content/topics/javascript"), file)
        .replaceAll("\\", "/")
        .replace(/\.mdx$/, "");
    test(`DOM implementations run: ${url}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.addInitScript(() => {
        window.addEventListener("message", (event) => {
          if (
            event.data?.channel === "learn-dom" &&
            event.data?.kind === "error"
          )
            console.error(event.data.text);
        });
      });
      await page.goto(url);
      const groups = page.locator("[data-expected-dom]");
      for (let i = 0; i < (await groups.count()); i++) {
        const group = groups.nth(i);
        await group.scrollIntoViewIfNeeded();
        const expected = await group.getAttribute("data-expected-dom");
        await group.getByRole("button", { name: "Run DOM demo" }).click();
        const frame = group.locator("iframe").contentFrame();
        await expect(frame.locator("#status")).toHaveText(expected!);
        await group.getByRole("tab", { name: "index.html" }).click();
        await expect(group.getByRole("tabpanel")).toHaveAttribute(
          "aria-label",
          "html code",
        );
        await group
          .getByRole("tab", { name: "index.html" })
          .press("ArrowRight");
        await expect(
          group.getByRole("tab", { name: "style.css" }),
        ).toBeFocused();
      }
      if (url.endsWith("/browser/events")) {
        const frame = page.locator("[data-expected-dom] iframe").contentFrame();
        await frame
          .getByRole("button", { name: "Complete 42", exact: true })
          .click();
        await expect(frame.locator("#status")).toHaveText("Completed 42");
      }
      if (url.endsWith("/advanced/security")) {
        const frame = page.locator("[data-expected-dom] iframe").contentFrame();
        await expect(frame.locator("#safe button")).toHaveCount(0);
        await frame.getByRole("button", { name: "Injected action" }).click();
        await expect(frame.locator("#status")).toHaveText("Injected");
      }
      expect(errors).toEqual([]);
    });
  }
test("storyboard and expanded view work by keyboard; reduced motion does not autoplay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/_kitchen-sink");
  const board = page.locator("[data-storyboard]");
  await board.scrollIntoViewIfNeeded();
  await board.focus();
  await board.press("ArrowRight");
  await expect(board).toContainText("2 of 3");
  await board.press(" ");
  await page.waitForTimeout(2600);
  await expect(board).toContainText("2 of 3");
  await board.getByRole("button", { name: "Expand storyboard" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    board.getByRole("button", { name: "Expand storyboard" }),
  ).toBeFocused();
  const runner = page.getByRole("group", { name: "Console token check" });
  await runner.getByRole("button", { name: "Expand runner" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    runner.getByRole("button", { name: "Expand runner" }),
  ).toBeFocused();
});
test("every retired slug navigates to its consolidated lesson", async ({
  page,
}) => {
  for (const [from, to] of Object.entries(redirects)) {
    await page.goto("/topics/javascript/" + from);
    await expect(page).toHaveURL(new RegExp("/topics/javascript/" + to + "$"));
  }
});
for (const width of [390, 1024, 1440])
  for (const theme of ["light", "dark"] as const) {
    test(`JavaScript pages have no page overflow at ${width}px ${theme}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(240000);
      await page.setViewportSize({ width, height: 960 });
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      for (const path of paths) {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1").first()).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
          path,
        ).toBeLessThanOrEqual(1);
      }
      for (const path of [
        "/topics/javascript/async/event-loop-browser",
        "/topics/javascript/intermediate/closures",
        "/_images",
      ]) {
        await page.goto(path);
        await expect(page.locator("h1").first()).toBeVisible();
        await page.screenshot({
          path: testInfo.outputPath(
            path.split("/").at(-1) + `-${width}-${theme}.png`,
          ),
          fullPage: path !== "/_images",
        });
      }
    });
  }
