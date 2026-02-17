
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Início', path: '/dashboard', icon: '📊' },
    { label: 'Cobrar', path: '/create-payment', icon: '➕' },
    { label: 'Sacar', path: '/withdraw', icon: '💸' },
    { label: 'Ajustes', path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === item.path ? 'text-pix scale-110' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
