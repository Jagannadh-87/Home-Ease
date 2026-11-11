// Tiny in-memory stand-in for a Mongoose model so tests run without MongoDB.
module.exports = () => {
  const rows = []; let n = 0;
  const match = (r, q = {}) => Object.keys(q).every(k => String(r[k]) === String(q[k]));
  const wrap = r => { Object.defineProperty(r, 'save', { value: async () => r, enumerable: false }); return r; };
  return {
    create: async d => { const r = wrap({ _id: String(++n), ...d }); rows.push(r); return r; },
    find: async q => rows.filter(r => match(r, q)),
    findOne: async q => rows.find(r => match(r, q)) || null,
    findById: async id => rows.find(r => r._id === String(id)) || null,
    findByIdAndDelete: async id => { const i = rows.findIndex(r => r._id === String(id)); if (i >= 0) rows.splice(i, 1); },
    deleteOne: async q => { const i = rows.findIndex(r => match(r, q)); if (i >= 0) rows.splice(i, 1); },
    countDocuments: async () => rows.length,
  };
};
