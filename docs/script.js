// RED Web Studio — Editorial Premium

// ---- Typewriter Effect ----
const words = ['Growth.', 'Results.', 'Customers.', 'Revenue.', 'Success.'];
let wordIndex = 0, charIndex = 0, isDeleting = false;
const typeEl = document.getElementById('typewriter');

function typewrite() {
    const current = words[wordIndex];
    if (isDeleting) {
        typeEl.textContent = current.substring(0, charIndex--);
        if (charIndex < 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; setTimeout(typewrite, 400); return; }
        setTimeout(typewrite, 50);
    } else {
        typeEl.textContent = current.substring(0, charIndex++);
        if (charIndex > current.length) { isDeleting = true; setTimeout(typewrite, 2000); return; }
        setTimeout(typewrite, 100);
    }
}
if (typeEl) typewrite();

// ---- Fall-in on Scroll ----
const fallObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fall-in').forEach(el => fallObserver.observe(el));

// (enlarge-on-scroll removed — too jumpy for editorial design)

// (counter animation removed — values section uses words, not numbers)

// ---- Navbar ----
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });
hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); navLinks.classList.toggle('active'); });
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('active'); navLinks.classList.remove('active'); }));

// ---- Smooth Scroll ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) {
            // Land so the section's content sits just under the navbar (skip the section's own top padding)
            const pad = parseFloat(getComputedStyle(t).paddingTop) || 0;
            const nav = navbar ? navbar.offsetHeight : 80;
            const top = t.getBoundingClientRect().top + window.scrollY + pad - nav - 24;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    });
});

// ---- WhatsApp Submit Handler (Contact form) ----
const WHATSAPP_NUMBER = '447424714686';

function attachWhatsAppForm(formId, buildMessage) {
    const form = document.getElementById(formId);
    if (!form) return;
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const missing = [...form.querySelectorAll('[required]')].filter(el => !el.value.trim());
        if (missing.length) {
            btn.innerHTML = 'Please fill in the fields above';
            btn.style.background = '#FF6B6B'; btn.style.color = '#fff';
            missing.forEach(el => el.style.borderColor = '#FF6B6B');
            missing[0].focus();
            setTimeout(() => {
                btn.innerHTML = orig; btn.style.background = ''; btn.style.color = '';
                missing.forEach(el => el.style.borderColor = '');
            }, 2500);
            return;
        }
        btn.disabled = true;
        const setStatus = (text) => { btn.innerHTML = text; };
        const message = await buildMessage(new FormData(form), setStatus);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
        btn.innerHTML = 'Opening WhatsApp...';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; form.reset(); }, 2500);
    });
}

attachWhatsAppForm('contactForm', (data) => (
    `Hi RED Web Studio! I'm interested in working with you.\n\n` +
    `Name: ${data.get('name') || '-'}\n` +
    `Email: ${data.get('email') || '-'}\n` +
    `Phone: ${data.get('phone') || '-'}\n` +
    `Business: ${data.get('business') || '-'}\n` +
    `Service needed: ${data.get('service') || '-'}\n` +
    `Message: ${data.get('message') || '-'}`
));

// ---- FAQ accordion: only one open at a time ----
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            document.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) other.open = false;
            });
        }
    });
});

// ---- Projects carousel arrows ----
(function () {
    const grid = document.querySelector('.work-grid');
    if (!grid) return;
    const step = () => {
        const card = grid.querySelector('.work-card');
        return card ? card.offsetWidth + 20 : 300;
    };
    const prev = document.querySelector('.work-prev');
    const next = document.querySelector('.work-next');
    if (prev) prev.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));
})();
