
import React, { useEffect, useState } from 'react';
import { paymentApi } from '../services/api';
import { geminiSupport } from '../services/gemini';
import { Wallet } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: 'BRL' });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // PatoBot States
  const [step, setStep] = useState<'idle' | 'ask_phone' | 'success'>('idle');
  const [query, setQuery] = useState('');
  const [aiMessage, setAiMessage] = useState('Quack! Como posso te ajudar a lucrar hoje?');
  const [magicLoading, setMagicLoading] = useState(false);
  const [tempData, setTempData] = useState<any>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [createdTx, setCreatedTx] = useState<any>(null);

  const [liveVisitors] = useState(Math.floor(Math.random() * 100) + 1150);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setApiError(null);
      
      const walletRes = await paymentApi.getWallet();
      
      // Validação da estrutura de dados da Cakto
      const data = walletRes?.data || walletRes;
      
      if (data && (data.balance !== undefined)) {
        setWallet({
          balance: parseFloat(data.balance || "0"),
          currency: data.currency || "BRL"
        });
      } else {
        throw new Error("Resposta da conta incompleta.");
      }
    } catch (error: any) {
      console.error("Erro dashboard:", error);
      setApiError(error.message || "Erro na sincronização de dados.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const refresh = setInterval(() => {
      if (!apiError) fetchData(false);
    }, 45000); 
    return () => clearInterval(refresh);
  }, [apiError]);

  const handleMagicCommand = async () => {
    if (!query) return;
    setMagicLoading(true);
    setAiMessage('PatoBot está processando sua intenção... 🦆');
    
    try {
      const result = await geminiSupport.parsePaymentCommand(query);
      if (result && result.isCharge && result.amount) {
        setTempData(result);
        setStep('ask_phone');
        setAiMessage(`Quack! Vou gerar R$ ${result.amount.toFixed(2)} para ${result.name}. Qual o WhatsApp dele?`);
      } else {
        const response = await geminiSupport.ask(query, { balance: wallet.balance });
        setAiMessage(response);
      }
    } catch (err) {
      setAiMessage('Quack! Não entendi bem. Tente algo como: "Cobrar 150 de Marcos"');
    } finally {
      setMagicLoading(false);
      setQuery('');
    }
  };

  const handleFinalizeCharge = async () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setAiMessage('Quack! Preciso do telefone completo com DDD.');
      return;
    }

    setMagicLoading(true);
    setAiMessage('Comunicando com a Cakto... 🚀');
    
    try {
      const res = await paymentApi.createPayment({
        amount: tempData.amount,
        name: tempData.name,
        email: "vendas@patopay.com.br",
        cpf: "00000000000",
        phone: cleanPhone,
        description: tempData.description || `Cobrança via PatoBot`,
        redirectUrl: ""
      });

      const data = res?.data || res;
      if (data) {
        const txId = data.idTransaction || data.transactionId;
        setCreatedTx({
          ...data,
          url: `${window.location.origin}/#/pay/${txId}`,
        });
        setStep('success');
        setAiMessage(`Quack! Link gerado com sucesso para ${tempData.name}.`);
      }
    } catch (err: any) {
      setAiMessage(`Erro na Rede: ${err.message}`);
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-pix tracking-[0.5em] flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full animate-ping ${apiError ? 'bg-red-500' : 'bg-pix'}`}></span>
            {apiError ? '⚠️ Conexão Limitada' : '✓ Rede PatoPay Sincronizada'}
          </p>
          <h1 className="text-6xl md:text-8xl font-[950] text-gray-900 tracking-tighter leading-none">Painel.</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="bg-white px-8 py-5 rounded-[24px] border border-gray-100 flex items-center gap-4 shadow-sm">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
               <span className="text-gray-900 font-black">{liveVisitors.toLocaleString()}</span> ativos agora
             </p>
           </div>
        </div>
      </header>

      {/* PatoBot Magic Shell */}
      <section className="bg-gray-900 p-1.5 rounded-[40px] md:rounded-[72px] shadow-2xl relative">
        <div className="bg-white p-8 md:p-20 rounded-[38px] md:rounded-[68px] space-y-12 relative overflow-hidden">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
             <div className="inline-flex items-center gap-3 px-6 py-2 bg-pix/10 text-pix rounded-full text-[10px] font-black uppercase tracking-widest">
                PatoBot Inteligência ✨
             </div>
             <h2 className="text-4xl md:text-6xl font-[950] text-gray-900 tracking-tighter leading-tight">
               {step === 'idle' && "O que vamos vender agora?"}
               {step === 'ask_phone' && "Quack! Qual o Zap do cliente?"}
               {step === 'success' && "Pronto para enviar!"}
             </h2>
             <p className={`font-bold text-xl italic transition-all ${aiMessage.includes('Erro') ? 'text-red-500' : 'text-gray-400'}`}>
               "{aiMessage}"
             </p>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            {step === 'idle' && (
              <div className="relative">
                <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMagicCommand()}
                  placeholder="Ex: Cobrar 150 reais de Marcos..."
                  className="w-full bg-gray-50 border-4 border-gray-100 p-6 md:p-10 md:pr-56 rounded-[30px] md:rounded-[48px] font-black text-xl text-gray-900 focus:bg-white focus:border-pix focus:outline-none transition-all placeholder:text-gray-200"
                />
                <button 
                  onClick={handleMagicCommand}
                  disabled={magicLoading}
                  className="md:absolute right-6 top-1/2 md:-translate-y-1/2 w-full md:w-auto mt-4 md:mt-0 bg-pix text-white px-12 py-7 rounded-[36px] font-[950] uppercase text-sm tracking-widest shadow-xl disabled:opacity-50"
                >
                  {magicLoading ? 'QUACK...' : 'PROCESSAR'}
                </button>
              </div>
            )}
            
            {step === 'ask_phone' && (
              <div className="flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom duration-500">
                <input 
                  autoFocus
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFinalizeCharge()}
                  placeholder="(11) 99999-9999"
                  className="flex-1 bg-gray-50 border-4 border-gray-100 p-8 rounded-[36px] font-black text-2xl focus:bg-white focus:outline-none shadow-inner"
                />
                <button 
                  onClick={handleFinalizeCharge}
                  disabled={magicLoading}
                  className="bg-pix text-white px-12 py-6 rounded-[36px] font-black uppercase text-sm tracking-widest shadow-xl"
                >
                  {magicLoading ? 'CRIANDO...' : 'GERAR LINK PIX 🚀'}
                </button>
              </div>
            )}

            {step === 'success' && createdTx && (
              <div className="bg-gray-50 p-10 rounded-[48px] text-center space-y-8 animate-in zoom-in duration-500 border-2 border-dashed border-pix/20">
                <div className="text-5xl">✅</div>
                <div className="space-y-2">
                  <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Link Ativo na Rede</p>
                  <div className="p-6 bg-white border-2 border-gray-100 rounded-[24px] font-bold text-pix break-all text-sm select-all">
                    {createdTx.url}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button onClick={() => { navigator.clipboard.writeText(createdTx.url); alert('Copiado!'); }} className="bg-gray-900 text-white px-10 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Copiar Link</button>
                  <button onClick={() => setStep('idle')} className="bg-white border-2 border-gray-200 px-10 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all">Novo Pedido</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-12 md:p-20 rounded-[50px] md:rounded-[80px] border-4 border-gray-50 shadow-sm relative overflow-hidden group min-h-[400px]">
          <div className="relative z-10 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">Saldo em Conta</p>
                {apiError && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                    Tentando Reconectar
                  </span>
                )}
              </div>
              
              {apiError && !wallet.balance ? (
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-[950] text-amber-500 tracking-tighter leading-none uppercase">Conexão Interrompida.</h2>
                  <div className="p-8 bg-amber-50 rounded-[32px] border-2 border-amber-100 space-y-6">
                    <p className="text-sm font-bold text-amber-800 leading-relaxed whitespace-pre-line">
                      {apiError}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => window.location.reload()} className="py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-black transition-all">
                        🔄 Recarregar Página
                      </button>
                      <button onClick={() => fetchData()} className="py-4 bg-white border-2 border-amber-200 text-amber-500 rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-50 transition-all">
                        ⚡ Tentar Novamente
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <h2 className="text-[80px] md:text-[140px] font-[950] text-gray-900 tracking-tighter leading-[0.8] break-all">
                  <span className="text-pix text-4xl md:text-6xl align-top mr-6">R$</span> 
                  {loading && !wallet.balance ? '---' : wallet.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
              )}
            </div>
            
            {(wallet.balance > 0 || !loading) && !apiError && (
              <div className="flex gap-6">
                <Link to="/withdraw" className="px-12 py-7 bg-gray-900 text-white rounded-[36px] font-[950] uppercase text-sm tracking-widest shadow-2xl hover:bg-black transition-all border-b-8 border-black/30">Resgatar Lucro 💸</Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-10">
          <div className={`p-10 md:p-14 rounded-[40px] md:rounded-[72px] text-white shadow-2xl flex flex-col justify-between border-b-8 transition-all duration-500 ${apiError ? 'bg-amber-500 border-amber-700' : 'bg-pix border-pix/30'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Status de Rede</p>
            <p className="text-6xl font-[950] tracking-tighter uppercase">{apiError ? 'Offline' : 'Online'}</p>
          </div>
          <div className="bg-gray-900 p-10 md:p-14 rounded-[40px] md:rounded-[72px] text-white shadow-2xl flex flex-col justify-between border-b-8 border-black/30">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Taxa PatoPay</p>
            <p className="text-6xl font-[950] tracking-tighter text-pix uppercase">R$ 4,00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
