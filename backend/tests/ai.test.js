const { classify, support } = require('../utils/ai');
describe('rule-based AI classification', () => {
  test.each([
    ['My AC is not cooling', 'AC Technician', '60–90 minutes'],
    ['The tap is leaking in kitchen', 'Plumber', '45–90 minutes'],
    ['Fan not working and switch sparks', 'Electrician', '30–60 minutes'],
    ['Need deep cleaning of my sofa', 'Home Cleaner', '2–4 hours'],
    ['Wardrobe door hinge broken', 'Carpenter', '1–3 hours'],
    ['Want to paint the walls', 'Painter', '4–8 hours'],
  ])('%s -> %s', (text, cat, dur) => {
    const r = classify(text);
    expect(r.category).toBe(cat);
    expect(r.duration).toBe(dur);
  });
  test('unknown text falls back to General', () => expect(classify('hello world').category).toBe('General'));
  test('support reply for refund', () => expect(support('I want a refund')).toMatch(/Refund/i));
});
