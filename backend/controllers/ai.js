const Provider = require('../models/Provider');
const { classify, support } = require('../utils/ai');
const { fail } = require('../middleware/async');

exports.analyze = async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) fail(400, 'text is required');
  const c = classify(text);
  const sup = support(text);
  const providers = c.category === 'General' ? [] : (await Provider.find({ category: c.category })).sort((a, b) => b.rating - a.rating).slice(0, 3);
  const reply = sup || (c.category === 'General'
    ? 'I could not identify the service. Try describing the problem, e.g. "my tap is leaking".'
    : `This looks like a job for a ${c.category}. Estimated time: ${c.duration}.`);
  res.json({ note: 'Rule-based demo AI (keyword matching, no external API)', ...c, reply, providers });
};
