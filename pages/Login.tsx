
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Logo } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        if (loginError.message.includes('API key')) {
          setError('Configuração pendente: Use a Anon Key no Supabase.');
        } else {
          setError('Credenciais incorretas.');
        }
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro de conexão. Verifique suas chaves.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[64px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.12)] border-4 border-gray-50 space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Logo variant="icon" size={56} showText={false} />
          </div>
          <div>
            <h1 className="text-5xl font-[900] text-gray-900 tracking-tighter leading-none">PatoPay.</h1>
            <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest text-[10px]">Acesso ao Painel</p>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-[24px] border border-red-100 text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] ml-8">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[32px] focus:bg-white focus:border-pix focus:outline-none transition-all font-bold text-gray-700" placeholder="seu@email.com" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] ml-8">Senha</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[32px] focus:bg-white focus:border-pix focus:outline-none transition-all font-bold text-gray-700" placeholder="••••••••" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-gray-900 text-white font-[900] py-8 rounded-[32px] hover:bg-black hover:shadow-2xl transition-all active:scale-95 text-lg uppercase tracking-widest">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-gray-400">
          Ainda não tem conta? <Link to="/register" className="text-pix font-black hover:underline">Criar agora</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
