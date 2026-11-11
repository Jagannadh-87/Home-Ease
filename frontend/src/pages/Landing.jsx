import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Clock, BadgeIndianRupee, Wrench, CalendarCheck, ThumbsUp } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { CATS, CatIcon, Card, Btn, Rating, Logo } from '../components/ui';

export default function Landing() {
  const [q, setQ] = useState(''); const [prov, setProv] = useState([]); const { user } = useAuth(); const nav = useNavigate();
  useEffect(() => { api.get('/providers').then(r => setProv(r.data.slice(0, 4))).catch(() => {}); }, []);
  const go = () => nav(user ? '/' + user.role : '/login');
  const cats = CATS.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Navbar />
      <section className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Reliable Home Services, Just a Click Away</h1>
          <p className="mt-4 text-indigo-100 max-w-xl mx-auto">Book verified electricians, plumbers, AC technicians, cleaners, carpenters and painters in minutes.</p>
          <div className="mt-8 max-w-xl mx-auto bg-white rounded-2xl p-2 flex items-center shadow-lg">
            <Search className="text-gray-400 mx-3" size={18} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search services e.g. Plumber" className="flex-1 text-gray-800 outline-none text-sm" />
            <Btn onClick={go}>Book now</Btn>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-6">Popular services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map(c => <button key={c} onClick={go} className="text-left"><Card className="hover:shadow-md transition text-center"><div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3"><CatIcon cat={c} /></div><div className="text-sm font-medium">{c}</div></Card></button>)}
          {!cats.length && <p className="text-gray-500 col-span-full">No match. Try another keyword.</p>}
        </div>
      </section>
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[[Wrench, 'Choose a service', 'Pick what you need or describe the problem to our AI assistant.'], [CalendarCheck, 'Book a slot', 'Select date, address and your preferred provider.'], [ThumbsUp, 'Relax & review', 'A verified pro arrives. Pay and rate after the job.']].map(([I, t, d], i) => (
              <Card key={t} className="text-center"><div className="mx-auto w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-3"><I size={20} /></div><div className="font-semibold">{i + 1}. {t}</div><p className="text-sm text-gray-500 mt-1">{d}</p></Card>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-6">Featured providers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prov.map(p => <Card key={p._id}><div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">{p.name[0]}</div><div className="font-semibold">{p.name}</div><div className="text-sm text-gray-500">{p.category} · {p.experience} yrs</div><div className="mt-1"><Rating v={p.rating} /> <span className="text-xs text-gray-400">({p.reviewCount} reviews)</span></div></Card>)}
        </div>
      </section>
      <section className="bg-indigo-50 py-14">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[[ShieldCheck, 'Verified professionals', 'Every provider is background checked.'], [Clock, 'On-time service', 'Track your booking from request to completion.'], [BadgeIndianRupee, 'Transparent pricing', 'Upfront prices. No surprises.']].map(([I, t, d]) => (
            <div key={t} className="flex gap-3"><I className="text-indigo-600 shrink-0" /><div><div className="font-semibold">Why choose us: {t}</div><p className="text-sm text-gray-600">{d}</p></div></div>
          ))}
        </div>
      </section>
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm"><div className="flex justify-center mb-2 [&_*]:!text-white"><Logo /></div>© 2026 HomeEase · DevOps Lab Project · <Link to="/login" className="underline">Login</Link></footer>
    </div>
  );
}
