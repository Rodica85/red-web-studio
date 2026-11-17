// Shared data + booking logic for the demo salon.
// Everything is stored in the browser (localStorage) — no server needed for the demo.

const SALON = {
  name: "Willow & Thames",
  tagline: "Hair Studio · Abingdon-on-Thames",
  phone: "01235 000 000",
  email: "hello@willowandthames.demo",
  address: "Market Place, Abingdon-on-Thames, OX14",
};

// Opening hours per weekday (0 = Sunday). Values in hours, null = closed.
const HOURS = { 0: null, 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 20], 5: [9, 18], 6: [8.5, 16] };

const SERVICES = [
  { id: "cut-f", cat: "Cut & Style", name: "Women's cut & blow-dry", dur: 60, price: 48 },
  { id: "cut-m", cat: "Cut & Style", name: "Men's cut", dur: 30, price: 24 },
  { id: "blow", cat: "Cut & Style", name: "Blow-dry", dur: 45, price: 30 },
  { id: "kids", cat: "Cut & Style", name: "Children's cut (under 12)", dur: 30, price: 16 },
  { id: "roots", cat: "Colour", name: "Root tint", dur: 90, price: 62 },
  { id: "full", cat: "Colour", name: "Full head colour", dur: 120, price: 85 },
  { id: "bal", cat: "Colour", name: "Balayage", dur: 180, price: 140 },
  { id: "toner", cat: "Colour", name: "Gloss & toner", dur: 45, price: 35 },
  { id: "treat", cat: "Treatments", name: "Bond repair treatment", dur: 30, price: 28 },
  { id: "updo", cat: "Treatments", name: "Occasion up-do", dur: 60, price: 55 },
];

// `does`: list of service ids this person offers (null = everything)
const STAFF = [
  { id: "emma", name: "Emma", role: "Founder & Senior Stylist", days: [2, 3, 4, 5, 6], color: "#8a6d45", does: null,
    bio: "Fifteen years behind the chair, trained in London. Known for precise bobs and cuts that grow out well." },
  { id: "priya", name: "Priya", role: "Colour Specialist", days: [2, 3, 4, 5], color: "#9a6464", does: null,
    bio: "Balayage, blonding and colour corrections. If you want lived-in colour that still looks good in month three, ask Priya." },
  { id: "tom", name: "Tom", role: "Stylist & Barber", days: [3, 4, 5, 6], color: "#4d5a66", does: ["cut-m", "cut-f", "blow", "kids", "treat"],
    bio: "Sharp fades, classic gents' cuts and relaxed short styles for everyone. Saturday mornings book up fast." },
];

const STORE_KEY = "wt_demo_bookings_v1";

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const minToTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const niceDate = (k, opts) =>
  parseKey(k).toLocaleDateString("en-GB", opts || { weekday: "long", day: "numeric", month: "long" });
const hoursFor = (k) => { const h = HOURS[parseKey(k).getDay()]; return h ? [h[0] * 60, h[1] * 60] : null; };
const getService = (id) => SERVICES.find((s) => s.id === id);
const getStaff = (id) => STAFF.find((s) => s.id === id);
const canDo = (st, serviceId) => !st.does || st.does.includes(serviceId);
const durLabel = (m) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- storage ---------- */
// In-memory copy so the demo still works where browser storage is unavailable.
let memoryBookings = null;
function loadBookings() {
  let b = null;
  try { b = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { b = null; }
  if (!Array.isArray(b)) b = memoryBookings;
  if (!Array.isArray(b)) { b = seedBookings(); saveBookings(b); }
  return b.slice();
}
function saveBookings(b) {
  memoryBookings = b.slice();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(b)); } catch (e) { /* storage unavailable: keep in memory */ }
}
function resetDemo() {
  memoryBookings = null;
  try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
  return loadBookings();
}

// Fill the next 10 days with plausible bookings so the calendar looks real.
function seedBookings() {
  const names = ["Sarah Mitchell", "James Carter", "Olivia Hughes", "Chloe Bennett", "Daniel Wright", "Hannah Price",
    "Lucy Turner", "Mark Ellis", "Grace Fowler", "Amelia Shaw", "Ben Collins", "Sophie Ward", "Ella Brooks", "Harry Dean"];
  let seed = 11;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const out = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const k = dateKey(d);
    const h = hoursFor(k);
    if (!h) continue;
    STAFF.forEach((st) => {
      if (!st.days.includes(d.getDay())) return;
      const options = SERVICES.filter((s) => canDo(st, s.id));
      let t = h[0] + Math.floor(rnd() * 3) * 15;
      while (t < h[1] - 30) {
        if (rnd() < 0.5) {
          const sv = options[Math.floor(rnd() * options.length)];
          if (t + sv.dur <= h[1]) {
            out.push({
              id: uid(), type: "booking", date: k, start: t, dur: sv.dur, staff: st.id, service: sv.id,
              name: names[Math.floor(rnd() * names.length)],
              phone: "07700 900" + String(100 + Math.floor(rnd() * 899)), email: "",
              source: rnd() < 0.65 ? "website" : "phone",
            });
            t += sv.dur;
          }
        }
        t += 15 * (1 + Math.floor(rnd() * 3));
      }
    });
  }
  return out;
}

/* ---------- availability ---------- */
function isFree(bookings, k, staffId, start, dur, ignoreId) {
  return !bookings.some((b) => b.id !== ignoreId && b.date === k && b.staff === staffId &&
    start < b.start + b.dur && b.start < start + dur);
}

// Returns [{start, staff}] — for "any", picks the first stylist free at that time.
function slotsFor(k, serviceId, staffId) {
  const h = hoursFor(k);
  if (!h) return [];
  const sv = getService(serviceId);
  const day = parseKey(k).getDay();
  const bookings = loadBookings();
  const now = new Date();
  const isToday = k === dateKey(now);
  const earliest = now.getHours() * 60 + now.getMinutes() + 60; // min. 1h notice
  const pool = (staffId === "any" ? STAFF : [getStaff(staffId)])
    .filter((s) => s.days.includes(day) && canDo(s, serviceId));
  const res = [];
  for (let t = h[0]; t + sv.dur <= h[1]; t += 15) {
    if (isToday && t < earliest) continue;
    const s = pool.find((p) => isFree(bookings, k, p.id, t, sv.dur));
    if (s) res.push({ start: t, staff: s.id });
  }
  return res;
}
