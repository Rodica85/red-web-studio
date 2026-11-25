# Audit SEO + testare automată — fruitwayfarm.com

**Data:** 23 noiembrie 2026
**Platformă:** Tilda (proiect 10157829), găzduit pe serverele Tilda
**Pagini indexabile:** 11 (homepage, /catalog, 9 pagini de produs)

## Rezumat

Site-ul funcționează tehnic corect (HTTPS, redirecturi, sitemap, 404, mobil fără scroll orizontal, fără erori în consolă), dar **SEO on-page este aproape inexistent**: titlul paginii principale e doar „Fruit Way Farm”, nu există niciun H1/H2 pe homepage, nicio imagine nu are text alternativ, nu există date structurate (LocalBusiness / Product) și nici Google Analytics / Search Console. Pentru o fermă care vinde la piețe din Londra și livrează local în Oxfordshire, site-ul practic nu are șanse să apară la căutări precum „farm Oxfordshire strawberries” sau „South Kensington farmers market fruit”.

| Zonă | Stare |
|---|---|
| Tehnic (HTTPS, redirecturi, robots, sitemap, 404) | ✅ Bun |
| Titluri și meta descrieri | ❌ Slab |
| Structură headings (H1–H3) | ❌ Lipsește complet pe homepage și /catalog |
| Imagini (alt, greutate) | ❌ 0 din 14 imagini cu alt; originale de 1–2.7 MB |
| Date structurate (schema.org) | ❌ Lipsesc |
| SEO local (adresă, telefon, Google Business) | ⚠️ Parțial |
| Analytics / Search Console | ❌ Nu există |
| Conținut | ⚠️ Text bun, dar cu greșeli și o contradicție majoră („Shop online” vs. „nu vindem prin site”) |
| Mobil | ✅ Fără overflow, fără text sub 12px |
| Accesibilitate | ⚠️ 21 de linkuri fără text, 9 imagini fără alt |

---

## 1. Tehnic — ce funcționează

- `http://`, `http://www.` și `https://www.` → redirect **301** către `https://fruitwayfarm.com/` ✅ (o singură versiune canonică)
- Toate paginile au `<link rel="canonical">` corect ✅
- `robots.txt` prezent, indică `sitemap.xml` și `sitemap-store.xml` ✅
- Pagina inexistentă întoarce **404** real ✅
- TTFB homepage ~0.34 s (măsurat cu curl) ✅
- `lang="en"` și meta viewport prezente ✅
- Toate linkurile externe testate (WhatsApp, Instagram, Facebook, 5 × Google Maps, politica de confidențialitate) răspund **200** ✅
- Pe mobil (375 px) nu există scroll orizontal și niciun text sub 12 px ✅
- Nicio eroare în consolă ✅

### Probleme tehnice

1. **`lastmod` din sitemap e 23 octombrie 2025** — Google vede site-ul ca neactualizat de peste un an. Orice republicare din Tilda îl actualizează.
2. **`/catalog/` (cu slash) întoarce 200 în loc de redirect** către `/catalog` — conținut duplicat minor (canonical-ul limitează daunele).
3. **Pagini de sistem accesibile public:** `page52303141.html` are titlul în rusă „Подвал” (= „Footer”). E blocată în robots.txt, dar e accesibilă; ar trebui să aibă și `noindex` sau să nu fie publicată ca pagină separată.
4. **Politica de confidențialitate e un PDF pe Dropbox**, nu o pagină pe site. Linkul Dropbox poate expira, iar Google nu o asociază domeniului. Recomandare: pagină `/privacy-policy` în Tilda.
5. **Protecția anti-bot Tilda e agresivă**: după ~40 de cereri de test, IP-ul nostru a primit 403/410. Nu afectează Googlebot, dar unele unelte SEO (Ahrefs, Screaming Frog) pot fi blocate.

## 2. Titluri și meta descrieri

| Pagină | Title | Meta description | Problemă |
|---|---|---|---|
| `/` | „Fruit Way Farm” (14 car.) | „We are the connection between field and your table” (50) | Fără cuvinte cheie, fără locație. Ideal 50–60 / 140–160 caractere |
| `/catalog` | „Catalog” (7) | **lipsește** | Titlu generic, fără descriere, `og:description` gol |
| Produse (9) | „Strawberries”, „Peppers” … | 27–125 car. | Fără numele fermei/locație; descrierile conțin `&nbsp;` care apare literal în Google (ex. „a&amp;nbsp;delightful treat”) |

