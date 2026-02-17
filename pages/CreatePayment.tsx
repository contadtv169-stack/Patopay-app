
import React, { useState } from 'react';
import { paymentApi } from '../services/api';
import { geminiSupport } from '../services/gemini';

const CreatePayment: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);
  const [error, setError] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const handleAiAutoFill = async () => {
    if (!formData.description) {
      alert("Quack! Digite pelo menos uma descrição para eu te ajudar.");
      return;
    }
    setAiSuggesting(true);
    try {
      const suggestion = await geminiSupport.parsePaymentCommand(formData.description);
      if (suggestion) {
        setFormData(prev => ({
          ...prev,
          amount: suggestion.amount?.toString() || prev.amount,
          name: suggestion.name !== "Cliente PatoPay" ? suggestion.name : prev.name,
          description: suggestion.description !== "Venda Digital" ? suggestion.description : prev.description
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const amountNum = parseFloat(formData.amount);
      const res = await paymentApi.createPayment({
        ...formData,
        amount: amountNum,
        redirectUrl: ''
      });

      const txId = res.data?.idTransaction || res.data?.transactionId;
      setCreated({ 
        url: `${window.location.origin}/#/pay/${txId}`,
        id: txId 
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <header className="space-y-1">
        <p className="text-[10px] font-black uppercase text-pix tracking-[0.2em]">Criação Inteligente</p>
        <h1 className="text-5xl font-[900] text-gray-900 tracking-tighter">Cobrar agora.</h1>
      </header>
      
      {!created ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7 bg-white p-12 rounded-[56px] border-4 border-gray-50 shadow-sm space-y-10">
            {error && <div className="p-6 bg-red-50 text-red-600 rounded-[32px] text-xs font-black uppercase tracking-widest border border-red-100">{error}</div>}
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-6">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">O que você está vendendo?</label>
                  <button 
                    type="button" 
                    onClick={handleAiAutoFill}
                    className="text-[10px] font-black text-pix uppercase tracking-widest hover:underline"
                  >
                    {aiSuggesting ? 'Quack...' : '✨ IA Preencher'}
                  </button>
                </div>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[32px] font-bold focus:bg-white focus:border-pix focus:outline-none transition-all" placeholder="Ex: Cobrar 50 de João pelo curso" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-6">Valor da Venda</label>
                <div className="relative">
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-300">R$</span>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-8 pl-20 bg-gray-50 border-4 border-gray-50 rounded-[40px] font-[900] text-4xl text-pix focus:bg-white focus:border-pix focus:outline-none transition-all" placeholder="0,00" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-6">Nome do Cliente</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[32px] font-bold text-gray-700" placeholder="João Pato" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-6">CPF (opcional)</label>
                  <input type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[32px] font-bold text-gray-700" placeholder="000.000.000-00" />
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-gray-900 text-white font-[900] py-8 rounded-[40px] hover:bg-black hover:shadow-2xl transition-all active:scale-95 text-xl">
              {loading ? 'Gerando link...' : 'Criar link de pagamento 🚀'}
            </button>
          </div>

          <div className="md:col-span-5 bg-gray-900 p-12 rounded-[56px] text-white shadow-2xl space-y-12 h-full">
            <div className="w-16 h-16 bg-pix rounded-[20px] flex items-center justify-center text-3xl">🦆</div>
            <h3 className="text-3xl font-black tracking-tighter">Venda com Inteligência.</h3>
            <p className="text-gray-400 font-medium leading-relaxed">Nossa IA ajuda você a preencher os dados mais rápido, permitindo que você foque no que importa: sua escala.</p>
            <div className="space-y-6 pt-6">
              <div className="flex gap-4 items-center">
                <div className="w-2 h-2 rounded-full bg-pix"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Infraestrutura Própria</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-2 h-2 rounded-full bg-pix"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Liquidação Automática</p>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-16 rounded-[64px] border-4 border-gray-50 shadow-2xl text-center space-y-12 animate-in zoom-in duration-700">
           <div className="w-32 h-32 bg-pix/10 text-pix rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">⚡</div>
           <div className="space-y-4">
             <h2 className="text-5xl font-[900] text-gray-900 tracking-tighter">Link Ativo!</h2>
             <p className="text-gray-500 font-bold">Copie o link abaixo e envie para seu cliente.</p>
           </div>
           
           <div className="p-8 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 space-y-4">
             <div className="flex gap-3">
               <input readOnly value={created.url} className="flex-1 bg-white p-6 rounded-[24px] text-xs font-black text-pix border border-gray-100 truncate" />
               <button onClick={() => { navigator.clipboard.writeText(created.url); alert('Copiado!'); }} className="bg-gray-900 text-white px-8 py-6 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Copiar</button>
             </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4">
             <button onClick={() => setCreated(null)} className="flex-1 py-6 border-4 border-gray-50 rounded-[32px] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition">Criar outro</button>
             <a href={created.url} target="_blank" rel="noreferrer" className="flex-1 py-6 bg-pix text-white rounded-[32px] font-black text-[10px] uppercase tracking-widest hover:shadow-xl transition-all flex items-center justify-center">Testar Link</a>
           </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayment;
