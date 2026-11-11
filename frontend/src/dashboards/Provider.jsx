import { useEffect, useState } from 'react';
import { Briefcase, IndianRupee, Star, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Card, Btn, StatusBadge, Stat, Tabs, Rating } from '../components/ui';

export default function Provider() {
  const [tab, setTab] = useState('Available Jobs');
  const [me, setMe] = useState(null); const [bookings, setBookings] = useState([]); const [hidden, setHidden] = useState([]);
  const load = async () => { const [p, b] = await Promise.all([api.get('/providers/me'), api.get('/bookings')]); setMe(p.data); setBookings(b.data); };
  useEffect(() => { load(); }, []);
  const set = async (id, status) => { await api.patch(`/bookings/${id}/status`, { status }); load(); };
  const available = bookings.filter(b => b.status === 'pending' && !hidden.includes(b._id));
  const mine = bookings.filter(b => me && String(b.provider) === String(me._id));
  const earned = mine.filter(b => b.status === 'completed').reduce((s, b) => s + b.price * 0.8, 0); // demo: 80% payout
  const Job = ({ b }) => (
    <Card>
      <div className="flex justify-between flex-wrap gap-2">
        <div><div className="font-semibold">{b.serviceName}</div><div className="text-sm text-gray-500">{b.customerName} · {b.date} · {b.address}</div>{b.notes && <div className="text-xs text-gray-400">Note: {b.notes}</div>}</div>
        <div className="text-right"><StatusBadge s={b.status} /><div className="font-bold text-indigo-600 mt-1">₹{b.price}</div></div>
      </div>
      <div className="flex gap-2 mt-3">
        {b.status === 'pending' && <><Btn onClick={() => set(b._id, 'accepted')}>Accept</Btn><Btn variant="danger" onClick={() => b.provider ? set(b._id, 'rejected') : setHidden([...hidden, b._id])}>Reject</Btn></>}
        {b.status === 'accepted' && <Btn onClick={() => set(b._id, 'in-progress')}>Start job</Btn>}
        {b.status === 'in-progress' && <Btn onClick={() => set(b._id, 'completed')}>Mark completed</Btn>}
      </div>
    </Card>
  );
  return (
    <div><Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Provider Dashboard</h1>
        {me && <Card className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">{me.name[0]}</div>
          <div><div className="font-semibold text-lg">{me.name}</div><div className="text-sm text-gray-500">{me.category} · {me.experience} yrs · {me.city}</div><Rating v={me.rating} /></div>
        </Card>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat icon={Briefcase} label="Available jobs" value={available.length} />
          <Stat icon={CheckCircle2} label="Jobs completed" value={me?.jobsDone ?? 0} />
          <Stat icon={Star} label="Rating" value={me?.rating ?? '-'} />
          <Stat icon={IndianRupee} label="Earnings (demo)" value={'₹' + Math.round(earned)} />
        </div>
        <Tabs tabs={['Available Jobs', 'My Jobs']} tab={tab} setTab={setTab} />
        <div className="space-y-3">
          {(tab === 'Available Jobs' ? available : mine).map(b => <Job key={b._id} b={b} />)}
          {!(tab === 'Available Jobs' ? available : mine).length && <p className="text-gray-500">Nothing here yet.</p>}
        </div>
      </div>
    </div>
  );
}
