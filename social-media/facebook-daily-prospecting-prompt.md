# RED Web Studio — Prompt zilnic de prospectare pe Facebook

Rutină zilnică: cauți afaceri pe Facebook care au nevoie de site / SEO și îmi dai
mie (Claude) pagina lor. Eu întorc un mesaj de outreach personalizat, gata de
trimis. **Tu îl trimiți** din contul tău — eu nu pot trimite mesaje în numele tău.

Cross-ref: [outreach-scripts.md](outreach-scripts.md) (template-urile A–D),
[../website/llms.txt](../website/llms.txt) (poziționarea studioului).

---

## Cum folosești rutina

1. Deschide Facebook. Caută 5–10 prospecți/zi:
   - „[serviciu] București" / „[serviciu] [oraș]" — firme fără link de site, sau cu
     pagina de Facebook drept singurul „website".
   - Grupuri de business / anunțuri unde cineva întreabă „știți un web designer bun?".
   - Nișe care seamănă cu portofoliul real: construcții / case modulare, wellness &
     masaj, transport & logistică, cabinete medicale, produse fizice de nișă,
     aplicații / SaaS indie.
2. Pentru fiecare prospect, trimite-mi în chat:
   - **Screenshot cu pagina** SAU link-ul paginii + textul din secțiunea „Despre".
   - Orice observi: are/n-are site, câți urmăritori, ce postează, oraș, telefon,
     dacă au recenzii, ce vând și la ce preț.
   - Limba în care scrii mesajul (implicit: limba prospectului).
3. Eu îți întorc, pentru fiecare:
   - **Template folosit** (A/B/C/D) + o frază cu de ce e lead bun.
   - **Mesaj principal personalizat**, care începe cu o observație reală despre
     pagina LOR (nu generic), în limba lor.
   - **Follow-up ziua 4 + ziua 14**.
   - Opțional, o variantă scurtă pentru DM.
4. Le trimiți tu, notezi data, urmărești cadența de follow-up (max 2).

---

## Ce trebuie să știe mesajul despre noi (nu schimba fără motiv)

- **RED Web Studio** — site-uri pentru afaceri independente, oriunde în lume.
  Fondator: Rodica Musteata (UK, BSc Computing).
- Site-uri **codate manual** (HTML/CSS/JS), nu WordPress / Wix / page builder.
- Clientul deține **100%** codul, domeniul și hostingul. Fără lock-in, fără taxe
  RED recurente decât dacă vor mentenanță.
- **SEO inclus** la fiecare site: on-page, SEO local, optimizare pentru căutare AI
  (AEO/GEO). Majoritatea clienților ajung pe pagina 1 Google în 3–6 luni.
- Opțional: **asistent AI** pe site (GDPR-compliant, antrenat pe afacerea lor,
  captează lead-ul când nu știe răspunsul), **e-commerce**, **branding/logo**,
  **testare** manuală.
- **Garanție 14 zile** banii înapoi. Revizuiri nelimitate până le place.
- Preț: build per proiect (contact pentru ofertă). Hosting 60–120 £/an plătit direct
  la host, fără adaos.
- Livrare: one-page ~5 zile, multi-page cu chatbot ~7 zile, e-commerce ~10 zile.
- Portofoliu real de menționat, potrivit pe nișă:
  - **Luca Mobile Sauna** (UK) — produse / structuri prefabricate → construcții,
    case modulare, orice produs fizic vândut către consumatori.
  - **Red Speed Rider** (UK) — logistică, SEO local pe 16 zone → transport,
    servicii pe rază geografică.
  - **Gung Chaba** — studio de masaj, 5★ Google → wellness, saloane, cabinete.
  - **Dr. Stan Larisa-Andreea** — healthcare → medici, clinici, servicii profesionale.
  - **LolyTales** — SaaS / aplicație indie → produse digitale, funnel de trial.
- CTA: `redwebstudio.com` (secțiunea Free Audit / #contact pentru ofertă).

## Reguli de scriere (obligatoriu)

1. **Specific > generic.** Prima frază = ceva real văzut pe pagina lor (o lucrare,
   un preț afișat, o recenzie, faptul că n-au site). Fără „Ați dori un website?".
2. **Ton încrezător, nu de vânzător.** Fără „fără nicio obligație", „fără presiune",
   „scuze că vă deranjez", „dacă nu vă interesează, nicio problemă". Închiderea e
   directă: „dacă subiectul vă interesează, răspundeți-mi și vă pregătesc o
   propunere cu preț". Oferă valoare (audit, un exemplu), nu se scuză.
3. **Lead cu problema lor de business**, nu cu lista noastră de servicii. Servicii =
   3–5 bullet-uri scurte, legate de ce vând ei.
4. **Limba prospectului.**
   - Prospect din **România** → mesaj în română, adresare formală **„dumneavoastră"**
     (niciodată „voi / al vostru / vreți"); verbe la politețe (aveți, doriți).
   - Prospect din **UK / alt stat anglofon** → mesaj în **engleză** (British English:
     colour, optimise, organisation). Folosește template-urile A–D din
     [outreach-scripts.md](outreach-scripts.md) ca bază.
5. **Semnătura = Rodica.** Mesajul e trimis de Rodica însăși, nu de o „echipă".
   Deschidere: „Mă numesc Rodica, de la RED Web Studio…". Închidere: „Cu stimă,
   Rodica — RED Web Studio". Persoana I singular („aș putea", „v-aș face"), nu „noi".
6. Menționează **1** exemplu de portofoliu, cel mai apropiat de nișa lor.
7. Amintește că **domeniul și codul rămân ale clientului** — contează pentru firme
   care se tem de „dependența de agenție".
8. Lungime: 6–12 rânduri pentru mesajul principal. Follow-up-urile scurte.
9. Nu inventa rezultate sau prețuri care nu sunt în lista de mai sus.

---

## Format prompt rapid (copiază când îmi dai un prospect)

> Prospect nou pentru outreach Facebook. [screenshot atașat / link: ...]
> Observații: [site da/nu · urmăritori · ce vând · oraș · preț afișat · recenzii · ce postează]
> Limba mesajului: [română / engleză / ...]
> Dă-mi: template folosit + de ce, mesaj principal personalizat, variantă scurtă,
> follow-up ziua 4 și ziua 14.
