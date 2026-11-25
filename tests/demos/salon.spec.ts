import { test, expect, type Page } from '../helpers';

// Willow & Thames: salon website with online booking and a salon dashboard.
// The clock is fixed to Tuesday 24 November 2026, 9am (UK) so slots are predictable.
const NOW = new Date('2026-11-24T09:00:00Z');
const STORE = 'wt_demo_bookings_v1';
const TODAY = '2026-11-24'; // Tuesday
const MONDAY = '2026-11-30';
const SUNDAY = '2026-11-29';

async function openSite(page: Page) {
  await page.clock.setFixedTime(NOW);
  await page.goto('/demos/salon/');
}

async function bookings(page: Page): Promise<any[]> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), STORE);
}

/** Walk the booking panel to the details step and return the chosen slot. */
async function goToDetails(page: Page, service = 'cut-f', staff = 'any') {
  await page.locator('[data-book]:visible').first().click();
  const panel = page.locator('#booking');
  await expect(panel).toHaveClass(/open/);
  await panel.locator(`[data-svc="${service}"]`).click();
  await panel.locator(`[data-staff="${staff}"]`).click();
  await expect(page.locator('#bk-title')).toHaveText('Pick a time');
  const slot = panel.locator('.slot').first();
  const time = (await slot.textContent())!.trim();
  const day = await panel.locator('.day.sel').getAttribute('data-day');
  await slot.click();
  await page.locator('#bk-next').click();
  await expect(page.locator('#bk-title')).toHaveText('Your details');
  return { time, day };
}

async function fillDetails(page: Page, { name = 'Test Client', phone = '07700 900123', terms = true } = {}) {
  await page.locator('#f-name').fill(name);
  await page.locator('#f-phone').fill(phone);
  if (terms) await page.locator('#f-terms').check();
}

test.describe('Salon website', () => {
  test.beforeEach(async ({ page }) => openSite(page));

  test('service tabs switch the price list', async ({ page }) => {
    const tabs = page.locator('#tabs .tab');
    await expect(tabs).toHaveText(['Cut & Style', 'Colour', 'Treatments']);
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#svc-list')).toContainText('Balayage');
    await expect(page.locator('#svc-list')).not.toContainText("Men's cut");
    await expect(page.locator('#svc-cap')).toHaveText('Colour');
  });

  test('team shows three stylists, each with a "Book with" button', async ({ page }) => {
    await expect(page.locator('#team-grid .member')).toHaveCount(3);
    await expect(page.locator('[data-book-staff]')).toHaveCount(3);
  });

  test('opening hours mark Monday as closed', async ({ page }) => {
    await expect(page.locator('#hours tr', { hasText: 'Monday' })).toContainText('Closed');
    await expect(page.locator('#hours tr.today')).toContainText('Tuesday');
  });

  test('full booking: service → any stylist → time → details → booked', async ({ page }) => {
    const { time, day } = await goToDetails(page);
    await expect(page.locator('.recap')).toContainText("Women's cut & blow-dry");
    await fillDetails(page);
    await page.locator('#bk-next').click();
    await expect(page.locator('#bk-title')).toHaveText('Booked');
    await expect(page.locator('.done h4')).toHaveText("You're booked in!");
    await expect(page.locator('.done')).toContainText(time);

    const saved = (await bookings(page)).filter((b) => b.name === 'Test Client');
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ date: day, service: 'cut-f', source: 'website', phone: '07700 900123' });

    await page.locator('#bk-next').click(); // "Done"
    await expect(page.locator('#booking')).not.toHaveClass(/open/);
  });

  test('"Book" on a service skips straight to choosing a stylist', async ({ page }) => {
    await page.locator('#svc-list [data-book="cut-m"]').click();
    await expect(page.locator('#bk-title')).toHaveText('Choose a stylist');
    await expect(page.locator('#bk-foot')).toContainText("Men's cut");
  });

  test('booking with Tom only offers the services Tom does', async ({ page }) => {
    await page.locator('[data-book-staff="tom"]').click();
    await expect(page.locator('#bk-title')).toHaveText('Choose a service');
    await expect(page.locator('[data-svc="cut-m"]')).toBeVisible();
    await expect(page.locator('[data-svc="bal"]')).toHaveCount(0);
    await expect(page.locator('[data-svc="full"]')).toHaveCount(0);
  });

  test('closed days cannot be picked and today starts an hour from now', async ({ page }) => {
    await page.locator('[data-book]:visible').first().click();
    await page.locator('[data-svc="cut-m"]').click();
    await page.locator('[data-staff="any"]').click();
    await expect(page.locator(`.day[data-day="${MONDAY}"]`)).toBeDisabled();
    await expect(page.locator(`.day[data-day="${SUNDAY}"]`)).toBeDisabled();
    const todayBtn = page.locator(`.day[data-day="${TODAY}"]`);
    if (await todayBtn.isEnabled()) {
      await todayBtn.click();
      const first = (await page.locator('.slot').first().textContent())!.trim();
      expect(first >= '10:00', `first slot today is ${first}`).toBe(true);
    }
  });

  test('Continue stays disabled until a time is chosen', async ({ page }) => {
    await page.locator('[data-book]:visible').first().click();
    await page.locator('[data-svc="cut-f"]').click();
    await page.locator('[data-staff="any"]').click();
    await expect(page.locator('#bk-next')).toBeDisabled();
    await page.locator('.slot').first().click();
    await expect(page.locator('#bk-next')).toBeEnabled();
  });

  for (const c of [
    { name: '', phone: '07700 900123', terms: true, error: 'Please enter your name.' },
    { name: 'Ann', phone: '12345', terms: true, error: 'Please enter a valid mobile number.' },
    { name: 'Ann', phone: '07700 900123', terms: false, error: 'Please accept the cancellation policy.' },
  ]) {
    test(`details are checked: "${c.error}"`, async ({ page }) => {
      await goToDetails(page);
      await fillDetails(page, c);
      await page.locator('#bk-next').click();
      await expect(page.locator('#f-err')).toHaveText(c.error);
      await expect(page.locator('#bk-title')).toHaveText('Your details');
      expect((await bookings(page)).filter((b) => b.source === 'website' && b.created)).toHaveLength(0);
    });
  }

  test('a slot taken in the meantime is refused', async ({ page }) => {
    const { day } = await goToDetails(page, 'cut-m', 'tom');
    // Someone else books Tom for the whole day while the visitor is typing.
    await page.evaluate(([k, date]) => {
      const all = JSON.parse(localStorage.getItem(k) || '[]');
      all.push({ id: 'x', type: 'block', date, start: 0, dur: 1440, staff: 'tom', name: 'Taken' });
      localStorage.setItem(k, JSON.stringify(all));
    }, [STORE, day!]);
    await fillDetails(page);
    await page.locator('#bk-next').click();
    await expect(page.locator('#f-err')).toContainText('that time was just taken');
    await expect(page.locator('#bk-title')).toHaveText('Pick a time', { timeout: 5_000 });
  });

  test('back, close and Escape work', async ({ page }) => {
    await page.locator('[data-book]:visible').first().click();
    await page.locator('[data-svc="cut-f"]').click();
    await expect(page.locator('#bk-title')).toHaveText('Choose a stylist');
    await page.locator('#bk-back').click();
    await expect(page.locator('#bk-title')).toHaveText('Choose a service');
    await page.locator('#bk-close').click();
    await expect(page.locator('#booking')).not.toHaveClass(/open/);
    await page.locator('[data-book]:visible').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#booking')).not.toHaveClass(/open/);
  });
});

