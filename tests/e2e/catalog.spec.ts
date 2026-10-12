/**
 * Catalog smoke test on the static export: search + filter + URL
 * persistence across reload + clear.
 */
import { expect, test } from '@playwright/test';

test('topics search, filter, reload, clear', async ({ page }) => {
  await page.goto('/topics');
  await expect(page.getByRole('heading', { name: 'Browse topics' })).toBeVisible();

  // Search "event" finds JavaScript (keyword hit).
  await page.getByLabel('Search topics').fill('event');
  await expect(page.getByRole('article', { name: /JavaScript/ })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('1 result');

  // Select Languages: URL gains the filter, card stays.
  await page.getByRole('checkbox', { name: 'Languages' }).check();
  await expect(page.getByRole('article', { name: /JavaScript/ })).toBeVisible();
  await expect(page).toHaveURL(/category=languages/);
  await expect(page).toHaveURL(/q=event/);

  // Reload: same state, same result.
  await page.reload();
  await expect(page.getByLabel('Search topics')).toHaveValue('event');
  await expect(page.getByRole('checkbox', { name: 'Languages' })).toBeChecked();
  await expect(page.getByRole('article', { name: /JavaScript/ })).toBeVisible();

  // Clear: URL clean, all cards back.
  await page.getByRole('button', { name: 'Clear all' }).first().click();
  await expect(page).toHaveURL(/\/topics$/);
  await expect(page.getByRole('article', { name: /JavaScript/ })).toBeVisible();
  await expect(page.getByRole('article', { name: /Prisma/ })).toBeVisible();
});

test('filter sidebar pins while cards scroll, no footer', async ({ page }) => {
  // Short viewport forces real page scrolling.
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto('/topics');
  const aside = page.getByLabel('Topics filters');
  await expect(aside).toBeVisible();
  expect(await aside.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
  expect(await aside.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
  // Panel may run flush to the screen end (viewport minus navbar).
  expect(await aside.evaluate((el) => getComputedStyle(el).maxHeight)).toBe('444px');
  // Near-invisible scrollbar: gutter takes almost no width.
  expect(await aside.evaluate((el) => el.offsetWidth - el.clientWidth)).toBeLessThanOrEqual(6);
  const card = page.getByRole('article', { name: /JavaScript/ });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // The page really scrolled…
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
  // …the panel stayed pinned exactly at the navbar (top-14 = 56px),
  // even at the very end of the page, running flush to the screen end…
  const box = await aside.boundingBox();
  expect(Math.abs((box?.y ?? 9999) - 56)).toBeLessThan(8);
  expect(Math.abs((box?.y ?? 0) + (box?.height ?? 0) - 500)).toBeLessThan(8);
  // …while the cards scrolled normally.
  await expect(card).not.toBeInViewport();
  // No footer on the browse page.
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
});
test('no horizontal overflow at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
