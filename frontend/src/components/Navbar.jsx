import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo, Btn } from './ui';
export default function Navbar() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <div className="flex items-center gap-3">
          {user ? <>
            <Link to={'/' + user.role} className="text-sm text-gray-600 hover:text-indigo-600">Dashboard</Link>
            <span className="text-sm text-gray-400 hidden sm:inline">{user.name} ({user.role})</span>
            <Btn variant="ghost" onClick={() => { logout(); nav('/'); }}><LogOut size={14} className="inline mr-1" />Logout</Btn>
          </> : <><Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">Login</Link><Link to="/login?mode=register"><Btn>Sign up</Btn></Link></>}
        </div>
      </div>
    </nav>
  );
}