test.describe('Salon dashboard', () => {
  async function openAdmin(page: Page, day = TODAY) {
    await page.clock.setFixedTime(NOW);
    await page.goto('/demos/salon/admin');
    await page.locator('#pick').fill(day);
    await page.locator('#pick').dispatchEvent('change');
  }

  test('a booking made on the website appears in the calendar, marked new', async ({ page }) => {
    await openSite(page);
    const { day } = await goToDetails(page, 'cut-m', 'tom');
    await fillDetails(page, { name: 'From Website' });
    await page.locator('#bk-next').click();
    await expect(page.locator('#bk-title')).toHaveText('Booked');

    await openAdmin(page, day!);
    const appt = page.locator('.appt', { hasText: 'From Website' });
    await expect(appt).toHaveCount(1);
    await expect(appt).toHaveClass(/new/);
    await expect(appt.locator('.tag')).toHaveCount(1); // "booked online" dot
  });

  test('shows stats and one column per stylist working that day', async ({ page }) => {
    await openAdmin(page, '2026-11-26'); // Thursday: all three work
    await expect(page.locator('#stats .stat')).toHaveCount(4);
    await expect(page.locator('.col')).toHaveCount(3);
    await openAdmin(page, TODAY); // Tuesday: Tom is off
    await expect(page.locator('.col')).toHaveCount(2);
  });

  test('closed days say so', async ({ page }) => {
    await openAdmin(page, MONDAY);
    await expect(page.locator('#cal')).toContainText('closed');
  });

  test('previous / next / today move between days', async ({ page }) => {
    await openAdmin(page, TODAY);
    await page.locator('#next').click();
    await expect(page.locator('#pick')).toHaveValue('2026-11-25');
    await page.locator('#prev').click();
    await page.locator('#prev').click();
    await expect(page.locator('#pick')).toHaveValue('2026-11-23');
    await page.locator('#today').click();
    await expect(page.locator('#pick')).toHaveValue(TODAY);
    await expect(page.locator('#day-title')).toContainText('Today');
  });

  test('adds a phone booking and refuses a clash', async ({ page }) => {
    await openAdmin(page, '2026-11-26');
    const free = await page.evaluate(() => (window as any).slotsFor('2026-11-26', 'blow', 'priya')[0].start);
    const before = await page.locator('.appt').count();

    await page.locator('#add-btn').click();
    await page.locator('#n-staff').selectOption('priya');
    await page.locator('#n-start').selectOption(String(free));
    await page.locator('#n-svc').selectOption('blow');
    await page.locator('#n-name').fill('Phone Client');
    await page.locator('#n-save').click();
    await expect(page.locator('#modal')).not.toHaveClass(/open/);
    await expect(page.locator('.appt')).toHaveCount(before + 1);
    await expect(page.locator('#toast')).toContainText('Booking added');

    await page.locator('#add-btn').click();
    await page.locator('#n-staff').selectOption('priya');
    await page.locator('#n-start').selectOption(String(free));
    await page.locator('#n-svc').selectOption('blow');
    await page.locator('#n-name').fill('Clash');
    await page.locator('#n-save').click();
    await expect(page.locator('#n-err')).toHaveText('That clashes with another booking.');
  });

  test('refuses services a stylist does not offer, missing names and running past closing', async ({ page }) => {
    await openAdmin(page, '2026-11-26');
    await page.locator('#add-btn').click();
    await page.locator('#n-staff').selectOption('tom');
    await page.locator('#n-svc').selectOption('bal');
    await page.locator('#n-name').fill('X');
    await page.locator('#n-save').click();
    await expect(page.locator('#n-err')).toContainText("doesn't offer this service");

    await page.locator('#n-staff').selectOption('emma');
    await page.locator('#n-svc').selectOption('blow');
    await page.locator('#n-name').fill('');
    await page.locator('#n-save').click();
    await expect(page.locator('#n-err')).toHaveText("Please add the client's name.");

    await page.locator('#n-name').fill('Late');
    await page.locator('#n-svc').selectOption('bal'); // 3 hours
    await page.locator('#n-start').selectOption({ label: '19:00' }); // Thursday closes at 8pm
    await page.locator('#n-save').click();
    await expect(page.locator('#n-err')).toHaveText('That runs past closing time.');
  });

  test('blocks time, then removes the block', async ({ page }) => {
    await openAdmin(page, TODAY);
    await page.evaluate(() => {
      // Clear Emma's day so the block always fits.
      const k = 'wt_demo_bookings_v1';
      const all = JSON.parse(localStorage.getItem(k)!).filter((b: any) => !(b.date === '2026-11-24' && b.staff === 'emma'));
      localStorage.setItem(k, JSON.stringify(all));
      (window as any).render();
    });
    await page.locator('#add-btn').click();
    await page.locator('[data-m="block"]').click();
    await page.locator('#n-staff').selectOption('emma');
    await page.locator('#n-start').selectOption({ label: '13:00' });
    await page.locator('#n-dur').selectOption('60');
    await page.locator('#n-reason').fill('Lunch');
    await page.locator('#n-save').click();
    const block = page.locator('.appt.block', { hasText: 'Lunch' });
    await expect(block).toHaveCount(1);

    await block.click();
    await page.locator('#v-del').click();
    await page.locator('#c-yes').click();
    await expect(page.locator('.appt.block', { hasText: 'Lunch' })).toHaveCount(0);
  });

  test('cancelling asks first: "Go back" keeps it, confirming removes it', async ({ page }) => {
    await openAdmin(page, '2026-11-26');
    const appt = page.locator('.appt:not(.block)').first();
    const id = await appt.getAttribute('data-id');
    await appt.click();
    await page.locator('#v-del').click();
    await page.locator('#c-no').click();
    await expect(page.locator(`.appt[data-id="${id}"]`)).toHaveCount(1);

    await page.locator(`.appt[data-id="${id}"]`).click();
    await page.locator('#v-del').click();
    await page.locator('#c-yes').click();
    await expect(page.locator(`.appt[data-id="${id}"]`)).toHaveCount(0);
    await expect(page.locator('#toast')).toContainText('Booking cancelled');
  });

  test('"Reset demo data" brings back the sample bookings', async ({ page }) => {
    await openAdmin(page, '2026-11-26');
    const seeded = await page.locator('.appt').count();
    await page.evaluate(() => { localStorage.setItem('wt_demo_bookings_v1', '[]'); (window as any).render(); });
    await expect(page.locator('.appt')).toHaveCount(0);
    await page.locator('#reset').click();
    await page.locator('#c-yes').click();
    await expect(page.locator('.appt')).toHaveCount(seeded);
  });

  test('works without browser storage (private mode)', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage blocked'); } });
    });
    await openSite(page);
    await goToDetails(page);
    await fillDetails(page);
    await page.locator('#bk-next').click();
    await expect(page.locator('#bk-title')).toHaveText('Booked');
  });
});
