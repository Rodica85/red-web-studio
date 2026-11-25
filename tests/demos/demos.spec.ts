import { test, expect, STARTER_DEMOS, SITE, hasNoHorizontalOverflow } from '../helpers';

for (const demo of STARTER_DEMOS) {
  const url = `/demos/${demo.slug}/`;

  test.describe(`Demo: ${demo.slug}`, () => {
    test('loads, is marked as a demo and is hidden from Google', async ({ page }) => {
      const res = await page.goto(url);
      expect(res?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('.demo-bar, .preview-bar').first()).toContainText(/Demo template · Starter £349/i);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.locator('img:not([alt])').count(), 'images without alt').toBe(0);
    });

    test('has link-preview tags pointing at its own page and screenshot', async ({ page, request }) => {
      await page.goto(url);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${SITE}/demos/${demo.slug}`);
      const img = await page.getAttribute('meta[property="og:image"]', 'content');
      expect(img).toBe(`${SITE}/demos/shots/${demo.slug}.jpg`);
      expect((await request.get(new URL(img!).pathname)).status()).toBe(200);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    });

    test('every WhatsApp link goes to the demo business number', async ({ page }) => {
      await page.goto(url);
      const hrefs = await page.locator('a[href*="wa.me/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const h of hrefs) expect(new URL(h).pathname, h).toBe(`/${demo.wa}`);
      const tel = await page.locator('a[href^="tel:"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      for (const t of tel) expect(t).toMatch(/^tel:\+?\d{10,13}$/);
    });

    test('footer shows the current year', async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('#y, #year').first()).toHaveText(String(new Date().getFullYear()));
    });

    test('contacts nobody but fonts and photos while loading', async ({ page, context }) => {
      const hosts = new Set<string>();
      page.on('request', (r) => hosts.add(new URL(r.url()).hostname));
      await page.goto(url, { waitUntil: 'networkidle' });
      for (const h of hosts) expect(['localhost', 'fonts.googleapis.com', 'fonts.gstatic.com', 'images.unsplash.com']).toContain(h);
      expect(await context.cookies()).toEqual([]);
    });

    if (demo.map) {
      test('Google map loads only after "Show map"', async ({ page }) => {
        const google: string[] = [];
        page.on('request', (r) => { if (/google\.com\/maps|maps\.google/.test(r.url())) google.push(r.url()); });
        await page.goto(url, { waitUntil: 'networkidle' });
        expect(google, 'requests to Google before the click').toEqual([]);

        const box = page.locator('.map-consent');
        await expect(box).toContainText('Google');
        await expect(box.locator('a')).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
        await expect(box.locator('a')).toHaveAttribute('rel', /noopener/);

        await box.scrollIntoViewIfNeeded();
        await box.getByRole('button', { name: 'Show map' }).click();
        const iframe = page.locator('iframe[src*="maps.google.com"]');
        await expect(iframe).toHaveCount(1);
        await expect(iframe).toHaveAttribute('title', /\S/);
        await expect(page.locator('.map-consent')).toHaveCount(0);
      });
    }

    test('mobile menu opens and closes', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'phones only');
      await page.goto(url);
      const burger = page.locator('#burger');
      const firstLink = page.locator('#nav a').first();
      await burger.click();
      await expect(burger).toHaveAttribute('aria-expanded', 'true');
      await expect(firstLink).toBeVisible();
      await firstLink.click();
      await expect(burger).not.toHaveAttribute('aria-expanded', 'true');
    });

    test('fits the screen width', async ({ page }) => {
      await page.goto(url);
      expect(await hasNoHorizontalOverflow(page)).toBe(true);
    });

    test('every in-page menu link points at a section that exists', async ({ page }) => {
      await page.goto(url);
      const targets = await page.locator('a[href^="#"]').evaluateAll((as) =>
        as.map((a) => a.getAttribute('href')!).filter((h) => h.length > 1));
      for (const t of new Set(targets)) await expect(page.locator(t), t).toHaveCount(1);
    });
  });
}

test.describe('Demos page', () => {
  test('lists every demo once, grouped, with working screenshots', async ({ page, request }) => {
    await page.goto('/demos');
    const hrefs = await page.locator('a.card').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const d of STARTER_DEMOS) expect(hrefs.filter((h) => h === `/demos/${d.slug}/`), d.slug).toHaveLength(1);
    expect(hrefs).toContain('/demos/salon/');
    await expect(page.locator('h2.group-head')).toHaveCount(4);
    const imgs = await page.locator('a.card img').evaluateAll((is) => is.map((i) => i.getAttribute('src')!));
    for (const src of imgs) expect((await request.get(src)).status(), src).toBe(200);
  });
});
