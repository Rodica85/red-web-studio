const PPM = 1.5; // pixels per minute in the day view
let cur = dateKey(new Date());

const $ = (id) => document.getElementById(id);
const modal = $("modal"), card = $("modal-card");

function shift(days) { const d = parseKey(cur); d.setDate(d.getDate() + days); cur = dateKey(d); render(); }
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600); }

function render() {
  const all = loadBookings();
  const day = all.filter((b) => b.date === cur);
  const appts = day.filter((b) => b.type === "booking");
  $("day-title").textContent = cur === dateKey(new Date()) ? `Today · ${niceDate(cur, { weekday: "short", day: "numeric", month: "short" })}` : niceDate(cur);
  $("pick").value = cur;

  // stats
  const revenue = appts.reduce((s, b) => s + getService(b.service).price, 0);
  const online = appts.filter((b) => b.source === "website").length;
  const weekEnd = parseKey(cur); weekEnd.setDate(weekEnd.getDate() + 7);
  const week = all.filter((b) => b.type === "booking" && b.date >= cur && b.date < dateKey(weekEnd)).length;
  $("stats").innerHTML = `
    <div class="stat"><small>Appointments</small><b>${appts.length}</b></div>
    <div class="stat"><small>Expected takings</small><b>£${revenue}</b></div>
    <div class="stat"><small>Booked online</small><b>${appts.length ? Math.round((online / appts.length) * 100) : 0}%</b></div>
    <div class="stat"><small>Next 7 days</small><b>${week}</b></div>`;

  // calendar
  const h = hoursFor(cur);
  const wd = parseKey(cur).getDay();
  const staff = STAFF.filter((s) => s.days.includes(wd));
  if (!h || !staff.length) { $("cal").innerHTML = `<div class="closed">The salon is closed on this day.</div>`; return; }
  const height = (h[1] - h[0]) * PPM;
  const cols = `56px repeat(${staff.length}, minmax(0, 1fr))`;
  const lines = `repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px ${60 * PPM}px),
                 repeating-linear-gradient(to bottom, #f1ece5 0 1px, transparent 1px ${30 * PPM}px)`;
  let times = "";
  for (let m = Math.ceil(h[0] / 60) * 60; m < h[1]; m += 60) times += `<span style="top:${(m - h[0]) * PPM}px">${minToTime(m)}</span>`;

  const recent = Date.now() - 15 * 60 * 1000;
  const colHtml = staff.map((s) => `
    <div class="col" data-staff="${s.id}" style="height:${height}px;background:${lines};background-position:0 ${((60 - (h[0] % 60)) % 60) * PPM}px, 0 0">
      ${day.filter((b) => b.staff === s.id).map((b) => {
        const sv = b.type === "booking" ? getService(b.service) : null;
        const isNew = b.created && Date.parse(b.created) > recent;
        return `<div class="appt ${b.type === "block" ? "block" : ""} ${isNew ? "new" : ""}" data-id="${b.id}"
          style="top:${(b.start - h[0]) * PPM + 1}px;height:${b.dur * PPM - 2}px;background:${s.color}">
          ${b.type === "block" ? `<b>${esc(b.name || "Blocked")}</b>${minToTime(b.start)}–${minToTime(b.start + b.dur)}`
            : `${b.source === "website" ? '<span class="tag" title="Booked online"></span>' : ""}<b>${minToTime(b.start)} ${esc(b.name)}</b>${esc(sv.name)}`}
        </div>`; }).join("")}
    </div>`).join("");

  let nowLine = "";
  const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
  if (cur === dateKey(now) && nm >= h[0] && nm <= h[1]) nowLine = `<div class="now" style="top:${(nm - h[0]) * PPM}px"></div>`;

  $("cal").innerHTML = `
    <div class="cal-head" style="grid-template-columns:${cols}"><div></div>
      ${staff.map((s) => `<div><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</div>`).join("")}</div>
    <div class="cal-body" style="grid-template-columns:${cols};position:relative">
      <div class="times" style="height:${height}px">${times}</div>${colHtml}
      <div style="position:absolute;left:56px;right:0;top:0">${nowLine}</div>
    </div>`;

  $("cal").querySelectorAll(".col").forEach((c) => c.addEventListener("click", (e) => {
    if (e.target !== c) return;
    const m = h[0] + Math.floor(e.offsetY / PPM / 15) * 15;
    openNew({ staff: c.dataset.staff, start: m });
  }));
  $("cal").querySelectorAll(".appt").forEach((a) => a.addEventListener("click", () => openView(a.dataset.id)));
}