**Propuneri:**

- **Home** — Title: `Fruit Way Farm – Fresh Strawberries, Berries & Veg from Oxfordshire`
  Description: `Family farm in Oxfordshire growing strawberries, raspberries, asparagus, tomatoes and seasonal flowers. Find us at London farmers markets every weekend.`
- **Catalog** — Title: `Shop Fresh Farm Produce | Fruit Way Farm Oxfordshire`
  Description: `Seasonal fruit, vegetables and flowers picked fresh in Oxfordshire. Free local delivery within 10 miles on orders over £100.`
- **Produse** — model: `Fresh Strawberries from Oxfordshire | Fruit Way Farm`; în descrieri, înlocuiți spațiile non-break din editorul Tilda cu spații normale.

## 3. Structura de headings

- **Homepage: 0 × H1, 0 × H2, 0 × H3.** Toate titlurile („OUR STORY”, „WHAT WE DO”, „PRODUCTS”, „FLOWERS”, „MARKET AND DELIVERY”) sunt `<div>`-uri stilizate. Google nu înțelege ierarhia paginii.
- **/catalog: 0 headings.**
- Paginile de produs au un singur H1 ✅.

**Fix în Tilda:** pentru fiecare bloc → Settings → „Heading tag” (sau în Zero Block → element text → SEO: tag H1/H2). Un singur H1 pe homepage (ex. „Fruit Way Farm – Family Farm in Oxfordshire”), apoi H2 pentru fiecare secțiune.

## 4. Imagini

- **0 din 14 imagini** (home + catalog) au atribut `alt`. Majoritatea fotografiilor sunt fundaluri CSS (113 elemente), deci invizibile pentru Google Images.
- Fișierele originale încărcate sunt foarte mari: PNG-uri de **2.7 MB, 2.4 MB, 1.9 MB** și JPG-uri de ~1 MB (69 de imagini pe homepage). Tilda servește versiuni redimensionate, dar pornește de la aceste originale.
- Fără `loading="lazy"` pe `<img>` (Tilda folosește lazy-load propriu pentru fundaluri).

**Fix:** completați „Alt text” la fiecare imagine din Tilda (ex. „Fresh strawberries in paper punnets – Fruit Way Farm”); exportați fotografiile ca JPG/WebP ≤ 300 KB, max 2000 px lățime, înainte de upload; PNG doar pentru grafică cu transparență.

## 5. Date structurate (schema.org)

