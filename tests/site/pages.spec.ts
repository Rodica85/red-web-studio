import fs from 'node:fs';
import { test, expect, PAGES, SITE, allHtmlPaths, fileFor, WEBSITE_DIR } from '../helpers';

test.describe('Every main page', () => {
  for (const path of PAGES) {
    test.describe(path, () => {
      test('loads with status 200 and a proper <head>', async ({ page }) => {
        const res = await page.goto(path);
        expect(res?.status()).toBe(200);
        await expect(page).toHaveTitle(/\S/);
        expect(await page.getAttribute('html', 'lang')).toBe('en');
        await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
        const desc = await page.getAttribute('meta[name="description"]', 'content');
        expect(desc, 'meta description').toBeTruthy();
        expect(desc!.length, 'meta description length').toBeGreaterThanOrEqual(50);
        expect(desc!.length, 'meta description length').toBeLessThanOrEqual(320);
      });

      test('has a canonical www URL without a trailing slash', async ({ page }) => {
        await page.goto(path);
        const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
        const expected = path === '/' ? `${SITE}/` : `${SITE}${path}`;
        expect(canonical).toBe(expected);
      });

      test('has exactly one h1 and every image has alt text', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('h1')).toHaveCount(1);
        const missingAlt = await page.locator('img:not([alt])').count();
        expect(missingAlt, 'images without an alt attribute').toBe(0);
      });

      test('has the logo, a WhatsApp link and a Privacy link in the footer', async ({ page }) => {
        await page.goto(path);
        if (path !== '/demos') await expect(page.locator('a[href*="wa.me/447424714686"]').first()).toBeAttached();
        await expect(page.locator('footer a[href="/privacy-policy"]')).toHaveCount(1);
        await expect(page.locator('footer')).toContainText('contact@redwebstudio.com');
      });

      test('structured data (JSON-LD) is valid JSON', async ({ page }) => {
        await page.goto(path);
        const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
        for (const block of blocks) expect(() => JSON.parse(block)).not.toThrow();
      });

      test('Open Graph image exists', async ({ page, request }) => {
        await page.goto(path);
        const tag = page.locator('meta[property="og:image"]');
        test.skip((await tag.count()) === 0, 'page has no og:image');
        const og = await tag.getAttribute('content');
        const local = new URL(og!).pathname;
        expect((await request.get(local)).status(), `og:image ${local}`).toBe(200);
      });
    });
  }
});

test('unknown URLs show the 404 page', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('a[href="/"], a[href="/index.html"]').first()).toBeAttached();
});

test.describe('Links', () => {
  test('every internal link and asset on every page exists', async ({ request }) => {
    const broken: string[] = [];
    const checked = new Map<string, number>();
    for (const htmlPath of allHtmlPaths()) {
      const html = fs.readFileSync(WEBSITE_DIR + htmlPath, 'utf8');
      const refs = [...html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)].map((m) => m[1]);
      for (const ref of refs) {
        if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref)) continue;
        const base = 'http://x' + htmlPath.replace(/[^/]*$/, '');
        const target = new URL(ref, base).pathname;
        if (!checked.has(target)) checked.set(target, (await request.get(target)).status());
        if (checked.get(target) !== 200) broken.push(`${htmlPath} -> ${ref} (${checked.get(target)})`);
      }
    }
    expect(broken, 'broken internal links').toEqual([]);
  });

  test('external links that open a new tab use rel="noopener"', async () => {
    const unsafe: string[] = [];
    for (const htmlPath of allHtmlPaths()) {
      const html = fs.readFileSync(WEBSITE_DIR + htmlPath, 'utf8');
      for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
        if (!/rel="[^"]*noopener/.test(m[0])) unsafe.push(`${htmlPath}: ${m[0].slice(0, 90)}`);
      }
    }
    expect(unsafe).toEqual([]);
  });

  test('every page file is reachable at its clean URL', async ({ request }) => {
    for (const p of PAGES) expect(fileFor(p), p).not.toBe('');
    for (const p of PAGES) expect((await request.get(p)).status(), p).toBe(200);
  });
});
