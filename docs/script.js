// RED Web Studio — Bold Fusion-style Script

// ---- Neural Network Background ----
(function() {
    const canvas = document.getElementById('neuralBg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [], mouse = { x: -1000, y: -1000 };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 160;
    const MOUSE_DIST = 200;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 1,
            // Color: mix of red/pink and cyan/blue
            color: Math.random() > 0.5
                ? `rgba(230, ${Math.floor(57 + Math.random() * 100)}, ${Math.floor(70 + Math.random() * 120)}, `
                : `rgba(${Math.floor(50 + Math.random() * 80)}, ${Math.floor(150 + Math.random() * 105)}, 255, `
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(230, 57, 120, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            // Mouse connections
            const mdx = particles[i].x - mouse.x;
            const mdy = particles[i].y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < MOUSE_DIST) {
                const alpha = (1 - mDist / MOUSE_DIST) * 0.3;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(230, 57, 70, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // Draw particles
        for (const p of particles) {
            // Glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.05)';
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.6)';
            ctx.fill();

            // Move
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        requestAnimationFrame(draw);
    }
    draw();
})();

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

// ---- Enlarge on Scroll ----
const enlargeEls = document.querySelectorAll('.enlarge-on-scroll');
function handleEnlarge() {
    enlargeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = window.innerHeight / 2;
        const dist = Math.abs(rect.top + rect.height / 2 - center);
        const scale = Math.max(0.92, 1 - dist / (window.innerHeight * 1.5));
        el.style.transform = `scale(${Math.min(scale + 0.05, 1.05)})`;
    });
}
window.addEventListener('scroll', handleEnlarge, { passive: true });

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

// ---- Contact Form (Formspree) ----
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
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
            btn.innerHTML = '&#10003; Message Sent!';
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

// ---- AI Chat ----
const aiChat = document.getElementById('aiChat');
const aiToggle = document.getElementById('aiChatToggle');
const aiBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');

const responses = {
    'I need a website': "We design professional websites for small businesses across the UK. Packages start from £399 and include custom design, SEO, and mobile responsiveness. Plus we can add an AI chatbot like me! What type of business do you have?",
    'What are your prices?': "Our packages:\n\n• Starter — £399 (1-page site)\n• Business + AI — £799 (5 pages + chatbot)\n• E-Commerce + AI — £1,499 (full shop + chatbot)\n\nAll include custom design and SEO. Want a free quote?",
    'Tell me about the AI chatbot': "Great question! We can integrate a smart AI assistant (like me!) on your website. It:\n\n1. Answers customer questions 24/7\n2. Books appointments automatically\n3. Captures leads while you sleep\n4. Is trained on YOUR business\n\nIt's included in our Business and E-Commerce plans, or £99 add-on for Starter.",
    'Book a free call': "Fill in the contact form below or email us at hello@redwebstudio.co.uk — we'll get back within 24 hours!",
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
