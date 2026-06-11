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
typewrite();

// ---- Fall-in on Scroll ----
const fallObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fall-in').forEach(el => fallObserver.observe(el));

// (enlarge-on-scroll removed — too jumpy for editorial design)

// ---- Counter Animation ----
function animateNum(el, target) {
    const dur = 2000, start = performance.now();
    function update(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
const numObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const t = parseInt(e.target.dataset.target);
            if (t) animateNum(e.target, t);
            numObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => numObserver.observe(el));

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

// ---- Formspree Submit Handler (shared by Contact + Audit forms) ----
function attachFormspree(formId, successText) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                btn.innerHTML = '&#10003; ' + successText;
                btn.style.background = 'var(--green)'; btn.style.color = '#000';
                form.reset();
                setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 4000);
            } else {
                btn.innerHTML = '&#10007; Error — Try Again';
                btn.style.background = '#FF6B6B'; btn.style.color = '#fff';
                setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 3000);
            }
        }).catch(() => {
            btn.innerHTML = '&#10007; Error — Try Again';
            btn.style.background = '#FF6B6B'; btn.style.color = '#fff';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 3000);
        });
    });
}
attachFormspree('contactForm', 'Message Sent!');
attachFormspree('auditForm', 'Audit Requested!');

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
    'I need a website': "We design professional websites for small businesses across the UK — custom design, SEO, mobile-first, and an optional AI chatbot like me. Every project is quoted to your needs. What type of business do you have?",
    'What are your prices?': "Every project is custom-quoted based on your needs — pages, features, integrations. The fastest way to get a real number is our free audit (scroll up) or the contact form below — we'll reply within 24 hours with a tailored quote.",
    'Tell me about the AI chatbot': "Great question! We can integrate a smart AI assistant (like me!) on your website. It:\n\n1. Answers customer questions 24/7\n2. Books appointments automatically\n3. Captures leads while you sleep\n4. Is trained on YOUR business\n\nIt's available on every plan — book a free consultation to see how it'd work for you.",
    'Book a free call': "Fill in the contact form below or email us at contact@redwebstudio.com — we'll get back within 24 hours!",
};
const defaults = [
    "Thanks! Book a free consultation — scroll to the contact form below.",
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

setTimeout(() => { if (!aiChat.classList.contains('open')) { aiChat.classList.add('open'); setTimeout(() => aiChat.classList.remove('open'), 3000); } }, 5000);
