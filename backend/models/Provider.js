const m = require('mongoose');
module.exports = m.model('Provider', new m.Schema({ user: m.Schema.Types.ObjectId, name: String, category: String, rating: { type: Number, default: 4 }, reviewCount: { type: Number, default: 0 }, experience: Number, jobsDone: { type: Number, default: 0 }, available: { type: Boolean, default: true }, city: String }));
