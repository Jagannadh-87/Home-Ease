const mongoose = require('mongoose');
const app = require('./app');
const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeease';
const PORT = process.env.PORT || 5000;

(async () => {
  app.listen(PORT, () => console.log(`HomeEase API listening on ${PORT}`));
  for (let i = 0; i < 30; i++) {
    try { await mongoose.connect(URI); console.log('MongoDB connected'); break; }
    catch (e) { console.log('MongoDB not ready, retrying...'); await new Promise(r => setTimeout(r, 2000)); }
  }
  if (process.env.SEED !== 'false') await require('./seed').run();
})();
