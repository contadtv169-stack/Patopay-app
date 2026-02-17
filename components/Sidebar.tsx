
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { supabase } from '../supabase';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Criar Pagamento', path: '/create-payment', icon: '➕' },
    { label: 'Sacar PIX', path: '/withdraw', icon: '💸' },
    { label: 'Meu Perfil', path: '/settings', icon: '👤' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen flex flex-col hidden md:flex sticky top-0 overflow-y-auto">
      <div className="p-8 mb-8">
        <Logo size={40} />
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-pix/10 text-pix shadow-inner'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50 space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-pix text-white rounded-full flex items-center justify-center font-black text-sm">
            {user?.email?.[0].toUpperCase() || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-900 truncate">
              {user?.user_metadata?.full_name || 'Usuário Pato'}
            </p>
            <p className="text-[10px] text-gray-400 font-bold truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-xs font-black text-gray-400 hover:text-red-500 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
