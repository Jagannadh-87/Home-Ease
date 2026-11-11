const m = require('mongoose');
module.exports = m.model('Service', new m.Schema({ name: String, category: String, price: Number, duration: String, description: String }));
