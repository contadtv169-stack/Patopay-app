
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentApi } from '../services/api';
import { Wallet } from '../types';

const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    keyType: 'cpf' as 'cpf' | 'email' | 'phone' | 'random',
    pixKey: '',
    document: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string, details?: any }>({ type: '', text: '' });
  const [pastWithdrawals, setPastWithdrawals] = useState<any[]>([]);

  // Carregamento inicial e polling de saldo
  useEffect(() => {
    const fetchWallet = async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
        const res = await paymentApi.getWallet();
        if (res && res.data) {
          setWallet({
            balance: parseFloat(res.data.balance),
            currency: res.data.currency
          });
        }
      } catch (e) {
        console.error("Erro ao carregar carteira", e);
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchWallet(true);
    const interval = setInterval(() => fetchWallet(false), 15000);
    const stored = localStorage.getItem('pato_withdraw_history');
    if (stored) setPastWithdrawals(JSON.parse(stored));
    return () => clearInterval(interval);
  }, []);

  // Lógica de Validação de CPF (Checksum)
  const isValidCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11 || !!cleanCpf.match(/(\d)\1{10}/)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cleanCpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cleanCpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCpf.charAt(10))) return false;
    return true;
  };

  // Máscaras Dinâmicas
  const applyMask = (value: string, type: string) => {
    const clean = value.replace(/\D/g, '');
    if (type === 'cpf') {
      return clean
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    }
    if (type === 'phone') {
      return clean
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2')
        .substring(0, 15);
    }
    return value;
  };

  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const masked = (formData.keyType === 'cpf' || formData.keyType === 'phone') 
      ? applyMask(val, formData.keyType) 
      : val;
    setFormData({ ...formData, pixKey: masked });
  };

  // Validação em Tempo Real Memoizada
  const validation = useMemo(() => {
    const key = formData.pixKey.trim();
    if (!key) return { valid: false, msg: 'Aguardando chave...' };

    switch (formData.keyType) {
      case 'cpf':
        const validCpf = isValidCPF(key);
        return { 
          valid: validCpf, 
          msg: validCpf ? 'CPF Válido' : 'CPF Inválido ou incompleto' 
        };
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmail = emailRegex.test(key);
        return { 
          valid: validEmail, 
          msg: validEmail ? 'E-mail Válido' : 'Formato de e-mail inválido' 
        };
      case 'phone':
        const cleanPhone = key.replace(/\D/g, '');
        const validPhone = cleanPhone.length >= 10 && cleanPhone.length <= 11;
        return { 
          valid: validPhone, 
          msg: validPhone ? 'Telefone Válido' : 'Telefone incompleto (DDD + Número)' 
        };
      case 'random':
        // UUID padrão: 8-4-4-4-12
        const validEVP = key.length >= 32;
        return { 
          valid: validEVP, 
          msg: validEVP ? 'Chave EVP Detectada' : 'Chave aleatória muito curta' 
        };
      default:
        return { valid: false, msg: 'Selecione um tipo' };
    }
  }, [formData.pixKey, formData.keyType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    const amountNum = parseFloat(formData.amount);
    const balance = wallet?.balance || 0;

    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage({ type: 'error', text: 'Informe um valor válido.' });
      setLoading(false);
      return;
    }

    if (amountNum > balance) {
      setMessage({ type: 'error', text: 'Saldo insuficiente.' });
      setLoading(false);
      return;
    }

    try {
      const response = await paymentApi.withdraw({
        ...formData,
        amount: amountNum
      });

      if (response) {
        const txId = response.data?.idTransaction || response.idTransaction || `WD-${Date.now().toString().slice(-6)}`;
        const successDetails = {
          id: txId,
          amount: amountNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          key: formData.pixKey,
          date: new Date().toLocaleString('pt-BR'),
          status: 'success'
        };
        setMessage({ type: 'success', text: 'Saque Realizado! 💸', details: successDetails });
        const newHistory = [successDetails, ...pastWithdrawals].slice(0, 15);
        setPastWithdrawals(newHistory);
        localStorage.setItem('pato_withdraw_history', JSON.stringify(newHistory));
        setFormData({ amount: '', keyType: 'cpf', pixKey: '', document: '' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Falha na comunicação.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="space-y-1">
        <p className="text-[10px] font-black uppercase text-pix tracking-[0.4em]">Gestão de Capital</p>
        <h1 className="text-6xl md:text-8xl font-[950] text-gray-900 tracking-tighter leading-none">Saque PIX.</h1>
      </header>

      {message.type === 'success' ? (
        <div className="bg-white p-10 md:p-20 rounded-[60px] md:rounded-[80px] border-4 border-gray-50 shadow-2xl text-center space-y-12 animate-in zoom-in duration-500">
           <div className="w-32 h-32 md:w-48 md:h-48 bg-pix/10 text-pix rounded-full flex items-center justify-center text-7xl mx-auto border-4 border-white shadow-xl">🚀</div>
           <div className="space-y-4">
             <h2 className="text-5xl md:text-7xl font-[950] text-gray-900 tracking-tighter leading-none">{message.text}</h2>
             <p className="text-gray-400 font-bold text-xl">Sua transferência está sendo processada na rede PatoPay.</p>
           </div>
           
           <div className="bg-gray-50 p-8 md:p-14 rounded-[40px] md:rounded-[56px] border-2 border-dashed border-gray-200 text-left space-y-8 max-w-3xl mx-auto">
              <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Valor Retirado</span>
                <span className="text-3xl md:text-5xl font-[950] text-pix">{message.details.amount}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Comprovante</span>
                  <span className="text-sm font-black text-gray-900 break-all">{message.details.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Destino</span>
                  <span className="text-sm font-black text-gray-900 break-all">{message.details.key}</span>
                </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-6 pt-6 max-w-2xl mx-auto">
             <button onClick={() => setMessage({type: '', text: ''})} className="flex-1 py-8 bg-pix text-white rounded-[32px] font-[950] uppercase text-xs tracking-widest hover:bg-pix/90 transition-all border-b-8 border-[#207a70]">Novo Saque 💸</button>
             <button onClick={() => navigate('/dashboard')} className="flex-1 py-8 bg-gray-900 text-white rounded-[32px] font-[950] uppercase text-xs tracking-widest hover:bg-black transition-all border-b-8 border-black">Voltar ao Painel</button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-10">
            {/* Card de Saldo */}
            <div className="bg-gray-900 p-12 md:p-20 rounded-[50px] md:rounded-[72px] text-white shadow-2xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-6">Disponível agora</p>
              <h2 className="text-6xl md:text-9xl font-[950] tracking-tighter break-all">
                <span className="text-pix">R$</span> {wallet?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h2>
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[200px] font-black rotate-12 select-none pointer-events-none">PIX</div>
            </div>

            {/* Formulário de Saque */}
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-14 rounded-[50px] md:rounded-[72px] border-4 border-gray-50 shadow-sm space-y-12">
              {message.type === 'error' && (
                <div className="p-8 bg-red-50 border-2 border-red-100 text-red-600 rounded-[32px] text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
                  <span className="text-2xl">⚠️</span> {message.text}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] ml-10">Valor do Saque</label>
                <div className="relative">
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-4xl font-black text-gray-300">R$</span>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-10 pl-24 bg-gray-50 border-4 border-gray-50 rounded-[40px] md:rounded-[56px] text-5xl md:text-7xl font-[950] text-gray-900 focus:bg-white focus:border-pix focus:outline-none transition-all placeholder:text-0,00" placeholder="0,00" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] ml-10">Tipo de Chave</label>
                  <select value={formData.keyType} onChange={e => setFormData({...formData, keyType: e.target.value as any, pixKey: ''})} className="w-full p-8 bg-gray-50 border-4 border-gray-50 rounded-[32px] font-black text-xl text-gray-700 focus:bg-white focus:border-pix outline-none transition-all cursor-pointer">
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Celular</option>
                    <option value="random">Aleatória (EVP)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] ml-10">Seu Documento (Titular)</label>
                  <input required type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value.replace(/\D/g, '').substring(0, 14)})} className="w-full p-8 bg-gray-50 border-4 border-gray-50 rounded-[32px] font-bold text-xl text-gray-700 focus:bg-white focus:border-pix outline-none transition-all" placeholder="Somente números" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-10">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">Chave PIX de Destino</label>
                  {formData.pixKey && (
                    <span className={`font-black text-[10px] uppercase tracking-widest transition-all ${validation.valid ? 'text-pix' : 'text-red-500 animate-pulse'}`}>
                      {validation.valid ? '✓ ' : '✕ '}{validation.msg}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <input 
                    required 
                    type="text" 
                    value={formData.pixKey} 
                    onChange={handlePixKeyChange}
                    className={`w-full p-10 bg-gray-50 border-4 rounded-[40px] md:rounded-[56px] font-black text-2xl focus:bg-white outline-none transition-all ${
                      formData.pixKey 
                      ? (validation.valid ? 'border-pix/30 focus:border-pix' : 'border-red-100 focus:border-red-400') 
                      : 'border-gray-50 focus:border-pix'
                    }`} 
                    placeholder="Insira a chave aqui"
                  />
                  {validation.valid && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-pix text-2xl animate-bounce">✨</div>
                  )}
                </div>
              </div>

              <button 
                disabled={loading || !validation.valid || !formData.amount} 
                type="submit" 
                className={`w-full text-white font-[950] py-10 rounded-[40px] md:rounded-[56px] transition-all active:scale-95 text-2xl flex items-center justify-center gap-6 shadow-xl border-b-8 ${
                  validation.valid && formData.amount
                  ? 'bg-pix shadow-pix/20 border-[#207a70] hover:shadow-2xl' 
                  : 'bg-gray-300 border-gray-400 cursor-not-allowed grayscale'
                }`}
              >
                {loading ? <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : 'SOLICITAR RETIRADA 🚀'}
              </button>
            </form>
          </div>

          {/* Lateral: Histórico e Dicas */}
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-white p-12 rounded-[50px] md:rounded-[72px] border-4 border-gray-50 shadow-sm space-y-10">
               <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-[950] text-gray-900 tracking-tighter uppercase">Recentes.</h3>
                 <span className="text-[10px] font-black text-pix uppercase tracking-widest">PatoPay Fast-Track</span>
               </div>
               <div className="space-y-6">
                  {pastWithdrawals.length === 0 ? (
                    <div className="py-24 text-center space-y-6 grayscale opacity-30">
                      <div className="text-7xl">📭</div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">Sem movimentações</p>
                    </div>
                  ) : (
                    pastWithdrawals.map((w, idx) => (
                      <div key={idx} className="flex items-center justify-between p-8 bg-gray-50 rounded-[40px] border-2 border-gray-100 hover:border-pix transition-all group">
                        <div className="space-y-1">
                          <p className="text-xl font-[950] text-gray-900">{w.amount}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{w.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-5 py-2 bg-green-50 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Sucesso</span>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="bg-pix/5 p-12 rounded-[50px] border-4 border-pix/10 space-y-6">
               <p className="text-[11px] font-black uppercase text-pix tracking-widest">Segurança Bancária</p>
               <p className="text-sm font-bold text-gray-600 leading-relaxed">Nossa validação em tempo real previne 99% dos erros de digitação. Verifique se o titular do documento coincide com o titular da conta PIX.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
