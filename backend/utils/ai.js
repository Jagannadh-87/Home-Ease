// Rule-based DEMO "AI": keyword matching only, no external API.
const RULES = {
  'AC Technician': { d: '60–90 minutes', k: ['ac', 'air conditioner', 'cooling', 'not cooling', 'compressor', 'gas refill', 'split ac', 'hvac'] },
  Electrician: { d: '30–60 minutes', k: ['electric', 'wiring', 'switch', 'socket', 'fan', 'light', 'bulb', 'short circuit', 'mcb', 'power', 'sparks', 'fuse', 'inverter'] },
  Plumber: { d: '45–90 minutes', k: ['leak', 'leaking', 'tap', 'pipe', 'drain', 'water', 'toilet', 'flush', 'geyser', 'tank', 'blocked', 'clog', 'plumber'] },
  'Home Cleaner': { d: '2–4 hours', k: ['clean', 'cleaning', 'dust', 'sofa', 'sanitize', 'mop', 'deep clean', 'pest', 'dirty'] },
  Carpenter: { d: '1–3 hours', k: ['wood', 'door', 'furniture', 'cupboard', 'wardrobe', 'table', 'chair', 'hinge', 'drawer', 'bed', 'carpenter'] },
  Painter: { d: '4–8 hours', k: ['paint', 'painting', 'wall', 'walls', 'colour', 'color', 'seepage', 'ceiling', 'putty', 'whitewash'] },
};
const SUPPORT = [
  [/refund|money back/, 'Refunds are processed to the original payment method within 3–5 working days (demo policy).'],
  [/cancel/, 'You can cancel a pending booking from My Bookings at no charge.'],
  [/price|cost|charge|rate/, 'Prices are shown on each service card. No hidden charges in this demo.'],
  [/reschedule|change (the )?date/, 'Cancel the booking and create a new one with your preferred date.'],
  [/payment|pay/, 'Open My Bookings and click Pay. Payments are simulated in this demo.'],
];
const has = (text, w) => new RegExp(`\\b${w}\\b`).test(text);

exports.classify = (input = '') => {
  const t = String(input).toLowerCase();
  let best = null, hits = [];
  for (const [cat, r] of Object.entries(RULES)) {
    const h = r.k.filter(w => has(t, w));
    if (h.length > hits.length) { best = cat; hits = h; }
  }
  return { category: best || 'General', duration: best ? RULES[best].d : 'Varies', matchedKeywords: hits, confidence: best ? Math.min(0.5 + hits.length * 0.15, 0.95) : 0 };
};
exports.support = (input = '') => { const t = String(input).toLowerCase(); const r = SUPPORT.find(([re]) => re.test(t)); return r ? r[1] : null; };
