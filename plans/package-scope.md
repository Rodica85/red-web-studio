# Package scope — what we can actually deliver (Rodica + Claude)

Companion to [pricing-packages.md](pricing-packages.md). Every line below is something we can
build and test ourselves with the current stack: hand-coded HTML/CSS/JS, static hosting
(Cloudflare Pages / Vercel), client owns domain, hosting and code.

## Who does what

| Rodica | Claude |
|---|---|
| Client call, goals, content gathering, photos | Draft copy from the call notes (client approves) |
| Design direction and approval, final check | Build pages, responsive layout, components, animations |
| Accounts that need the owner: domain, DNS, Google Business Profile, Stripe | On-page SEO, schema, sitemap, robots, meta, speed and image optimisation |
| Deploy and go-live, client communication, invoicing | Forms wiring, WhatsApp/booking embeds, QA checklist, cross-browser and mobile testing |

Rough time per project with this split (Rodica's hours, not Claude's):
Starter 3-4 h, Business 9-12 h, Growth 16-20 h. This is why the prices work even though the
client-facing scope is generous.

## Starter — £349 (one page)
**Included**
- One-page custom design, sections: hero, services, about, reviews, contact
- Mobile-first, tested on phone, tablet, desktop, Chrome/Safari/Firefox
- Contact form delivering to the client's email (Formspree / Web3Forms free tier, or Cloudflare Worker)
- WhatsApp and click-to-call buttons
- On-page SEO basics: title, description, headings, alt text, sitemap, local business schema
- Speed pass (compressed images, lazy loading, no heavy scripts)
- Cookieless analytics (Cloudflare Web Analytics), so no cookie banner needed
- Deployment on the client's domain, HTTPS
- Google Business Profile: we write the description, categories and services text, client or Rodica applies it
- 1 round of edits, 30 days of fixes
- Delivery 5 days after content received

**Not included:** extra pages, copywriting from scratch, logo, bookings, shop.

## Business — £790 (up to 5 pages)
Everything in Starter, plus:
- Up to 5 pages (Home, About, Services, Gallery/Portfolio, Contact; or similar)
- Copy drafted by us from the client interview, client approves
- Booking via embed (Calendly / Cal.com free tier) or enquiry form, WhatsApp as fallback
- Image gallery with lightbox, reviews section pulling real quotes (client-provided)
- FAQ section with FAQ schema (helps Google and AI search answers)
- Simple customer-service chat on the site: guided and FAQ-driven, trained on the client's own info
  (hours, services, prices, areas), captures enquiries by email/WhatsApp. No per-client API cost.
  Same approach as the chat on Red Speed Rider.
- Google Search Console + sitemap submitted
- Open Graph image so links look good on Facebook/WhatsApp
- Privacy policy and cookie-free setup (GDPR-ready page)
- 2 rounds of edits, 30 days of fixes
- Delivery 7-10 days after content received

## Growth — £1,290 (up to 10 pages)
Everything in Business, plus:
- Up to 10 pages
- Local-SEO pages per service or area (e.g. "man and van [town]"), each with unique copy
- Articles/blog section, 3 starter articles written by us for the client to approve
- Quote-request or enquiry flow with validation and email notification
- Chat flow extended to collect quote requests
- Stripe payment link or buy button for deposits or single products (no stock management)
- Structured data for services, FAQs, reviews and breadcrumbs
- Speed target 90+ on mobile PageSpeed, measured before and after (we show the report)
- 3 rounds of edits, 30 days of fixes
- Delivery 2-3 weeks after content received

## Custom — from £2,200
Scoped on a call, fixed quote after. Examples: small online shop (up to about 20 products via Stripe
or Snipcart), multi-language site, subscription funnel, custom booking logic, anything needing a database.

## What we deliberately do NOT put in the packages

| Item | Why | How to offer it |
|---|---|---|
| Real booking system with calendar sync and payments | Needs a backend, auth and database, ongoing maintenance | Custom quote only |
| Self-edit CMS | Hand-coded sites have none, so edits go through us | Care plan covers edits (hours included) |
| AI-powered chat (live model, like Dr. Stan's) | Needs a backend and may have API costs per client | Add-on quoted per project, price must cover API usage. The simple guided chat is already included in Business and Growth |
| Large shop with inventory | Out of scope for a static site | Custom |
| Guaranteed Google rankings | Nobody can promise it | Say "SEO set up properly", show before/after scores |
| Logo and branding | Quality depends on Rodica's design time | Add-on, simple wordmark only |
| Security testing | Site says it is not offered | Do not offer |

## Add-ons we can deliver

| Add-on | Price |
|---|---|
| Extra page | £60 |
| Copywriting per extra page | £40 |
| Second language (e.g. Romanian + English) | £150 |
| Simple logo / wordmark | £149 |
| Google Business Profile full setup with photos and first posts | £79 |
| Social media starter pack (profile setup + 10 branded posts) | £99 |

## Care plans (month-to-month)
- **Essential £25:** updates, backups, security, uptime check.
- **Plus £45:** Essential + 1 hour of edits.
- **Pro £89:** Essential + 3 hours of edits + monthly speed/SEO report.

## Things on the live site that need to change to match this
- "Unlimited revisions until you are happy": change to 1/2/3 rounds by package.
- "14-day money-back guarantee": limit to before design approval, deposit non-refundable after.
- "Website builds are priced per project. Contact us for a quote": publish the packages.
- "Most clients rank on Google page 1 within 3-6 months": remove or soften, it is a promise we cannot keep.
- "Hosting £60-120 per year": static hosting can be free, so the real cost may be domain only
  (about £10-15/year). Decide the offer and update the FAQ and llms.txt.
- Chat: simple guided chat is included in Business and Growth, AI-powered versions are quoted per project. Live examples: redspeedrider.co.uk (guided) and doctorstanlarisa.ro (AI).