/* ---------- modals ---------- */
function close() { modal.classList.remove("open"); }
modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

function timeOptions(sel) {
  const h = hoursFor(cur) || [540, 1080];
  let o = "";
  for (let m = h[0]; m < h[1]; m += 15) o += `<option value="${m}" ${m === sel ? "selected" : ""}>${minToTime(m)}</option>`;
  return o;
}

function openNew({ staff, start } = {}) {
  if (!hoursFor(cur)) return toast("The salon is closed on this day.");
  const wd = parseKey(cur).getDay();
  const working = STAFF.filter((s) => s.days.includes(wd));
  staff = staff || working[0].id;
  start = start ?? hoursFor(cur)[0];
  let mode = "booking";
  const draw = () => {
    card.innerHTML = `
      <h3>${mode === "booking" ? "New booking" : "Block time"}</h3>
      <div class="seg"><button data-m="booking" class="${mode === "booking" ? "on" : ""}">Booking</button><button data-m="block" class="${mode === "block" ? "on" : ""}">Block time</button></div>
      <div class="row2">
        <div class="field"><label>Stylist</label><select id="n-staff">${working.map((s) => `<option value="${s.id}" ${s.id === staff ? "selected" : ""}>${s.name}</option>`).join("")}</select></div>
        <div class="field"><label>Start</label><select id="n-start">${timeOptions(start)}</select></div>
      </div>
      ${mode === "booking" ? `
        <div class="field"><label>Service</label><select id="n-svc">${SERVICES.map((s) => `<option value="${s.id}">${esc(s.name)} · ${durLabel(s.dur)} · £${s.price}</option>`).join("")}</select></div>
        <div class="field"><label>Client name</label><input id="n-name"></div>
        <div class="field"><label>Mobile</label><input id="n-phone" type="tel"></div>`
      : `<div class="row2">
          <div class="field"><label>Duration</label><select id="n-dur">${[15, 30, 45, 60, 90, 120, 240].map((d) => `<option value="${d}" ${d === 60 ? "selected" : ""}>${durLabel(d)}</option>`).join("")}</select></div>
          <div class="field"><label>Reason</label><input id="n-reason" placeholder="Lunch, training…"></div>
        </div>`}
      <p id="n-err" style="color:#b0413e;font-size:14px;margin:4px 0 0;min-height:18px"></p>
      <div class="actions"><button class="btn ghost small" id="n-cancel">Cancel</button><button class="btn small" id="n-save">Save</button></div>`;
    card.querySelectorAll("[data-m]").forEach((b) => b.onclick = () => {
      staff = $("n-staff").value; start = +$("n-start").value; mode = b.dataset.m; draw();
    });
    $("n-cancel").onclick = close;
    $("n-save").onclick = save;
  };
  const save = () => {
    const st = $("n-staff").value, s = +$("n-start").value, all = loadBookings();
    let entry;
    if (mode === "booking") {
      const sv = getService($("n-svc").value);
      if (!canDo(getStaff(st), sv.id)) return ($("n-err").textContent = `${getStaff(st).name} doesn't offer this service.`);
      if (!$("n-name").value.trim()) return ($("n-err").textContent = "Please add the client's name.");
      entry = { type: "booking", service: sv.id, dur: sv.dur, name: $("n-name").value.trim(), phone: $("n-phone").value.trim(), source: "phone" };
    } else {
      entry = { type: "block", dur: +$("n-dur").value, name: $("n-reason").value.trim() || "Blocked" };
    }
    if (s + entry.dur > hoursFor(cur)[1]) return ($("n-err").textContent = "That runs past closing time.");
    if (!isFree(all, cur, st, s, entry.dur)) return ($("n-err").textContent = "That clashes with another booking.");
    all.push({ id: uid(), date: cur, start: s, staff: st, created: new Date().toISOString(), ...entry });
    saveBookings(all); close(); render();
    toast(mode === "booking" ? "Booking added. Client gets a confirmation text (demo)." : "Time blocked. It won't show online.");
  };
  draw();
  modal.classList.add("open");
}

