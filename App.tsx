
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePayment from './pages/CreatePayment';
import Withdraw from './pages/Withdraw';
import Checkout from './pages/Checkout';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-pix text-white">
       <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
       <div className="font-bold text-xl animate-pulse">PATOPAY</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {session && <Sidebar />}
      
      <main className="flex-1 relative pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/pay/:id" element={<Checkout />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create-payment" element={session ? <CreatePayment /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={session ? <Withdraw /> : <Navigate to="/login" />} />
          <Route path="/settings" element={session ? <Settings /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {session && <MobileNav />}
    </div>
  );
};

export default App;
