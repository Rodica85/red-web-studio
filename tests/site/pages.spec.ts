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

      test('link preview card (Facebook, WhatsApp, X, iMessage) is complete', async ({ page, request }) => {
        await page.goto(path);
        const meta = async (attr: string, key: string) => {
          const tag = page.locator(`meta[${attr}="${key}"]`);
          expect(await tag.count(), `${key} appears once`).toBe(1);
          const v = (await tag.getAttribute('content'))!;
          expect(v.trim(), `${key} is filled in`).not.toBe('');
          return v;
        };
        for (const k of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:image:alt', 'og:image:type']) await meta('property', k);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        expect(await meta('property', 'og:url'), 'og:url matches the canonical URL').toBe(canonical);
        const img = await meta('property', 'og:image');
        expect(img, 'og:image is an absolute https www URL').toMatch(/^https:\/\/www\.redwebstudio\.com\//);
        expect(await meta('property', 'og:image:secure_url')).toBe(img);
        expect(await meta('name', 'twitter:card')).toBe('summary_large_image');
        expect(await meta('name', 'twitter:image')).toBe(img);
        expect(await meta('name', 'twitter:title')).toBe(await meta('property', 'og:title'));
        expect(await meta('name', 'twitter:description')).toBe(await meta('property', 'og:description'));
        await meta('name', 'twitter:image:alt');

        // The image exists, is not too big for WhatsApp and has the size the tags say.
        const res = await request.get(new URL(img).pathname + new URL(img).search);
        expect(res.status(), `og:image ${img}`).toBe(200);
        const body = await res.body();
        expect(body.length, 'og:image under 300 KB (WhatsApp limit)').toBeLessThan(300_000);
        expect(res.headers()['content-type']).toBe(await meta('property', 'og:image:type'));
        const size = await page.evaluate(async (src) => {
          const i = new Image(); i.src = src; await i.decode(); return [i.naturalWidth, i.naturalHeight];
        }, new URL(img).pathname + new URL(img).search);
        expect(size.map(String)).toEqual([await meta('property', 'og:image:width'), await meta('property', 'og:image:height')]);
        expect(size[0], 'wide enough for a large card').toBeGreaterThanOrEqual(600);

        // WhatsApp only reads the start of the page: tags must be near the top.
        const html = await (await request.get(path)).text();
        expect(html.indexOf('og:image'), 'og:image in the first 4 KB').toBeLessThan(4096);
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
