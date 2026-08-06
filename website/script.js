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
        if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
    });
});

// ---- WhatsApp Submit Handler (shared by Contact + Audit forms) ----
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

// ---- Free Audit: automated PageSpeed Insights check ----
const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const PSI_API_KEY = 'AIzaSyB9nNIJUTXMEr0JwHxiXUQj_1yuWZAym0c';

function normaliseUrl(raw) {
    const url = raw.trim();
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

async function runPageSpeedCheck(rawUrl) {
    const params = new URLSearchParams();
    params.append('url', normaliseUrl(rawUrl));
    params.append('strategy', 'mobile');
    params.append('key', PSI_API_KEY);
    ['performance', 'seo', 'accessibility', 'best-practices'].forEach(c => params.append('category', c));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
        const res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('PSI request failed');
        const data = await res.json();
        const cats = data.lighthouseResult && data.lighthouseResult.categories;
        if (!cats) throw new Error('No categories in PSI response');
        const score = (c) => (cats[c] && cats[c].score != null) ? Math.round(cats[c].score * 100) : null;
        return {
            performance: score('performance'),
            seo: score('seo'),
            accessibility: score('accessibility'),
            bestPractices: score('best-practices'),
        };
    } catch (err) {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

attachWhatsAppForm('auditForm', async (data, setStatus) => {
    const website = (data.get('website') || '').trim();
    let scoreBlock = "Automated scan: couldn't complete in time, please check this one manually.";
    if (website) {
        setStatus('Analysing your site...');
        const result = await runPageSpeedCheck(website);
        if (result) {
            scoreBlock =
                `Automated scores (mobile, via Google PageSpeed):\n` +
                `- Performance: ${result.performance ?? '-'}/100\n` +
                `- SEO: ${result.seo ?? '-'}/100\n` +
                `- Accessibility: ${result.accessibility ?? '-'}/100\n` +
                `- Best Practices: ${result.bestPractices ?? '-'}/100`;
        }
    }
    return `Hi RED Web Studio! I'd like a free website audit.\n\n` +
        `Website: ${website || '-'}\n` +
        `Name: ${data.get('name') || '-'}\n` +
        `Email: ${data.get('email') || '-'}\n` +
        `Business type: ${data.get('business_type') || '-'}\n\n` +
        `${scoreBlock}`;
});

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

// ---- AI Chat ----
const aiChat = document.getElementById('aiChat');
const aiToggle = document.getElementById('aiChatToggle');
const aiBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');

const responses = {
    'I need a website': "We design professional websites for small businesses across the UK: custom design, SEO, mobile-first, and an optional AI chatbot like me. Every project is quoted to your needs. What type of business do you have?",
    'What are your prices?': "Every project is custom-quoted based on your needs: pages, features, integrations. The fastest way to get a real number is our free audit (scroll up) or the contact form below. We'll reply within 24 hours with a tailored quote.",
    'Tell me about the AI chatbot': "Great question! We can integrate a smart AI assistant (like me!) on your website. It:\n\n1. Answers customer questions 24/7\n2. Books appointments automatically\n3. Captures leads while you sleep\n4. Is trained on YOUR business\n\nIt's available on every plan. Book a free consultation to see how it'd work for you.",
    'Book a free call': "Fill in the contact form below or email us at contact@redwebstudio.com. We'll get back within 24 hours!",
};
const defaults = [
    "Thanks! Book a free consultation. Scroll to the contact form below.",
    "Great question! Our team would love to discuss. Want a 15-minute call?",
    "Drop your details in the form below and we'll reply within 24 hours.",
];

aiToggle.addEventListener('click', () => { aiChat.classList.toggle('open'); if (aiChat.classList.contains('open')) aiInput.focus(); });

function addMsg(text, bot = true) {
    const d = document.createElement('div');
    d.className = `ai-msg ${bot ? 'bot' : 'user'}`;
    d.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    aiBody.appendChild(d);
    aiBody.scrollTop = aiBody.scrollHeight;
}

function processMsg(text) {
    addMsg(text, false);
    const typing = document.createElement('div');
    typing.className = 'ai-msg bot'; typing.id = 'typing';
    typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    aiBody.appendChild(typing); aiBody.scrollTop = aiBody.scrollHeight;
    setTimeout(() => {
        typing.remove();
        addMsg(responses[text] || defaults[Math.floor(Math.random() * defaults.length)]);
    }, 800 + Math.random() * 800);
}

document.querySelectorAll('.quick-btns button').forEach(b => {
    b.addEventListener('click', () => { processMsg(b.dataset.msg); b.closest('.quick-btns')?.remove(); });
});
aiSend.addEventListener('click', () => { const t = aiInput.value.trim(); if (t) { processMsg(t); aiInput.value = ''; } });
aiInput.addEventListener('keypress', e => { if (e.key === 'Enter') { const t = aiInput.value.trim(); if (t) { processMsg(t); aiInput.value = ''; } } });
