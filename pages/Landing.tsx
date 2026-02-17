
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../constants';

const Landing: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden animate-in fade-in duration-1000">
      <header className="px-6 md:px-10 py-8 md:py-12 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-3xl z-50 max-w-[1600px] mx-auto w-full">
        <Logo size={32} />
        <div className="hidden lg:flex items-center gap-16 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
          <a href="#features" className="hover:text-pix transition-all">Tecnologia</a>
          <a href="#api" className="hover:text-pix transition-all">Ecossistema</a>
          <a href="#pricing" className="hover:text-pix transition-all">Taxa Única</a>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/login" className="text-xs font-black text-gray-900 px-4 md:px-8 py-4 hover:bg-gray-50 rounded-[24px] transition uppercase tracking-widest">Login</Link>
          <Link to="/register" className="bg-gray-900 text-white px-6 md:px-12 py-4 md:py-6 rounded-[20px] md:rounded-[28px] font-[900] text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all">Abrir Conta</Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Extreme Hero */}
        <section className="pt-20 md:pt-40 pb-32 md:pb-72 px-6 relative">
          <div className="absolute top-0 right-0 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-pix/10 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto text-center space-y-12 md:space-y-20">
            <div className="inline-flex items-center gap-5 px-6 md:px-10 py-3 md:py-4 bg-gray-900 text-white rounded-full text-[9px] md:text-[11px] font-[900] uppercase tracking-[0.4em] shadow-xl border border-white/10">
              <span className="w-2 h-2 bg-pix rounded-full animate-ping"></span>
              Gateway PIX Nº 1 para Escala
            </div>
            
            <h1 className="text-[60px] md:text-[120px] lg:text-[180px] font-[900] text-gray-900 leading-[0.85] tracking-tighter max-w-7xl mx-auto relative">
              Escala <br/> <span className="text-pix">Instantânea.</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-gray-400 font-medium max-w-4xl mx-auto leading-tight tracking-tight px-4">
              Sua infraestrutura de pagamentos com taxa fixa de <span className="text-gray-900 font-[900]">R$ 4,00</span>. Sem porcentagens. Sem letras miúdas. Sem espera.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 md:gap-10 justify-center pt-8">
              <Link to="/register" className="px-12 md:px-20 py-6 md:py-10 bg-pix text-white text-xl md:text-3xl font-[900] rounded-[30px] md:rounded-[40px] shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-8 border-pix/30">Vender Agora 🚀</Link>
              <button className="px-12 md:px-20 py-6 md:py-10 bg-white border-4 border-gray-100 text-gray-900 text-xl md:text-3xl font-[900] rounded-[30px] md:rounded-[40px] hover:border-pix hover:shadow-2xl transition-all">API Docs</button>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-24 md:py-48 bg-gray-50 px-6">
          <div className="max-w-[1400px] mx-auto space-y-20">
            <div className="grid md:grid-cols-12 gap-6 md:gap-10">
              <div className="md:col-span-7 bg-white p-12 md:p-24 rounded-[40px] md:rounded-[80px] border-4 border-white shadow-sm space-y-8">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-pix/10 text-pix flex items-center justify-center rounded-[20px] md:rounded-[40px] text-4xl md:text-6xl">⚡</div>
                <h3 className="text-4xl md:text-6xl font-[900] tracking-tighter text-gray-900 leading-tight">Liquidez Real.<br/>No seu bolso em 1s.</h3>
                <p className="text-lg md:text-2xl text-gray-400 font-medium leading-tight">Conectado diretamente à nossa rede de alta performance, garantimos que cada PIX esteja disponível para saque no mesmo instante.</p>
              </div>
              
              <div className="md:col-span-5 bg-gray-900 p-12 md:p-20 rounded-[40px] md:rounded-[80px] text-white space-y-8 flex flex-col justify-between shadow-2xl overflow-hidden relative">
                <div className="text-6xl md:text-8xl text-pix font-black">R$ 4</div>
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-5xl font-[900] tracking-tighter leading-none">Taxa Única por Transação.</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Não importa o volume, a taxa é fixa.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 md:py-48 bg-white border-t-8 border-gray-50 px-6 md:px-10">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <Logo size={40} />
          <p className="text-[11px] font-[900] text-gray-300 uppercase tracking-[0.5em]">© 2025 PATOPAY S.A. | INFRAESTRUTURA DE PAGAMENTOS PRÓPRIA</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
