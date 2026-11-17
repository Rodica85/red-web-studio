/* ---------- page content from data.js ---------- */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fmtH = (h) => { const m = Math.round(h * 60); return minToTime(m); };

const CAT_IMG = { "Cut & Style": "colour.jpg", Colour: "hero.jpg", Treatments: "wash.jpg" };

function showCat(cat) {
  document.querySelectorAll(".tab").forEach((t) => {
    const on = t.dataset.cat === cat;
    t.classList.toggle("on", on);
    t.setAttribute("aria-selected", on);
  });
  document.getElementById("svc-list").innerHTML = SERVICES.filter((s) => s.cat === cat).map((s, i) => `
    <div class="svc-row" style="animation-delay:${i * 60}ms">
      <div><div class="n">${esc(s.name)}</div><div class="d">${durLabel(s.dur)}</div></div>
      <div class="p">£${s.price}</div>
      <button data-book="${s.id}">Book →</button>
    </div>`).join("");
  const img = document.getElementById("svc-img");
  img.style.opacity = 0;
  setTimeout(() => { img.src = `/demos/salon/img/${CAT_IMG[cat] || "colour.jpg"}`; img.style.opacity = 1; }, 200);
  document.getElementById("svc-cap").textContent = cat;
}

function renderPage() {
  const cats = [...new Set(SERVICES.map((s) => s.cat))];
  document.getElementById("tabs").innerHTML = cats.map((c) =>
    `<button class="tab" role="tab" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  document.querySelectorAll(".tab").forEach((t) => t.onclick = () => showCat(t.dataset.cat));
  showCat(cats[0]);

  document.getElementById("team-grid").innerHTML = STAFF.map((s, i) => `
    <div class="member reveal d${i}">
      <div class="mono">${s.name[0]}</div>
      <h4>${esc(s.name)}</h4><div class="role">${esc(s.role)}</div>
      <p>${esc(s.bio || "")}</p>
      <div class="days">In the studio ${s.days.map((d) => DAY_NAMES[d].slice(0, 3)).join(" · ")}</div>
      <button class="btn small ghost" data-book-staff="${s.id}">Book with ${esc(s.name)}</button>
    </div>`).join("");

  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  document.getElementById("hours").innerHTML = order.map((d) => `
    <tr class="${d === today ? "today" : ""}"><td>${DAY_NAMES[d]}</td>
    <td>${HOURS[d] ? `${fmtH(HOURS[d][0])} – ${fmtH(HOURS[d][1])}` : "Closed"}</td></tr>`).join("");
  document.getElementById("addr").textContent = SALON.address;
  document.getElementById("phone").textContent = SALON.phone;
}

/* ---------- booking flow ---------- */
const STEPS = ["Choose a service", "Choose a stylist", "Pick a time", "Your details", "Booked"];
const B = { step: 1, service: null, staff: "any", date: null, slot: null, booking: null };
const ov = document.getElementById("booking");
const body = document.getElementById("bk-body");
const foot = document.getElementById("bk-foot");

function openBooking({ service = null, staff = "any" } = {}) {
  Object.assign(B, { step: service ? 2 : 1, service, staff, date: null, slot: null, booking: null });
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  render();
}
function closeBooking() {
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function go(step) { B.step = step; render(); body.scrollTop = 0; }

function render() {
  document.getElementById("bk-title").textContent = STEPS[B.step - 1];
  document.getElementById("bk-progress").style.width = `${(B.step / STEPS.length) * 100}%`;
  document.getElementById("bk-back").style.visibility = B.step > 1 && B.step < 5 ? "visible" : "hidden";
  ({ 1: stepService, 2: stepStaff, 3: stepTime, 4: stepDetails, 5: stepDone })[B.step]();
}

function summary(nextLabel, enabled, onNext) {
  const sv = B.service && getService(B.service);
  const parts = [];
  if (sv) parts.push(`<b>${esc(sv.name)} · £${sv.price}</b>`);
  if (B.slot) parts.push(`${niceDate(B.date, { weekday: "short", day: "numeric", month: "short" })} at ${minToTime(B.slot.start)} with ${getStaff(B.slot.staff).name}`);
  else if (sv) parts.push(durLabel(sv.dur));
  foot.innerHTML = `<div class="sum">${parts.join("") || "&nbsp;"}</div>
    ${nextLabel ? `<button class="btn" id="bk-next" ${enabled ? "" : "disabled"}>${nextLabel}</button>` : ""}`;
  foot.style.display = "";
  const n = document.getElementById("bk-next");
  if (n) n.onclick = onNext;
}

function stepService() {
  const cats = [...new Set(SERVICES.map((s) => s.cat))];
  body.innerHTML = cats.map((c) => `
    <div class="bk-cat">${esc(c)}</div>
    ${SERVICES.filter((s) => s.cat === c && (B.staff === "any" || canDo(getStaff(B.staff), s.id))).map((s) => `
      <button class="opt ${B.service === s.id ? "sel" : ""}" data-svc="${s.id}">
        <div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${durLabel(s.dur)}</div></div>
        <div class="price">£${s.price}</div>
      </button>`).join("")}`).join("");
  body.querySelectorAll("[data-svc]").forEach((b) => b.onclick = () => {
    B.service = b.dataset.svc; B.slot = null;
    go(B.staff === "any" ? 2 : 3);
  });
  summary(null);
  foot.style.display = "none";
}

function stepStaff() {
  const avail = STAFF.filter((s) => canDo(s, B.service));
  body.innerHTML = `
    <button class="opt ${B.staff === "any" ? "sel" : ""}" data-staff="any">
      <div class="avatar" style="background:#cfc5b8">★</div>
      <div class="grow"><div class="t">Any available stylist</div><div class="s">Most availability</div></div>
    </button>
    ${avail.map((s) => `
      <button class="opt ${B.staff === s.id ? "sel" : ""}" data-staff="${s.id}">
        <div class="avatar" style="background:${s.color}">${s.name[0]}</div>
        <div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${esc(s.role)}</div></div>
      </button>`).join("")}`;
  body.querySelectorAll("[data-staff]").forEach((b) => b.onclick = () => {
    B.staff = b.dataset.staff; B.slot = null; go(3);
  });
  summary(null);
}

function stepTime() {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const k = dateKey(d);
    days.push({ k, d, n: slotsFor(k, B.service, B.staff).length });
  }
  if (!B.date || !days.find((x) => x.k === B.date && x.n)) B.date = (days.find((x) => x.n) || days[0]).k;
  const slots = slotsFor(B.date, B.service, B.staff);
  const groups = [["Morning", 0, 720], ["Afternoon", 720, 1020], ["Evening", 1020, 1440]]
    .map(([label, a, z]) => [label, slots.filter((s) => s.start >= a && s.start < z)])
    .filter(([, s]) => s.length);

  body.innerHTML = `
    <div class="month">${parseKey(B.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
    <div class="days" id="days">
      ${days.map((x) => `<button class="day ${x.k === B.date ? "sel" : ""}" data-day="${x.k}" ${x.n ? "" : "disabled"}
        title="${x.n ? x.n + " times available" : "Closed or fully booked"}">
        <small>${x.d.toLocaleDateString("en-GB", { weekday: "short" })}</small><b>${x.d.getDate()}</b></button>`).join("")}
    </div>
    <p class="step-label">${niceDate(B.date)}</p>
    ${groups.length ? groups.map(([label, s]) => `
      <div class="slot-group"><h5>${label}</h5><div class="slots">
        ${s.map((x) => `<button class="slot ${B.slot && B.slot.start === x.start ? "sel" : ""}" data-slot="${x.start}" data-st="${x.staff}">${minToTime(x.start)}</button>`).join("")}
      </div></div>`).join("") : `<div class="empty">No times left on this day. Try another date.</div>`}`;

  const sel = body.querySelector(".day.sel");
  if (sel) sel.scrollIntoView({ inline: "center", block: "nearest" });
  body.querySelectorAll("[data-day]").forEach((b) => b.onclick = () => { B.date = b.dataset.day; B.slot = null; render(); });
  body.querySelectorAll("[data-slot]").forEach((b) => b.onclick = () => {
    B.slot = { start: +b.dataset.slot, staff: b.dataset.st }; render();
  });
  summary("Continue", !!B.slot, () => go(4));
}

function stepDetails() {
  const sv = getService(B.service);
  body.innerHTML = `
    <div class="recap">
      <div><span>Service</span><b>${esc(sv.name)}</b></div>
      <div><span>When</span><b>${niceDate(B.date, { weekday: "short", day: "numeric", month: "short" })}, ${minToTime(B.slot.start)}</b></div>
      <div><span>Stylist</span><b>${getStaff(B.slot.staff).name}</b></div>
      <div><span>Duration</span><b>${durLabel(sv.dur)}</b></div>
      <div><span>Price</span><b>£${sv.price}, pay in salon</b></div>
    </div>
    <form id="bk-form" novalidate>
      <div class="field"><label for="f-name">Full name</label><input id="f-name" autocomplete="name" required></div>
      <div class="field"><label for="f-phone">Mobile number</label><input id="f-phone" type="tel" autocomplete="tel" required placeholder="07…"></div>
      <div class="field"><label for="f-email">Email (optional)</label><input id="f-email" type="email" autocomplete="email"></div>
      <div class="field"><label for="f-notes">Anything we should know? (optional)</label><textarea id="f-notes" rows="2"></textarea></div>
      <label class="check"><input type="checkbox" id="f-sms" checked> Text me a reminder the day before</label>
      <label class="check"><input type="checkbox" id="f-terms"> I agree to the 24-hour cancellation policy</label>
      <p id="f-err" style="color:#b0413e;font-size:14px;min-height:20px;margin:8px 0 0"></p>
    </form>`;
  summary("Confirm booking", true, submit);
}

function submit() {
  const v = (id) => document.getElementById(id).value.trim();
  const err = document.getElementById("f-err");
  if (!v("f-name")) return (err.textContent = "Please enter your name.");
  if (v("f-phone").replace(/\D/g, "").length < 10) return (err.textContent = "Please enter a valid mobile number.");
  if (!document.getElementById("f-terms").checked) return (err.textContent = "Please accept the cancellation policy.");
  const sv = getService(B.service);
  const all = loadBookings();
  if (!isFree(all, B.date, B.slot.staff, B.slot.start, sv.dur)) {
    err.textContent = "Sorry, that time was just taken. Please choose another.";
    B.slot = null;
    return setTimeout(() => go(3), 1200);
  }
  B.booking = {
    id: uid(), type: "booking", date: B.date, start: B.slot.start, dur: sv.dur, staff: B.slot.staff, service: sv.id,
    name: v("f-name"), phone: v("f-phone"), email: v("f-email"), notes: v("f-notes"),
    sms: document.getElementById("f-sms").checked, source: "website", created: new Date().toISOString(),
  };
  all.push(B.booking);
  saveBookings(all);
  go(5);
}

function stepDone() {
  const b = B.booking, sv = getService(b.service);
  body.innerHTML = `
    <div class="done">
      <div class="tick">✓</div>
      <h4>You're booked in!</h4>
      <p>See you on <b>${niceDate(b.date)}</b> at <b>${minToTime(b.start)}</b>.</p>
      <div class="recap" style="text-align:left">
        <div><span>Service</span><b>${esc(sv.name)}</b></div>
        <div><span>Stylist</span><b>${getStaff(b.staff).name}</b></div>
        <div><span>Price</span><b>£${sv.price}</b></div>
        <div><span>Where</span><b>${esc(SALON.address)}</b></div>
      </div>
      <div class="note">Demo: in the real version, ${esc(b.name.split(" ")[0])} would now get a confirmation ${b.email ? "email and " : ""}text${b.sms ? ", plus a reminder 24h before" : ""}, with an “Add to calendar” link. The salon sees this booking instantly in its <a href="/demos/salon/admin">dashboard</a>.</div>
    </div>`;
  summary("Done", true, closeBooking);
  foot.querySelector(".sum").innerHTML = "&nbsp;";
}

/* ---------- wiring ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-book],[data-book-staff]");
  if (!t) return;
  if (t.dataset.bookStaff) openBooking({ staff: t.dataset.bookStaff });
  else openBooking({ service: t.dataset.book || null });
});
document.getElementById("bk-close").onclick = closeBooking;
document.getElementById("bk-back").onclick = () => go(B.step - 1);
ov.addEventListener("click", (e) => { if (e.target === ov) closeBooking(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("open")) closeBooking(); });

/* ---------- premium touches: header, reveal, counters, reviews, parallax ---------- */
const hdr = document.getElementById("hdr");
const mcta = document.querySelector(".mobile-cta");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const bar = document.getElementById("demo-bar");
function setBarHeight() { document.documentElement.style.setProperty("--bar-h", `${bar.offsetHeight}px`); }
window.addEventListener("resize", setBarHeight);
setBarHeight();

function onScroll() {
  const y = window.scrollY;
  hdr.classList.toggle("solid", y > 60);
  mcta.classList.toggle("show", y > window.innerHeight * 0.6);
  const p = document.getElementById("parallax");
  if (p && !reduceMotion) {
    const r = p.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) p.style.transform = `translateY(${(r.top - window.innerHeight / 2) * -0.12}px)`;
  }
}
window.addEventListener("scroll", onScroll, { passive: true });

function countUp(el) {
  const end = +el.dataset.count, suffix = el.dataset.suffix || "";
  if (reduceMotion) return;
  const t0 = performance.now(), dur = 1400;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
    el.textContent = v.toLocaleString("en-GB") + (k === 1 ? suffix : "");
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  els.forEach((e) => io.observe(e));
}

function setupReviews() {
  const items = [...document.querySelectorAll(".rv")];
  const dots = document.getElementById("rv-dots");
  let i = 0, timer;
  dots.innerHTML = items.map((_, n) => `<button aria-label="Review ${n + 1}" class="${n ? "" : "on"}"></button>`).join("");
  const show = (n) => {
    i = (n + items.length) % items.length;
    items.forEach((el, k) => el.classList.toggle("on", k === i));
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
  };
  const auto = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 6000); };
  [...dots.children].forEach((d, k) => d.onclick = () => { show(k); auto(); });
  if (!reduceMotion) auto();
}

renderPage();
setupReveal();
setupReviews();
onScroll();
loadBookings();
