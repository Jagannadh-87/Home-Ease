const m = require('mongoose');
const O = m.Schema.Types.ObjectId;
module.exports = m.model('Payment', new m.Schema({ booking: O, customer: O, amount: Number, method: String, status: String, txnId: String }, { timestamps: true }));
