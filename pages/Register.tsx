
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Logo } from '../constants';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          data: { full_name: name },
          emailRedirectTo: window.location.origin 
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // If Supabase is configured with email confirmation, session will be null
      if (data.user && !data.session) {
        setSuccess(true);
        setLoading(false);
      } else if (data.session) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      setError(err.message || 'Ocorreu um erro ao criar sua conta. Verifique os dados e tente novamente.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[64px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.1)] border border-gray-100 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-pix/10 text-pix rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">✉️</div>
          <h1 className="text-3xl font-[900] text-gray-900 tracking-tighter leading-none">Verifique seu email.</h1>
          <p className="text-gray-500 font-bold leading-relaxed">
            Enviamos um link de confirmação para <span className="text-gray-900">{email}</span>. Clique no link para ativar sua conta PatoPay.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gray-900 text-white font-[900] py-6 rounded-[32px] hover:bg-black transition-all"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[64px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.1)] border border-gray-100 space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-8">
            <Logo variant="icon" size={48} showText={false} />
          </div>
          <h1 className="text-4xl font-[900] text-gray-900 tracking-tighter leading-none">Crie sua conta.</h1>
          <p className="text-gray-400 font-bold text-sm tracking-tight">Comece a vender via PIX em minutos.</p>
        </div>

        {error && (
          <div className="p-5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-[24px] border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] ml-6">Nome Completo</label>
            <input 
              required 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-6 bg-gray-50 border-2 border-gray-50 rounded-[32px] focus:bg-white focus:border-pix focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
              placeholder="Ex: João da Silva" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] ml-6">Email Profissional</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-6 bg-gray-50 border-2 border-gray-50 rounded-[32px] focus:bg-white focus:border-pix focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
              placeholder="seu@email.com" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] ml-6">Sua Senha</label>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-6 bg-gray-50 border-2 border-gray-50 rounded-[32px] focus:bg-white focus:border-pix focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
              placeholder="No mínimo 6 caracteres" 
              minLength={6}
            />
          </div>
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-pix text-white font-[900] py-6 rounded-[32px] hover:bg-[#289a8d] hover:shadow-2xl hover:shadow-pix/40 transition-all active:scale-95 text-lg"
          >
            {loading ? 'Criando Conta...' : 'Criar Conta Grátis'}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-gray-400">
          Já tem uma conta? <Link to="/login" className="text-pix font-black hover:underline">Fazer Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
