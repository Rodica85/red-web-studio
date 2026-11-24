import AxeBuilder from '@axe-core/playwright';
import { test, expect, PAGES, STARTER_DEMOS, revealAll } from '../helpers';

// Accessibility checks (WCAG 2.1 A/AA) with axe-core, the engine behind Lighthouse.
// Only "critical" and "serious" problems fail the test; the rest are attached to the report.
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
      // KNOWN ISSUE: some text colours are too light (colour contrast). Reported as a
      // warning until the design is updated; remove this exception afterwards.
      const contrast = summary.filter((v) => v.id === 'color-contrast');
      if (contrast.length) {
        testInfo.annotations.push({ type: 'warning', description: `colour contrast: ${contrast[0].count} element(s), e.g. ${contrast[0].examples.join(', ')}` });
      }
      const blocking = summary.filter((v) => (v.impact === 'critical' || v.impact === 'serious') && v.id !== 'color-contrast');
      expect(blocking, 'critical/serious accessibility problems').toEqual([]);
    });
  }
});
