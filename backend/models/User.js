const m = require('mongoose');
module.exports = m.model('User', new m.Schema({ name: String, email: { type: String, unique: true, lowercase: true }, password: String, role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' } }, { timestamps: true }));
