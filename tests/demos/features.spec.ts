import { test, expect, openedUrls, parseWhatsApp } from '../helpers';

// ---------------------------------------------------------------- Removals: price calculator
test.describe('Removals: instant price calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/removals/');
    await page.locator('#estimate').scrollIntoViewIfNeeded();
  });

  const moves = [
    { van: 'Small van (1–2 items)', men: 'Driver only', hours: 2, price: 90 },
    { van: 'Medium van (studio / 1-bed)', men: 'Driver + 1 helper', hours: 3, price: 210 },
    { van: 'Medium van (studio / 1-bed)', men: 'Driver + 1 helper', hours: 5, price: 350 },
    { van: 'Large Luton van (2–3 bed)', men: 'Driver + 2 helpers', hours: 6, price: 600 },
    { van: 'Large Luton van (2–3 bed)', men: 'Driver + 2 helpers', hours: 10, price: 1000 },
  ];
  for (const m of moves) {
    test(`move: ${m.van}, ${m.men}, ${m.hours}h = £${m.price}`, async ({ page }) => {
      await page.locator('#van').selectOption({ label: m.van });
      await page.locator('#men').selectOption({ label: m.men });
      await page.locator('#hrs').fill(String(m.hours));
      await expect(page.locator('#hrs-out')).toHaveText(String(m.hours));
      await expect(page.locator('#res-price')).toHaveText(`£${m.price}`);
      const wa = parseWhatsApp((await page.locator('#res-wa').getAttribute('href'))!);
      expect(wa.number).toBe('447700900215');
      expect(wa.text).toContain(`Estimate £${m.price}.`);
      expect(wa.text).toContain(`about ${m.hours} hours`);
    });
  }

  const parcels = [
    { kg: 5, door: false, price: 25 },   // minimum charge
    { kg: 13, door: false, price: 25 },  // 23.40 rounds up to the minimum
    { kg: 20, door: true, price: 46 },   // 36 + 10 collection
    { kg: 40, door: true, price: 82 },
    { kg: 100, door: false, price: 180 },
  ];
  for (const p of parcels) {
    test(`parcel: ${p.kg} kg${p.door ? ' with collection' : ''} = £${p.price}`, async ({ page }) => {
      await page.getByRole('button', { name: 'Parcel to Romania' }).click();
      await page.locator('#kg').fill(String(p.kg));
      if (!p.door) await page.locator('#door').uncheck();
      await expect(page.locator('#res-price')).toHaveText(`£${p.price}`);
      const wa = parseWhatsApp((await page.locator('#res-wa').getAttribute('href'))!);
      expect(wa.text).toContain(`send ${p.kg} kg`);
      expect(wa.text).toContain(`Estimate £${p.price}.`);
    });
  }

  test('switching tabs shows only the matching fields', async ({ page }) => {
    await expect(page.locator('#f-move')).toBeVisible();
    await expect(page.locator('#f-parcel')).toBeHidden();
    await page.getByRole('button', { name: 'Parcel to Romania' }).click();
    await expect(page.locator('#f-move')).toBeHidden();
    await expect(page.locator('#f-parcel')).toBeVisible();
    await page.getByRole('button', { name: 'Move in the UK' }).click();
    await expect(page.locator('#f-move')).toBeVisible();
    await expect(page.locator('#res-price')).toHaveText('£210');
  });

  test('direction Romania → UK appears in the message', async ({ page }) => {
    await page.getByRole('button', { name: 'Parcel to Romania' }).click();
    await page.locator('#dir').selectOption({ label: 'Romania → UK' });
    const wa = parseWhatsApp((await page.locator('#res-wa').getAttribute('href'))!);
    expect(wa.text).toContain('Romania → UK');
  });
});

// ---------------------------------------------------------------- Photographer: portfolio filter
test.describe('Photographer: portfolio filter', () => {
  const counts: Record<string, number> = { All: 7, Portraits: 3, Family: 2, Events: 2 };
  for (const [label, n] of Object.entries(counts)) {
    test(`"${label}" shows ${n} photos`, async ({ page }) => {
      await page.goto('/demos/photographer/');
      await page.locator('.filters').getByRole('button', { name: label }).click();
      await expect(page.locator('.folio figure:not(.hide)')).toHaveCount(n);
      await expect(page.locator('.filters').getByRole('button', { name: label })).toHaveClass(/on/);
    });
  }
});

// ---------------------------------------------------------------- "Open now" signs (UK time)
const openSigns = [
  // Carpathia Deli: Mon–Sat 8am–9pm, Sun 9am–6pm
  { slug: 'food-shop', sel: '#open-sign', when: '2026-11-24T12:00:00Z', text: 'Open now · until 9pm', closed: false },
  { slug: 'food-shop', sel: '#open-sign', when: '2026-11-24T07:00:00Z', text: 'Closed now · opens today at 8am', closed: true },
  { slug: 'food-shop', sel: '#open-sign', when: '2026-11-24T21:30:00Z', text: 'Closed now · opens tomorrow at 8am', closed: true },
  { slug: 'food-shop', sel: '#open-sign', when: '2026-11-28T22:00:00Z', text: 'Closed now · opens tomorrow at 9am', closed: true },
  { slug: 'food-shop', sel: '#open-sign', when: '2026-11-29T10:00:00Z', text: 'Open now · until 6pm', closed: false },
  { slug: 'food-shop', sel: '#open-sign', when: '2026-11-29T19:00:00Z', text: 'Closed now · opens tomorrow at 8am', closed: true },
  { slug: 'food-shop', sel: '#open-sign', when: '2026-07-14T19:30:00Z', text: 'Open now · until 9pm', closed: false }, // summer time: 8:30pm in London
  // Crumb & Co. café: Mon–Fri 7:30am–4pm, Sat–Sun 8:30am–4pm
  { slug: 'cafe', sel: '#openNow', when: '2026-11-24T10:00:00Z', text: 'Open now · until 4pm', closed: false },
  { slug: 'cafe', sel: '#openNow', when: '2026-11-24T06:00:00Z', text: 'Closed now · open today 7:30am', closed: true },
  { slug: 'cafe', sel: '#openNow', when: '2026-11-27T17:00:00Z', text: 'Closed now · open tomorrow 8:30am', closed: true },
  { slug: 'cafe', sel: '#openNow', when: '2026-11-29T17:00:00Z', text: 'Closed now · open tomorrow 7:30am', closed: true },
];

