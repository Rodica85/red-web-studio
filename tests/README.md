# Automated tests

End-to-end tests for redwebstudio.com and every demo website, written with
[Playwright](https://playwright.dev). They run in Chrome, Firefox and Safari
(WebKit), plus an Android phone and an iPhone, against a local copy of `website/`.

## Run them

```bash
npm install                      # once
npx playwright install           # once: downloads the test browsers
npm test                         # everything, all browsers
npm run test:chromium            # quick run in Chrome only
npm run test:ui                  # interactive mode: watch each step
npm run report                   # open the last HTML report
```

GitHub runs the same tests on every pull request and on every push to `main`
(see `.github/workflows/tests.yml`). The HTML report is attached to each run.

## What is covered

| File | What it checks |
|---|---|
| `site/pages.spec.ts` | every page loads, title, description, www canonical, one h1, image alt text, footer links, JSON-LD, Open Graph image, 404 page, no broken internal links, safe new-tab links |
| `site/home.spec.ts` | menu links scroll to sections, mobile menu, navbar on scroll, prices, demos section, FAQ (one open at a time), projects carousel, contact form → WhatsApp message |
| `site/seo-and-privacy.spec.ts` | robots.txt, sitemap (every URL works, every page listed), llms.txt links, no cookies, no trackers, only expected third parties, privacy policy content |
| `site/accessibility.spec.ts` | WCAG 2.1 AA checks with axe-core on every page and demo (desktop Chrome) |
| `demos/demos.spec.ts` | each demo: demo label, noindex, link previews, WhatsApp number, year, no requests to Google before "Show map", map loads on click, mobile menu, fits phone screens, in-page links |
| `demos/forms.spec.ts` | every demo form: empty form blocked, filled form sends every answer to the right number |
| `demos/features.spec.ts` | removals price calculator, photographer filter, "open now" signs at fixed UK times (incl. summer time), café menu tabs, catering packages and lightbox, demo prices |
| `demos/salon.spec.ts` | salon booking from start to finish, validation, closed days, double-booking, dashboard: new bookings, stats, day navigation, phone bookings, clashes, blocks, cancelling, reset, private mode |

## Known issues the tests report

- **Colour contrast**: some light text (eyebrows, tags, footer) is below the
  WCAG AA contrast ratio on most pages. The accessibility test lists these as
  warnings instead of failing, until the colours are updated.
- **Contact form**: no field is required, so an empty form opens WhatsApp with
  dashes. A test documents this; update it if fields become required.

## Notes

- The chat widget is replaced by an empty stub in tests (it only answers on the
  live domain), and `window.open` is recorded instead of opening WhatsApp.
- Times are fixed with Playwright's clock and the `Europe/London` time zone, so
  "open now" signs and booking slots give the same result every day.
