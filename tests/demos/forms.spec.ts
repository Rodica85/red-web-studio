import { test, expect, openedUrls, parseWhatsApp } from '../helpers';

/**
 * Every demo form opens WhatsApp with a ready-written message.
 * For each one: an empty submit is blocked (where fields are required),
 * and a filled-in form sends every answer to the right number.
 */
type Case = {
  slug: string;
  wa: string;
  form: string;
  fill: Record<string, string>; // selector -> value ("select:" prefix picks an option label)
  expect: string[];
  requiredEmptyBlocked?: boolean;
};

const CASES: Case[] = [
  {
    slug: 'grooming', wa: '447700900211', form: 'form.wa-form',
    fill: { '[name="dog"]': 'Luna', '[name="breed"]': 'Cockapoo', '[name="service"]': 'select:Bath & tidy', '[name="day"]': 'select:Saturday', '[name="notes"]': 'A bit nervous' },
    expect: ["Hi Pawfect Grooming, I'd like to book a groom.", "Dog's name: Luna", 'Breed: Cockapoo', 'Service: Bath & tidy', 'Preferred day: Saturday', 'Anything we should know?: A bit nervous'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'nails', wa: '447700900212', form: 'form.wa-form',
    fill: { '[name="name"]': 'Amy', '[name="treatment"]': 'select:BIAB overlay', '[name="date"]': '2026-12-05', '[name="time"]': 'select:Afternoon', '[name="notes"]': 'Nude almond' },
    expect: ['Your name: Amy', 'Treatment: BIAB overlay', 'Preferred date: 2026-12-05', 'Preferred time: Afternoon', 'Design ideas: Nude almond'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'cakes', wa: '447700900213', form: 'form.wa-form',
    fill: { '[name="name"]': 'Sam', '[name="date"]': '2026-12-20', '[name="occasion"]': 'select:Wedding', '[name="size"]': 'select:Tiered', '[name="flavour"]': 'Red velvet', '[name="design"]': 'White and gold' },
    expect: ['Your name: Sam', 'Date needed: 2026-12-20', 'Occasion: Wedding', 'Size: Tiered', 'Flavour: Red velvet', 'Design and message on the cake: White and gold'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'garage', wa: '447700900214', form: 'form.wa-form',
    fill: { '[name="reg"]': 'AB12 CDE', '[name="car"]': 'Ford Focus', '[name="job"]': 'select:Brakes', '[name="when"]': 'select:This week', '[name="problem"]': 'Squeaky brakes' },
    expect: ['Registration: AB12 CDE', 'Make & model: Ford Focus', 'What do you need?: Brakes', 'When?: This week', 'Describe the problem: Squeaky brakes'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'photographer', wa: '447700900216', form: 'form.wa-form',
    fill: { '[name="name"]': 'Dan', '[name="session"]': 'select:Family', '[name="date"]': '2026-12-06', '[name="where"]': 'University Parks', '[name="notes"]': 'Two kids and a dog' },
    expect: ['Your name: Dan', 'Session: Family', 'Preferred date: 2026-12-06', 'Location idea: University Parks', 'Tell me about the shoot: Two kids and a dog'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'food-shop', wa: '447700900217', form: 'form.wa-form',
    fill: { '[name="name"]': 'Ioana', '[name="date"]': '2026-12-23', '[name="tray"]': 'select:Sarmale tray', '[name="people"]': '25', '[name="lang"]': 'select:Română', '[name="notes"]': 'Fără porc' },
    expect: ['Bună ziua!', 'Your name: Ioana', 'Collection date: 2026-12-23', 'What would you like?: Sarmale tray', 'Number of guests: 25', 'Prefer to talk in: Română', 'Notes: Fără porc'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'catering', wa: '447700900123', form: '#quoteForm',
    fill: { '[name="name"]': 'Tom', '[name="phone"]': '07700 900999', '[name="guests"]': '60', '[name="location"]': 'Reading' },
    expect: ['Tom', '07700 900999', '60', 'Reading'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'cleaning', wa: '447700900403', form: '#form',
    fill: { '#f-name': 'Priya', '#f-pc': 'M1 2AB' },
    expect: ["Hi Fresh Nest, I'm Priya.", 'postcode M1 2AB'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'fitness', wa: '447700900605', form: '#form',
    fill: { '#f-name': 'Chris' },
    expect: ["Hi Alex, I'm Chris.", 'free consultation'],
    requiredEmptyBlocked: true,
  },
  {
    slug: 'trades', wa: '447700900302', form: '#quote',
    fill: { '#q-name': 'Mo', '#q-pc': 'LS1 4AP' },
    expect: ["Hi Brightline, I'm Mo.", 'Postcode: LS1 4AP'],
    requiredEmptyBlocked: true,
  },
];

for (const c of CASES) {
  test.describe(`Form: ${c.slug}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/demos/${c.slug}/`);
    });

    if (c.requiredEmptyBlocked) {
      test('an empty form is not sent', async ({ page }) => {
        const form = page.locator(c.form);
        await form.scrollIntoViewIfNeeded();
        await form.locator('[type="submit"]').click();
        await page.waitForTimeout(300);
        expect(await openedUrls(page)).toEqual([]);
      });
    }

    test('a filled-in form sends every answer on WhatsApp', async ({ page }) => {
      const form = page.locator(c.form);
      await form.scrollIntoViewIfNeeded();
      for (const [sel, value] of Object.entries(c.fill)) {
        const field = form.locator(sel);
        if (value.startsWith('select:')) await field.selectOption({ label: value.slice(7) });
        else await field.fill(value);
      }
      await form.locator('[type="submit"]').click();
      await expect.poll(() => openedUrls(page)).toHaveLength(1);
      const wa = parseWhatsApp((await openedUrls(page))[0]);
      expect(wa.number).toBe(c.wa);
      for (const line of c.expect) expect(wa.text).toContain(line);
    });
  });
}
