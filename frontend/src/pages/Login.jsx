import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo, Card, Btn, Input, CATS } from '../components/ui';
const DEMO = [['Customer', 'customer@homeease.com', 'customer123'], ['Provider', 'provider@homeease.com', 'provider123'], ['Admin', 'admin@homeease.com', 'admin123']];
export default function Login() {
  const [params] = useSearchParams(); const nav = useNavigate(); const { login, register } = useAuth();
  const [reg, setReg] = useState(params.get('mode') === 'register');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'customer', category: CATS[0] });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { const u = reg ? await register(f) : await login(f.email, f.password); nav('/' + u.role); }
    catch (x) { setErr(x.response?.data?.message || 'Something went wrong'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      <div className="w-full max-w-md space-y-4">
        <Link to="/" className="flex justify-center"><Logo /></Link>
        <Card>
          <h2 className="text-xl font-bold mb-4">{reg ? 'Create account' : 'Welcome back'}</h2>
          <form onSubmit={submit} className="space-y-3">
            {reg && <Input placeholder="Full name" value={f.name} onChange={set('name')} required />}
            <Input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
            <Input type="password" placeholder="Password" value={f.password} onChange={set('password')} required />
            {reg && <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={f.role} onChange={set('role')}><option value="customer">I need services (Customer)</option><option value="provider">I provide services (Provider)</option></select>}
            {reg && f.role === 'provider' && <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={f.category} onChange={set('category')}>{CATS.map(c => <option key={c}>{c}</option>)}</select>}
            {err && <p className="text-sm text-red-600">{err}</p>}
            <Btn className="w-full">{reg ? 'Sign up' : 'Login'}</Btn>
          </form>
          <button className="text-sm text-indigo-600 mt-3" onClick={() => setReg(!reg)}>{reg ? 'Already have an account? Login' : 'New here? Create account'}</button>
        </Card>
        <Card className="text-sm">
          <div className="font-semibold mb-2">Demo accounts (click to fill)</div>
          {DEMO.map(([r, e, p]) => <button key={r} onClick={() => { setReg(false); setF({ ...f, email: e, password: p }); }} className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-50"><b>{r}</b> · {e} / {p}</button>)}
        </Card>
      </div>
    </div>
  );
}