**Nu există niciun bloc JSON-LD.** Recomandare — în Site Settings → More → HTML code for head:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Farm",
  "name": "Fruit Way Farm",
  "legalName": "FruitWay Farm Limited",
  "url": "https://fruitwayfarm.com",
  "logo": "https://static.tildacdn.one/tild3430-3030-4232-b639-303966366130/logo_1.png",
  "telephone": "+447791881526",
  "address": { "@type": "PostalAddress", "addressRegion": "Oxfordshire", "addressCountry": "GB" },
  "areaServed": ["Oxfordshire", "London"],
  "sameAs": [
    "https://www.instagram.com/fruitwayfarm",
    "https://www.facebook.com/profile.php?id=61557947453031"
  ]
}
</script>
```

(Adresa completă și programul trebuie confirmate cu clientul.) Pentru paginile de produs Tilda poate genera automat schema `Product` dacă produsele au preț completat în Store.

## 6. SEO local

- Locația apare doar ca text „oxfordshire / England” — **fără adresă, cod poștal sau oraș/sat**.
- **Niciun link `tel:` sau email** — singurul contact este WhatsApp și formularul.
- Piețele din Londra (South Kensington, High Street Kensington, West Hampstead, Parliament Hill, Queen's Park) sunt menționate ✅, dar fără zile/ore — exact informația căutată de clienți.
- Nu am putut verifica existența unui profil Google Business; dacă nu există, e prioritatea nr. 1 pentru vizibilitate locală.

## 7. Analytics și monitorizare

Nu există Google Analytics, Google Tag Manager, Meta Pixel sau verificare Google Search Console. **Fără Search Console nu se poate ști dacă site-ul e indexat sau pentru ce căutări apare.** Ambele se conectează din Tilda → Site Settings → Analytics.

Notă: dacă se adaugă Analytics, devine necesar un banner de cookies (UK GDPR / PECR) — acum nu există unul.

## 8. Conținut

Textul „Our Story” e autentic și bun pentru SEO (familie, Millets Farm, 20 de ani, tuneluri, mai–noiembrie), dar:

1. **Contradicție majoră:** butonul principal spune „SHOP ONLINE” și duce la /catalog cu coș de cumpărături, dar pe catalog scrie „At the moment, sales through the site are not carried out”. Utilizatorul (și Google) primește un semnal confuz. Fie se activează vânzarea, fie butonul devine „See our products” / „Order on WhatsApp”.
2. **Ordinea paragrafelor e inversată** în „Our Story”: „where my husband and me came to the country…” apare înaintea frazei „Our journey began over two decades ago…”.
3. Greșeli gramaticale: „This is promoted us”, „resulting a large amount”, „This remains the exceptional taste”, „Progressive paper is a biodegradable packaging to plastic packaging”, „my husband and me came”.
4. **„Сontact us” conține litera chirilică „С”** (U+0421) în loc de „C” latin — cuvântul nu va fi găsit la căutarea „contact”.
5. Inconsistență de nume: „Fruit Way Farm” / „FruitWay Farm” / „FruitWay Farm Limited”. Alegeți o formă și folosiți-o peste tot (inclusiv în Google Business).
6. Footer: „©2024” într-un loc și „©2025” în altul.
7. Paginile de produs au ~35–47 de cuvinte — prea puțin. Adăugați sezonul, soiul, cum se păstrează, unde se găsesc (piața X).
8. Lipsesc pagini cu potențial SEO: „Pick your own”/„Farmers markets” (o pagină pe piață), FAQ, pagina de flori separată.

## 9. Accesibilitate (testare automată în browser)

- 21 de linkuri fără text sau `aria-label` (iconițe sociale, săgeți) — cititoarele de ecran le citesc ca „link”.
- 9 imagini fără `alt` pe homepage.
- 3 butoane/linkuri cu zona de atingere sub 24 × 24 px.
- Formularul de contact cere telefonul obligatoriu, emailul opțional — OK, dar checkbox-ul GDPR trimite la PDF-ul de pe Dropbox.

## 10. Performanță

- 141 de cereri la încărcarea homepage-ului, 56 de `<script>`-uri, 727 KB HTML (mult pentru o pagină — din cauza Zero Block-urilor Tilda).
- ~1275 noduri DOM.
- CLS = 0 (fără salturi de layout) ✅.
- **Nu am putut rula Lighthouse/PageSpeed:** cota zilnică a API-ului PageSpeed era epuizată, iar rularea locală a Lighthouse a fost blocată în această sesiune. Timpii FCP/LCP măsurați în browserul integrat (~10 s) **nu sunt de încredere** (panoul era în fundal). De rulat manual pe https://pagespeed.web.dev/ pentru scoruri oficiale.

---

## Plan de acțiune (în ordinea impactului)

| # | Acțiune | Efort | Impact |
|---|---|---|---|
| 1 | Google Search Console + Google Business Profile | 1 h | Foarte mare |
| 2 | Title + meta description pe toate cele 11 pagini | 1 h | Mare |
| 3 | H1/H2 pe homepage și catalog | 30 min | Mare |
| 4 | Rezolvat contradicția „Shop online” / „nu vindem online” | 15 min | Mare (conversii) |
| 5 | Schema LocalBusiness/Farm în head | 20 min | Mediu |
| 6 | Alt text la toate imaginile + recomprimare fotografii | 1–2 h | Mediu |
| 7 | Adresă, telefon `tel:`, zile/ore piețe | 30 min | Mediu (local) |
| 8 | Corectat textul (gramatică, ordine, „С” chirilic, ©) | 30 min | Mediu (încredere) |
| 9 | Pagină Privacy Policy pe site, nu pe Dropbox | 30 min | Mic |
| 10 | Conținut extins pe produse + pagini pe piețe | 3–5 h | Mare pe termen lung |
