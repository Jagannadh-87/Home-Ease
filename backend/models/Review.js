const m = require('mongoose');
const O = m.Schema.Types.ObjectId;
module.exports = m.model('Review', new m.Schema({ booking: O, provider: O, customer: O, customerName: String, rating: Number, comment: String }, { timestamps: true }));