function openView(id) {
  const b = loadBookings().find((x) => x.id === id);
  if (!b) return;
  const st = getStaff(b.staff);
  if (b.type === "block") {
    card.innerHTML = `<h3>${esc(b.name)}</h3>
      <div class="recap"><div><span>Stylist</span><b>${st.name}</b></div><div><span>Time</span><b>${minToTime(b.start)}–${minToTime(b.start + b.dur)}</b></div></div>
      <div class="actions"><button class="btn ghost small" id="v-close">Close</button><button class="btn danger small" id="v-del">Remove block</button></div>`;
  } else {
    const sv = getService(b.service);
    card.innerHTML = `<h3>${esc(b.name)}</h3>
      <div class="recap">
        <div><span>Service</span><b>${esc(sv.name)}</b></div>
        <div><span>When</span><b>${niceDate(b.date, { weekday: "short", day: "numeric", month: "short" })}, ${minToTime(b.start)}–${minToTime(b.start + b.dur)}</b></div>
        <div><span>Stylist</span><b>${st.name}</b></div>
        <div><span>Price</span><b>£${sv.price}</b></div>
        <div><span>Mobile</span><b>${esc(b.phone) || "–"}</b></div>
        ${b.email ? `<div><span>Email</span><b>${esc(b.email)}</b></div>` : ""}
        <div><span>Booked via</span><b>${b.source === "website" ? "Website (online)" : "Phone / in salon"}</b></div>
        ${b.notes ? `<div><span>Notes</span><b>${esc(b.notes)}</b></div>` : ""}
      </div>
      <div class="actions">
        <button class="btn ghost small" id="v-remind">Send reminder</button>
        <button class="btn danger small" id="v-del">Cancel booking</button>
        <button class="btn small" id="v-close">Close</button>
      </div>`;
    $("v-remind").onclick = () => toast(`Reminder text sent to ${b.name.split(" ")[0]} (demo).`);
  }
  $("v-close").onclick = close;
  $("v-del").onclick = () => askConfirm(
    b.type === "block" ? "Remove this block?" : `Cancel ${esc(b.name)}'s booking? The slot becomes free online again.`,
    b.type === "block" ? "Remove" : "Cancel booking",
    () => {
      saveBookings(loadBookings().filter((x) => x.id !== id)); close(); render();
      toast(b.type === "block" ? "Block removed." : "Booking cancelled. Client notified (demo).");
    });
  modal.classList.add("open");
}

// In-page confirmation (browser confirm() dialogs are blocked where the demo is hosted).
function askConfirm(message, okLabel, onOk) {
  card.innerHTML = `<h3>Are you sure?</h3><p style="margin:0 0 6px">${message}</p>
    <div class="actions"><button class="btn ghost small" id="c-no">Go back</button><button class="btn danger small" id="c-yes">${okLabel}</button></div>`;
  $("c-no").onclick = close;
  $("c-yes").onclick = onOk;
  modal.classList.add("open");
}

/* ---------- wiring ---------- */
$("prev").onclick = () => shift(-1);
$("next").onclick = () => shift(1);
$("today").onclick = () => { cur = dateKey(new Date()); render(); };
$("pick").onchange = (e) => { if (e.target.value) { cur = e.target.value; render(); } };
$("add-btn").onclick = () => openNew();
$("reset").onclick = () => askConfirm("Reset all demo bookings to the sample data?", "Reset", () => {
  resetDemo(); close(); render(); toast("Demo data reset.");
});
window.addEventListener("storage", render); // live update if a booking is made in another tab

render();
