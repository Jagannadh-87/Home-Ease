import { useEffect, useState } from 'react';
import { Search, Bot, X } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Card, Btn, Input, StatusBadge, Tabs, CatIcon, CATS, Rating } from '../components/ui';

function BookModal({ service, onClose, onDone }) {
  const [providers, setProviders] = useState([]);
  const [f, setF] = useState({ date: '', address: '', notes: '', providerId: '' });
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/providers', { params: { category: service.category } }).then(r => setProviders(r.data)); }, [service]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { await api.post('/bookings', { ...f, serviceId: service._id }); onDone(); } catch (x) { setErr(x.response?.data?.message || 'Failed'); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20">
      <Card className="w-full max-w-md">
        <div className="flex justify-between mb-3"><h3 className="font-bold">Book: {service.name}</h3><button onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="date" required value={f.date} onChange={set('date')} />
          <Input placeholder="Address" required value={f.address} onChange={set('address')} />
          <Input placeholder="Notes (optional)" value={f.notes} onChange={set('notes')} />
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={f.providerId} onChange={set('providerId')}>
            <option value="">Any available provider</option>
            {providers.map(p => <option key={p._id} value={p._id}>{p.name} · ★ {p.rating}</option>)}
          </select>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Btn className="w-full">Confirm booking · ₹{service.price}</Btn>
        </form>
      </Card>
    </div>
  );
}

function ReviewBox({ booking, onDone }) {
  const [rating, setRating] = useState(5); const [comment, setComment] = useState('');
  const send = async () => { await api.post('/reviews', { bookingId: booking._id, rating, comment }); onDone(); };
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      <select className="border rounded-xl px-2 text-sm" value={rating} onChange={e => setRating(e.target.value)}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}</select>
      <Input className="flex-1 min-w-[140px]" placeholder="Write a review" value={comment} onChange={e => setComment(e.target.value)} />
      <Btn onClick={send}>Submit</Btn>
    </div>
  );
}

function Assistant({ onPick }) {
  const [text, setText] = useState(''); const [res, setRes] = useState(null);
  const ask = async () => { if (text.trim()) setRes((await api.post('/ai/analyze', { text })).data); };
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1 font-semibold"><Bot className="text-indigo-600" /> AI Assistant <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Rule-based demo AI</span></div>
      <p className="text-sm text-gray-500 mb-3">Describe your problem, e.g. "My AC is not cooling". Uses keyword matching only, no external AI.</p>
      <div className="flex gap-2"><Input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="What's the problem?" /><Btn onClick={ask}>Analyze</Btn></div>
      {res && (
        <div className="mt-4 bg-indigo-50 rounded-xl p-4 text-sm space-y-1">
          <div><b>Category:</b> {res.category}</div>
          <div><b>Estimated duration:</b> {res.duration}</div>
          {res.matchedKeywords.length > 0 && <div><b>Matched keywords:</b> {res.matchedKeywords.join(', ')}</div>}
          <div className="text-gray-700">{res.reply}</div>
          {res.providers.length > 0 && <div><b>Recommended providers:</b> {res.providers.map(p => `${p.name} (★${p.rating})`).join(', ')}</div>}
          {res.category !== 'General' && <Btn className="mt-2" onClick={() => onPick(res.category)}>Browse {res.category} services</Btn>}
        </div>
      )}
    </Card>
  );
}

export default function Customer() {
  const [tab, setTab] = useState('Services');
  const [services, setServices] = useState([]); const [bookings, setBookings] = useState([]); const [reviews, setReviews] = useState([]);
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [sel, setSel] = useState(null);
  const load = async () => {
    const [s, b, r] = await Promise.all([api.get('/services'), api.get('/bookings'), api.get('/reviews')]);
    setServices(s.data); setBookings(b.data); setReviews(r.data);
  };
  useEffect(() => { load(); }, []);
  const shown = services.filter(s => (cat === 'All' || s.category === cat) && s.name.toLowerCase().includes(q.toLowerCase()));
  const act = fn => async () => { await fn(); load(); };
  return (
    <div><Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
        <Tabs tabs={['Services', 'My Bookings', 'AI Assistant']} tab={tab} setTab={setTab} />
        {tab === 'Services' && <>
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-2.5 text-gray-400" /><Input className="!pl-9" placeholder="Search services" value={q} onChange={e => setQ(e.target.value)} /></div>
            <select className="border border-gray-200 rounded-xl px-3 text-sm bg-white" value={cat} onChange={e => setCat(e.target.value)}><option>All</option>{CATS.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map(s => (
              <Card key={s._id}>
                <div className="flex items-center gap-3 mb-2"><div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl"><CatIcon cat={s.category} /></div><div><div className="font-semibold">{s.name}</div><div className="text-xs text-gray-500">{s.category} · {s.duration}</div></div></div>
                <p className="text-sm text-gray-500 mb-3">{s.description}</p>
                <div className="flex items-center justify-between"><span className="font-bold text-indigo-600">₹{s.price}</span><Btn onClick={() => setSel(s)}>Book</Btn></div>
              </Card>
            ))}
            {!shown.length && <p className="text-gray-500">No services found.</p>}
          </div>
        </>}
        {tab === 'My Bookings' && <div className="space-y-3">
          {bookings.map(b => (
            <Card key={b._id}>
              <div className="flex justify-between flex-wrap gap-2">
                <div><div className="font-semibold">{b.serviceName}</div><div className="text-sm text-gray-500">{b.date} · {b.providerName || 'Awaiting provider'} · ₹{b.price}</div></div>
                <div className="flex items-center gap-2"><StatusBadge s={b.status} />{b.paid && <span className="text-xs text-green-600">Paid</span>}</div>
              </div>
              <div className="flex gap-2 mt-3">
                {!b.paid && !['cancelled', 'rejected'].includes(b.status) && <Btn onClick={act(() => api.post('/payments', { bookingId: b._id }))}>Pay (demo)</Btn>}
                {b.status === 'pending' && <Btn variant="danger" onClick={act(() => api.patch(`/bookings/${b._id}/status`, { status: 'cancelled' }))}>Cancel</Btn>}
              </div>
              {b.status === 'completed' && (reviews.some(r => r.booking === b._id)
                ? <div className="mt-3 text-sm text-gray-500">Reviewed: <Rating v={reviews.find(r => r.booking === b._id).rating} /> {reviews.find(r => r.booking === b._id).comment}</div>
                : <ReviewBox booking={b} onDone={load} />)}
            </Card>
          ))}
          {!bookings.length && <p className="text-gray-500">No bookings yet.</p>}
        </div>}
        {tab === 'AI Assistant' && <Assistant onPick={c => { setCat(c); setTab('Services'); }} />}
      </div>
      {sel && <BookModal service={sel} onClose={() => setSel(null)} onDone={() => { setSel(null); setTab('My Bookings'); load(); }} />}
    </div>
  );
}
