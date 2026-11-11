const m = require('mongoose');
const O = m.Schema.Types.ObjectId;
module.exports = m.model('Booking', new m.Schema({ customer: O, customerName: String, service: O, serviceName: String, category: String, provider: O, providerName: String, address: String, date: String, notes: String, price: Number, paid: { type: Boolean, default: false }, status: { type: String, default: 'pending' } }, { timestamps: true }));
