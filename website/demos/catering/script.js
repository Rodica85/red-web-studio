// ---- Content: replace with the client's real packages and photos ----
const WHATSAPP = '447700900123';
const img = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

// Example packages.
const PACKAGES = [
  {
    name: 'Grill Mix', price: '£250', serves: 'up to 10 people',
    image: img('1544025162-d76694265947'),
    items: ['Pork & chicken skewers', 'Grilled sausages', 'Grilled vegetables', 'Fresh bread & sauces'],
  },
  {
    name: 'Family Feast', price: '£600', serves: 'up to 25 people', featured: true,
    image: img('1603360946369-dc9bb6258143'),
    items: ['Pork neck & chicken thighs', 'Skewers & sausages', 'Baked potatoes', 'Salads & pickles', 'Sauces & bread'],
  },
  {
    name: 'Party Buffet', price: '£1,200', serves: 'up to 50 people',
    image: img('1529193591184-b1d58069ecdd'),
    items: ['Mixed meat selection', 'Cold spread platters', 'Grilled vegetables', 'Salads & pickles', 'Chef on site'],
  },
  {
    name: 'Grand Feast', price: 'from £2,500', serves: '50–150 people',
    image: img('1546964124-0cce460f38ef'),
    items: ['Whole spit roast', 'Full hot & cold spread', 'Premium cuts & skewers', 'Full team on site', 'Set-up & clean-up'],
  },
];

const GALLERY = [
  '1555939594-58d7cb561ad1', '1558030006-450675393462', '1532550907401-a500c9a57435',
  '1600891964092-4316c288032e', '1606728035253-49e8a23146de', '1615937691194-97dbd3f3dc29',
  '1544025162-d76694265947', '1594041680534-e8c8cdebd659', '1603360946369-dc9bb6258143', '1529692236671-f1f6cf9683ba',
].map(id => img(id, 1200));

const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const T = {
  popular: 'Most popular', transport: '+ transport', book: 'Book on WhatsApp',
  waHero: 'Hi Fire & Feast, I would like a quote for an event.',
  waPackage: (name, serves) => `Hi Fire & Feast, I'm interested in the ${name} package (${serves}).`,
  waQuote: 'Hi Fire & Feast, I would like a quote.',
  labels: { name: 'Name', phone: 'Phone', date: 'Date', guests: 'Guests', event: 'Event', location: 'Location', message: 'Message' },
};

// ---- Packages ----
document.getElementById('cards').innerHTML = PACKAGES.map(p => `
    <article class="card${p.featured ? ' card--featured' : ''}">
      ${p.featured ? `<span class="card__tag">${T.popular}</span>` : ''}
      <div class="card__img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="card__body">
        <h3>${p.name}</h3>
        <p class="card__serves">${p.serves}</p>
        <ul>${p.items.map(i => `<li>${i}</li>`).join('')}</ul>
        <p class="card__price">${p.price} <small>${T.transport}</small></p>
        <a class="btn btn--dark btn--full" target="_blank" rel="noopener"
           href="${waLink(T.waPackage(p.name, p.serves))}">${T.book}</a>
      </div>
    </article>`).join('');
document.getElementById('heroWa').href = waLink(T.waHero);

// ---- Gallery + lightbox ----
const grid = document.getElementById('galleryGrid');
grid.innerHTML = GALLERY.map((src, i) =>
  `<button class="gallery__item" data-i="${i}"><img src="${src.replace('w=1200', 'w=600')}" alt="Fire &amp; Feast ${i + 1}" loading="lazy"></button>`
).join('');

const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
let current = 0;
const show = i => { current = (i + GALLERY.length) % GALLERY.length; lbImg.src = GALLERY[current]; };
grid.addEventListener('click', e => {
  const item = e.target.closest('.gallery__item');
  if (!item) return;
  show(+item.dataset.i);
  lb.hidden = false;
});
lb.querySelector('.lightbox__prev').onclick = () => show(current - 1);
lb.querySelector('.lightbox__next').onclick = () => show(current + 1);
lb.addEventListener('click', e => { if (e.target === lb || e.target.matches('.lightbox__close')) lb.hidden = true; });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') lb.hidden = true;
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});

// ---- Quote form -> WhatsApp ----
document.getElementById('quoteForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const f = Object.fromEntries(new FormData(form));
  const L = T.labels;
  const eventText = form.event.selectedOptions[0].textContent;
  const lines = [
    T.waQuote,
    `${L.name}: ${f.name}`,
    `${L.phone}: ${f.phone}`,
    f.date && `${L.date}: ${f.date}`,
    f.guests && `${L.guests}: ${f.guests}`,
    `${L.event}: ${eventText}`,
    f.location && `${L.location}: ${f.location}`,
    f.message && `${L.message}: ${f.message}`,
  ].filter(Boolean);
  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
});

// ---- Mobile menu ----
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('nav--open');
  burger.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('nav--open'); });

// ---- Header on scroll ----
const header = document.querySelector('.header');
addEventListener('scroll', () => header.classList.toggle('header--solid', scrollY > 40), { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();
