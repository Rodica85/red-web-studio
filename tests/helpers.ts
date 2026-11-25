import { test as base, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const SITE = 'https://www.redwebstudio.com';
export const STUDIO_WHATSAPP = '447424714686';
export const WEBSITE_DIR = path.join(__dirname, '..', 'website');

/** Main site pages (path, file on disk). The 404 page is tested on its own. */
export const PAGES = [
  '/',
  '/services/website-design',
  '/services/seo-optimisation',
  '/services/ecommerce',
  '/services/ai-chatbot',
  '/services/branding-logo',
  '/services/testing',
  '/web-design-for-salons',
  '/web-design-for-tradespeople',
  '/web-design-for-wellness',
  '/web-design-oxfordshire',
  '/how-much-does-a-website-cost-uk',
  '/privacy-policy',
  '/demos',
];

/** One-page Starter demos: slug, WhatsApp number, whether it has a map. */
export const STARTER_DEMOS: { slug: string; wa: string; map: boolean }[] = [
  { slug: 'barber', wa: '447700900201', map: true },
  { slug: 'trades', wa: '447700900302', map: true },
  { slug: 'cleaning', wa: '447700900403', map: false },
  { slug: 'cafe', wa: '447700900504', map: true },
  { slug: 'fitness', wa: '447700900605', map: false },
  { slug: 'catering', wa: '447700900123', map: true },
  { slug: 'grooming', wa: '447700900211', map: true },
  { slug: 'nails', wa: '447700900212', map: true },
  { slug: 'cakes', wa: '447700900213', map: true },
  { slug: 'garage', wa: '447700900214', map: true },
  { slug: 'removals', wa: '447700900215', map: true },
  { slug: 'photographer', wa: '447700900216', map: true },
  { slug: 'food-shop', wa: '447700900217', map: true },
];

/** Hosts a page may contact while loading, before any click. */
export const ALLOWED_HOSTS = [
  'localhost',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'chat-widget.musteata-rodica.workers.dev',
  'images.unsplash.com',
];

export function fileFor(urlPath: string): string {
  const clean = urlPath.replace(/\/$/, '');
  const candidates = [
    path.join(WEBSITE_DIR, clean, 'index.html'),
    path.join(WEBSITE_DIR, clean + '.html'),
    path.join(WEBSITE_DIR, clean),
  ];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? '';
}

/** Every .html file under website/, as a URL path. */
export function allHtmlPaths(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.html')) out.push('/' + path.relative(WEBSITE_DIR, full).replace(/\\/g, '/'));
    }
  };
  walk(WEBSITE_DIR);
  return out.sort();
}

/**
 * Shared test fixture:
 * - stubs the external chat widget (it only answers on the live domain),
 * - records window.open calls instead of opening WhatsApp,
 * - fails the test on any uncaught JavaScript error in the page.
 */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route('**/chat-widget.musteata-rodica.workers.dev/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* chat widget stubbed in tests */' }),
      );
      await page.addInitScript(() => {
        (window as any).__opened = [];
        window.open = ((url?: string | URL) => {
          (window as any).__opened.push(String(url));
          return null;
        }) as typeof window.open;
      });
      await use(errors);
      expect(errors, 'uncaught JavaScript errors in the page').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** URLs passed to window.open since the page loaded. */
export async function openedUrls(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as any).__opened as string[]);
}

/** Decode a wa.me link into its number and message. */
export function parseWhatsApp(url: string): { number: string; text: string } {
  const u = new URL(url);
  expect(u.hostname).toBe('wa.me');
  return { number: u.pathname.replace('/', ''), text: u.searchParams.get('text') ?? '' };
}

/** True when nothing on the page is wider than the viewport. */
export async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

/** Show elements that only appear on scroll, so they can be checked straight away. */
export async function revealAll(page: Page) {
  await page.evaluate(() => {
    // Skip fade-in animations so checks see the final colours.
    const s = document.createElement("style");
    s.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
    document.head.appendChild(s);
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('.fall-in, .reveal').forEach((el) => el.classList.add('visible', 'in'));
  });
}
