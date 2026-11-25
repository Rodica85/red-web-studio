import { test, expect, openedUrls, parseWhatsApp, STUDIO_WHATSAPP, revealAll, hasNoHorizontalOverflow } from '../helpers';
import type { Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Homepage: header and navigation', () => {
  test('hero has a headline and a call to action', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.hero a[href*="wa.me"], .hero a[href^="#"]').first()).toBeVisible();
  });

  test('navbar gets the "scrolled" style after scrolling', async ({ page }) => {
    await expect(page.locator('#navbar')).not.toHaveClass(/scrolled/);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(page.locator('#navbar')).toHaveClass(/scrolled/);
  });

  for (const id of ['services', 'pricing', 'demos', 'about', 'contact']) {
    test(`menu link #${id} scrolls to its section`, async ({ page, isMobile }) => {
      if (isMobile) await page.locator('#hamburger').click();
      await page.locator(`#navLinks a[href="#${id}"]`).click();
      await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.1 });
      if (isMobile) await expect(page.locator('#navLinks')).not.toHaveClass(/active/);
    });
  }

  test('mobile menu opens and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phones only');
    const menu = page.locator('#navLinks');
    await page.locator('#hamburger').click();
    await expect(menu).toHaveClass(/active/);
    await expect(menu.locator('a[href="#pricing"]')).toBeVisible();
    await page.locator('#hamburger').click();
    await expect(menu).not.toHaveClass(/active/);
  });

  test('page fits the screen width', async ({ page }) => {
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('"Let\'s Talk" opens WhatsApp with a greeting', async ({ page }) => {
    const href = await page.locator('a.nav-pill').first().getAttribute('href');
    const wa = parseWhatsApp(href!);
    expect(wa.number).toBe(STUDIO_WHATSAPP);
    expect(wa.text).toContain('RED Web Studio');
  });
});

test.describe('Homepage: content', () => {
  test('pricing shows the three packages', async ({ page }) => {
    const prices = await page.locator('#pricing .price-amount').allInnerTexts();
    expect(prices.map((p) => p.replace(/\s/g, ''))).toEqual(['£349', '£790', '£1,290']);
    await expect(page.locator('#pricing')).toContainText('£2,200');
  });

  test('demos section shows six Starter demos and the booking demo', async ({ page, request }) => {
    const cards = page.locator('#demos .demo-card');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('#demos .demo-feature')).toHaveAttribute('href', '/demos/salon/');
    for (const href of await cards.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) {
      expect((await request.get(href!)).status(), href!).toBe(200);
    }
    await expect(page.locator('#demos a[href="/demos/"]')).toBeAttached();
  });

  test('FAQ: eight questions, only one open at a time', async ({ page }) => {
    await revealAll(page);
    const items = page.locator('.faq-item');
    await expect(items).toHaveCount(8);
    await items.nth(0).locator('summary').click();
    await expect(items.nth(0)).toHaveAttribute('open', '');
    await items.nth(1).locator('summary').click();
    await expect(items.nth(1)).toHaveAttribute('open', '');
    await expect(items.nth(0)).not.toHaveAttribute('open', '');
    await items.nth(1).locator('summary').click();
    await expect(items.nth(1)).not.toHaveAttribute('open', '');
  });

  test('projects carousel arrows scroll the cards', async ({ page }) => {
    await revealAll(page);
    const grid = page.locator('.work-grid');
    await grid.scrollIntoViewIfNeeded();
    const canScroll = await grid.evaluate((g) => g.scrollWidth > g.clientWidth + 5);
    test.skip(!canScroll, 'all project cards fit on this screen');
    const before = await grid.evaluate((g) => g.scrollLeft);
    await page.locator('.work-next').click();
    await expect.poll(() => grid.evaluate((g) => g.scrollLeft)).toBeGreaterThan(before);
    const middle = await grid.evaluate((g) => g.scrollLeft);
    await page.locator('.work-prev').click();
    await expect.poll(() => grid.evaluate((g) => g.scrollLeft)).toBeLessThan(middle);
  });

  test('every project card links to a live site in a new tab', async ({ page }) => {
    const cards = page.locator('#work a.work-card');
    expect(await cards.count()).toBeGreaterThan(3);
    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute('href', /^https:\/\//);
      await expect(card).toHaveAttribute('target', '_blank');
      await expect(card.locator('img')).toHaveAttribute('alt', /\S/);
    }
  });
});

