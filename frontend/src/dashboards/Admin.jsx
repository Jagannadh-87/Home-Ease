import { useEffect, useState } from 'react';
import { Users, Wrench, CalendarCheck, IndianRupee, RefreshCw, GitCommit, Hash, Tag, Server, HeartPulse, Clock } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Card, Btn, Input, Stat, Tabs, StatusBadge, CATS } from '../components/ui';

function BuildInspector() {
  const [info, setInfo] = useState(null); const [health, setHealth] = useState(null); const [at, setAt] = useState('');
  const load = async () => {
    api.get('/info').then(r => setInfo(r.data)).catch(() => setInfo(null));
    api.get('/health').then(r => setHealth(r.data)).catch(e => setHealth(e.response?.data || { status: 'DOWN', database: 'unknown' }));
    setAt(new Date().toLocaleTimeString());
  };
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);
  const rows = info ? [[Hash, 'Build number', '#' + info.buildNumber], [GitCommit, 'Git commit SHA', info.gitCommit.slice(0, 7), info.gitCommit], [Tag, 'App version', 'v' + info.version], [Server, 'Environment', info.environment], [Clock, 'Build timestamp', info.buildTimestamp]] : [];
  const ok = health?.status === 'UP';
  return (
    <Card className="mb-8 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2"><Server className="text-indigo-600" size={20} /> DevOps Build Inspector</h2>
        <Btn variant="ghost" onClick={load}><RefreshCw size={14} className="inline mr-1" />Refresh <span className="text-xs text-gray-400">({at})</span></Btn>
      </div>
      {!info ? <p className="text-red-600 text-sm">Cannot reach /api/info</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map(([I, l, v, title]) => <div key={l} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"><I size={18} className="text-indigo-600" /><div><div className="text-xs text-gray-500">{l}</div><div className="font-mono text-sm font-semibold" title={title}>{v}</div></div></div>)}
          <div className={`rounded-xl p-3 flex items-center gap-3 ${ok ? 'bg-green-50' : 'bg-red-50'}`}><HeartPulse size={18} className={ok ? 'text-green-600' : 'text-red-600'} /><div><div className="text-xs text-gray-500">Application health</div><div className="text-sm font-semibold">{health?.status || '...'} · DB {health?.database || '...'}</div></div></div>
        </div>
      )}
    </Card>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('Users');
  const [stats, setStats] = useState({}); const [users, setUsers] = useState([]); const [services, setServices] = useState([]); const [bookings, setBookings] = useState([]);
  const [f, setF] = useState({ name: '', category: CATS[0], price: '', duration: '' });
  const load = async () => {
    const [s, u, sv, b] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/services'), api.get('/bookings')]);
    setStats(s.data); setUsers(u.data); setServices(sv.data); setBookings(b.data);
  };
  useEffect(() => { load(); }, []);
  const run = fn => async () => { await fn(); load(); };
  const th = 'text-left text-xs text-gray-500 font-medium p-2', td = 'p-2 text-sm border-t border-gray-100';
  return (
    <div><Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat icon={Users} label="Total customers" value={stats.customers ?? '-'} />
          <Stat icon={Wrench} label="Total providers" value={stats.providers ?? '-'} />
          <Stat icon={CalendarCheck} label="Total bookings" value={stats.bookings ?? '-'} />
          <Stat icon={IndianRupee} label="Revenue (demo)" value={'₹' + (stats.revenue ?? 0)} />
        </div>
        <BuildInspector />
        <Tabs tabs={['Users', 'Services', 'Bookings']} tab={tab} setTab={setTab} />
        <Card className="overflow-x-auto">
          {tab === 'Users' && <table className="w-full"><thead><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Role</th><th /></tr></thead><tbody>
            {users.map(u => <tr key={u._id}><td className={td}>{u.name}</td><td className={td}>{u.email}</td><td className={td}>{u.role}</td><td className={td}>{u.role !== 'admin' && <Btn variant="danger" onClick={run(() => api.delete('/admin/users/' + u._id))}>Delete</Btn>}</td></tr>)}</tbody></table>}
          {tab === 'Services' && <>
            <div className="flex gap-2 flex-wrap mb-4">
              <Input className="!w-auto flex-1" placeholder="Service name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
              <select className="border rounded-xl px-2 text-sm" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
              <Input className="!w-24" type="number" placeholder="₹ Price" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
              <Input className="!w-28" placeholder="Duration" value={f.duration} onChange={e => setF({ ...f, duration: e.target.value })} />
              <Btn onClick={run(async () => { if (f.name && f.price) { await api.post('/services', { ...f, price: Number(f.price), description: 'Added by admin' }); setF({ ...f, name: '', price: '', duration: '' }); } })}>Add</Btn>
            </div>
            <table className="w-full"><thead><tr><th className={th}>Service</th><th className={th}>Category</th><th className={th}>Price</th><th /></tr></thead><tbody>
              {services.map(s => <tr key={s._id}><td className={td}>{s.name}</td><td className={td}>{s.category}</td><td className={td}>₹{s.price}</td><td className={td}><Btn variant="danger" onClick={run(() => api.delete('/services/' + s._id))}>Delete</Btn></td></tr>)}</tbody></table>
          </>}
          {tab === 'Bookings' && <table className="w-full"><thead><tr><th className={th}>Service</th><th className={th}>Customer</th><th className={th}>Provider</th><th className={th}>Date</th><th className={th}>Status</th><th className={th}>Change</th></tr></thead><tbody>
            {bookings.map(b => <tr key={b._id}><td className={td}>{b.serviceName}</td><td className={td}>{b.customerName}</td><td className={td}>{b.providerName || '-'}</td><td className={td}>{b.date}</td><td className={td}><StatusBadge s={b.status} /></td>
              <td className={td}><select className="border rounded-lg text-xs p-1" value="" onChange={e => e.target.value && run(() => api.patch(`/bookings/${b._id}/status`, { status: e.target.value }))()}><option value="">Set…</option>{['accepted', 'in-progress', 'completed', 'cancelled'].map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>}
        </Card>
      </div>
    </div>
  );
}
