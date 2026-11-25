import { test, expect, PAGES, SITE, ALLOWED_HOSTS } from '../helpers';

test.describe('SEO files', () => {
  test('robots.txt allows crawling', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-agent: \*/);
    expect(body).not.toMatch(/Disallow: \/\s*$/m);
  });

  test('sitemap.xml lists every main page, and every URL in it works', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(10);
    for (const loc of locs) {
      expect(loc.startsWith(SITE), `${loc} uses the www domain`).toBe(true);
      expect((await request.get(new URL(loc).pathname)).status(), loc).toBe(200);
    }
    for (const lastmod of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
      expect(lastmod[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const listed = new Set(locs.map((l) => new URL(l).pathname.replace(/\/$/, '') || '/'));
    for (const p of PAGES) expect(listed.has(p), `${p} is in the sitemap`).toBe(true);
  });

  test('llms.txt exists and its links to this site work', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('# RED Web Studio');
    const links = [...text.matchAll(/https:\/\/(?:www\.)?redwebstudio\.com(\/[^)\s]*)?/g)].map((m) => m[1] || '/');
    for (const p of new Set(links)) {
      const path = p.split('#')[0] || '/';
      expect((await request.get(path)).status(), `llms.txt link ${p}`).toBe(200);
    }
  });
});

test.describe('Privacy: no cookies, no trackers', () => {
  for (const path of PAGES) {
    test(`${path} sets no cookies and only contacts expected hosts`, async ({ page, context }) => {
      const hosts = new Set<string>();
      page.on('request', (r) => hosts.add(new URL(r.url()).hostname));
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await context.cookies()).toEqual([]);
      const unexpected = [...hosts].filter((h) => !ALLOWED_HOSTS.includes(h));
      expect(unexpected, 'unexpected third-party hosts').toEqual([]);
      const storage = await page.evaluate(() => Object.keys(localStorage));
      expect(storage, 'localStorage keys').toEqual([]);
    });
  }

  test('no analytics or advertising scripts anywhere', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const html = await page.content();
      expect(html, path).not.toMatch(/googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook\.net|hotjar|clarity\.ms/);
    }
  });
});

test.describe('Privacy policy content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy-policy');
  });

  test('states the key promises', async ({ page }) => {
    const text = await page.locator('main, body').first().innerText();
    expect(text).toMatch(/Last updated: \d{1,2} \w+ \d{4}/);
    expect(text).toContain('This website sets no cookies');
    expect(text).toContain('deleted within 3 months');
    expect(text).toContain('Our demo websites');
    expect(text).toContain('ico.org.uk');
  });

  test('links to the ICO and Google privacy pages open safely', async ({ page }) => {
    await expect(page.locator('a[href*="ico.org.uk"]')).toHaveCount(1);
    await expect(page.locator('a[href="https://policies.google.com/privacy"]')).toHaveAttribute('rel', /noopener/);
  });
});