test.describe('Homepage: contact form', () => {
  test('sends a complete message to RED Web Studio on WhatsApp', async ({ page }) => {
    const form = page.locator('#contactForm');
    await form.locator('[name="name"]').fill('Jane Tester');
    await form.locator('[name="email"]').fill('jane@example.com');
    await form.locator('[name="phone"]').fill('07700 900000');
    await form.locator('[name="business"]').fill('Jane’s Salon');
    await form.locator('[name="service"]').selectOption({ label: 'Business (up to 5 pages)' });
    await form.locator('[name="message"]').fill('I need a website with prices and booking.');
    await form.locator('button[type="submit"]').click();

    await expect.poll(() => openedUrls(page)).toHaveLength(1);
    const wa = parseWhatsApp((await openedUrls(page))[0]);
    expect(wa.number).toBe(STUDIO_WHATSAPP);
    for (const line of [
      'Name: Jane Tester',
      'Email: jane@example.com',
      'Phone: 07700 900000',
      'Business: Jane’s Salon',
      'Service needed: Business (up to 5 pages)',
      'Message: I need a website with prices and booking.',
    ]) expect(wa.text).toContain(line);

    await expect(form.locator('button[type="submit"]')).toContainText('Opening WhatsApp');
    await expect(form.locator('[name="name"]')).toHaveValue('', { timeout: 5_000 });
  });

  test('offers every package in the service list', async ({ page }) => {
    const options = await page.locator('#contactForm [name="service"] option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining([
      'Starter (one page)', 'Business (up to 5 pages)', 'Growth (up to 10 pages)', 'Custom project',
    ]));
  });

  const submit = (page: Page) => page.locator('#contactForm button[type="submit"]').click();
  const field = (page: Page, name: string) => page.locator(`#contactForm [name="${name}"]`);

  test('an empty form is not sent and says which fields are missing', async ({ page }) => {
    await submit(page);
    await expect(page.locator('#cf-error')).toBeVisible();
    await expect(page.locator('#cf-error')).toHaveText('Please fill in the fields marked *.');
    for (const name of ['name', 'message', 'email', 'phone']) {
      await expect(field(page, name)).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(field(page, 'name')).toBeFocused();
    expect(await openedUrls(page)).toEqual([]);
  });

  test('name and message are marked as required', async ({ page }) => {
    await expect(field(page, 'name')).toHaveAttribute('required', '');
    await expect(field(page, 'message')).toHaveAttribute('required', '');
    await expect(page.locator('label[for="cf-name"]')).toContainText('*');
    await expect(page.locator('label[for="cf-message"]')).toContainText('*');
  });

  test('needs an email or a phone number to reply to', async ({ page }) => {
    await field(page, 'name').fill('Jane Tester');
    await field(page, 'message').fill('Hello');
    await submit(page);
    await expect(page.locator('#cf-error')).toHaveText('Please leave an email or a phone number so we can reply.');
    await expect(field(page, 'email')).toBeFocused();
    expect(await openedUrls(page)).toEqual([]);
  });

  test('rejects a badly typed email', async ({ page }) => {
    await field(page, 'name').fill('Jane Tester');
    await field(page, 'message').fill('Hello');
    await field(page, 'email').fill('jane@');
    await submit(page);
    await expect(page.locator('#cf-error')).toHaveText('Please check the email address.');
    expect(await openedUrls(page)).toEqual([]);
  });

  for (const [contact, value] of [['phone', '07700 900000'], ['email', 'jane@example.com']]) {
    test(`is sent with only name, message and ${contact}`, async ({ page }) => {
      await submit(page); // show the error first, then fix it
      await expect(page.locator('#cf-error')).toBeVisible();
      await field(page, 'name').fill('Jane Tester');
      await field(page, 'message').fill('Hello');
      await field(page, contact).fill(value);
      await submit(page);
      await expect.poll(() => openedUrls(page)).toHaveLength(1);
      const wa = parseWhatsApp((await openedUrls(page))[0]);
      expect(wa.text).toContain('Name: Jane Tester');
      expect(wa.text).toContain(`${contact === 'phone' ? 'Phone' : 'Email'}: ${value}`);
      expect(wa.text).toContain('Business: -');
      await expect(page.locator('#cf-error')).toBeHidden();
      await expect(field(page, 'name')).not.toHaveAttribute('aria-invalid', 'true');
    });
  }
});
