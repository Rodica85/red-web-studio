import AxeBuilder from '@axe-core/playwright';
import { test, expect, PAGES, STARTER_DEMOS, revealAll } from '../helpers';

// Accessibility checks (WCAG 2.1 A/AA) with axe-core, the engine behind Lighthouse.
// "Critical" and "serious" problems (including colour contrast) fail the test;
// the full list is attached to the report.
const pages = [...PAGES, ...STARTER_DEMOS.map((d) => `/demos/${d.slug}/`), '/demos/salon/', '/demos/salon/admin'];

test.describe('Accessibility', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile, 'run once, in desktop Chrome');

  for (const path of pages) {
    test(`${path} has no critical or serious accessibility problems`, async ({ page }, testInfo) => {
      await page.goto(path);
      await revealAll(page);
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        count: v.nodes.length,
        examples: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
      }));
      await testInfo.attach('axe-violations.json', { body: JSON.stringify(summary, null, 2), contentType: 'application/json' });
      const blocking = summary.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(blocking, 'critical/serious accessibility problems').toEqual([]);
    });
  }
});