test.describe('"Open now" signs', () => {
  for (const s of openSigns) {
    test(`${s.slug} at ${s.when} says "${s.text}"`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(s.when));
      await page.goto(`/demos/${s.slug}/`);
      await expect(page.locator(s.sel)).toHaveText(s.text);
    });
  }
});

// ---------------------------------------------------------------- Café: menu tabs
test.describe('Café: menu tabs', () => {
  for (const tab of ['Coffee', 'Bakes', 'Brunch']) {
    test(`"${tab}" tab shows its menu only`, async ({ page }) => {
      await page.goto('/demos/cafe/');
      const button = page.getByRole('tab', { name: tab });
      await button.click();
      await expect(button).toHaveAttribute('aria-selected', 'true');
      const id = await button.getAttribute('data-t');
      await expect(page.locator(`.menu#${id}`)).toHaveClass(/\bon\b/);
      await expect(page.locator('.menu.on')).toHaveCount(1);
    });
  }
});

// ---------------------------------------------------------------- Catering: packages and lightbox
test.describe('Catering: packages and gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/catering/');
  });

  test('packages are listed, each with a WhatsApp booking link', async ({ page }) => {
    const cards = page.locator('#cards .card');
    expect(await cards.count()).toBeGreaterThan(1);
    for (const card of await cards.all()) {
      await expect(card.locator('h3')).toHaveText(/\S/);
      const wa = parseWhatsApp((await card.locator('a[href*="wa.me"]').getAttribute('href'))!);
      expect(wa.number).toBe('447700900123');
      expect(wa.text.toLowerCase()).toContain((await card.locator('h3').textContent())!.trim().toLowerCase());
    }
  });

  test('gallery lightbox opens, moves with arrows and closes with Escape', async ({ page }) => {
    const items = page.locator('#galleryGrid .gallery__item');
    const total = await items.count();
    expect(total).toBeGreaterThan(1);
    const lb = page.locator('#lightbox');
    await items.first().scrollIntoViewIfNeeded();
    await items.first().click();
    await expect(lb).toBeVisible();
    const first = await lb.locator('img').getAttribute('src');
    await page.keyboard.press('ArrowRight');
    await expect(lb.locator('img')).not.toHaveAttribute('src', first!);
    await page.keyboard.press('ArrowLeft');
    await expect(lb.locator('img')).toHaveAttribute('src', first!);
    await page.keyboard.press('ArrowLeft'); // wraps round to the last photo
    await expect(lb.locator('img')).not.toHaveAttribute('src', first!);
    await page.keyboard.press('Escape');
    await expect(lb).toBeHidden();
  });

  test('hero WhatsApp button has a message ready', async ({ page }) => {
    const wa = parseWhatsApp((await page.locator('#heroWa').getAttribute('href'))!);
    expect(wa.number).toBe('447700900123');
    expect(wa.text.length).toBeGreaterThan(10);
  });
});

// ---------------------------------------------------------------- Prices shown on demos
test.describe('Demo price lists', () => {
  test('grooming prices by dog size', async ({ page }) => {
    await page.goto('/demos/grooming/');
    const fullGroom = page.locator('table.ptable tr', { hasText: 'Full groom' });
    await expect(fullGroom.locator('td.p')).toHaveText(['£40', '£50', '£65']);
  });

  test('cakes sizes and serving counts', async ({ page }) => {
    await page.goto('/demos/cakes/');
    for (const [size, price] of [['6" round', '£45'], ['8" round', '£65'], ['10" round', '£90']]) {
      await expect(page.locator('.size', { hasText: size }).locator('.price-tag')).toHaveText(price);
    }
  });

  test('garage MOT price', async ({ page }) => {
    await page.goto('/demos/garage/');
    await expect(page.locator('.card', { hasText: 'MOT test' }).locator('.price-tag')).toHaveText('£45');
  });

  test('nails menu has three sections with prices', async ({ page }) => {
    await page.goto('/demos/nails/');
    await expect(page.locator('.menu-cat h3')).toHaveText(['Hands', 'Feet', 'Lashes & brows']);
    expect(await page.locator('.mrow b').count()).toBeGreaterThanOrEqual(12);
  });
});

test('WhatsApp float button on a demo opens a chat with the business', async ({ page }) => {
  await page.goto('/demos/nails/');
  const href = await page.locator('a.wa').getAttribute('href');
  expect(parseWhatsApp(href!).number).toBe('447700900212');
  expect(await openedUrls(page)).toEqual([]);
});
