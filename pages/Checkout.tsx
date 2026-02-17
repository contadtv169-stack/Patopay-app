
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../services/api';
import { Logo } from '../constants';

const Checkout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [txData, setTxData] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'paid' | 'expired'>('pending');
  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const [copied, setCopied] = useState(false);

  // Busca inicial dos dados com validação de ID
  useEffect(() => {
    const fetchTx = async () => {
      // 1. Validação local do ID
      if (!id) {
        setError({
          title: "ID Ausente",
          message: "Nenhum identificador de transação foi fornecido na URL."
        });
        setLoading(false);
        return;
      }

      // IDs da Cakto/PatoPay geralmente são alfanuméricos e possuem comprimento mínimo
      // Aqui validamos se possui pelo menos 8 caracteres para evitar lixo na URL
      if (id.length < 8) {
        setError({
          title: "Link Inválido",
          message: "O identificador da transação parece estar incompleto ou corrompido."
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await paymentApi.getTransaction(id);
        
        if (res && res.data) {
          setTxData(res.data);
          if (res.data.status === 'paid' || res.data.status === 'completed') {
            setStatus('paid');
          }
          setLoading(false);
        } else {
          throw new Error('Transação não localizada em nosso sistema.');
        }
      } catch (err: any) {
        console.error("Erro no checkout:", err);
        setError({
          title: "Não Encontrado",
          message: err.message || "Este link de pagamento expirou ou nunca existiu em nossa rede."
        });
        setLoading(false);
      }
    };
    
    fetchTx();
  }, [id]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (status === 'paid' || !id || loading || error) return;

    const interval = setInterval(async () => {
      try {
        const res = await paymentApi.getTransaction(id);
        if (res && res.data && (res.data.status === 'paid' || res.data.status === 'completed')) {
          setStatus('paid');
          clearInterval(interval);
        }
      } catch (e) {
        // Silenciosamente ignora erros de polling para não quebrar a UI
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, status, loading, error]);

  const handleCopy = () => {
    if (txData?.paymentCode) {
      navigator.clipboard.writeText(txData.paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReceipt = () => {
    if (!txData) return;
    const content = `
      PatoPay - Recibo de Pagamento
      ==============================
      ID Transação: ${txData.transaction_id || txData.idTransaction || id}
      Valor: R$ ${parseFloat(txData.amount).toFixed(2)}
      Data: ${new Date().toLocaleString('pt-BR')}
      Status: Confirmado
      ==============================
      Obrigado por utilizar PatoPay
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-patopay-${id?.substring(0,8)}.txt`;
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-pix flex flex-col items-center justify-center p-6 gap-8">
      <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center animate-bounce shadow-2xl">
        <span className="text-pix text-5xl font-black">🦆</span>
      </div>
      <div className="text-center space-y-2">
        <p className="font-black text-white uppercase tracking-[0.4em] text-[11px] animate-pulse">Protegendo sua transação...</p>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Rede PatoPay S.A.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="max-w-md w-full bg-white p-12 md:p-16 rounded-[64px] text-center space-y-10 shadow-2xl border-4 border-gray-50">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-red-100 animate-bounce">
          ⚠️
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-[950] text-gray-900 tracking-tighter leading-none">{error.title}</h2>
          <p className="text-gray-400 font-bold leading-snug text-lg">{error.message}</p>
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-7 bg-gray-900 text-white rounded-[32px] font-black uppercase text-xs tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            Voltar ao Início
          </button>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Se você acredita que isso é um erro, contate o vendedor.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-6 animate-in fade-in duration-700">
      
      <div className="max-w-md w-full bg-white rounded-[72px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.15)] border-4 border-gray-50 overflow-hidden relative">
        <div className="p-12 text-center space-y-10">
          
          {status === 'paid' ? (
            <div className="space-y-12 animate-in zoom-in duration-500">
              <div className="w-40 h-40 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-6xl mx-auto border-4 border-green-100 shadow-xl">✓</div>
              <div className="space-y-4">
                <h2 className="text-6xl font-[950] text-gray-900 tracking-tighter leading-none">Pago!</h2>
                <p className="text-gray-400 font-bold text-lg">Seu pagamento foi confirmado com sucesso.</p>
              </div>
              <button onClick={handleDownloadReceipt} className="w-full py-8 bg-gray-900 text-white rounded-[36px] font-[950] text-lg hover:bg-black transition-all border-b-8 border-black/40">Baixar Recibo</button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-pix tracking-[0.3em]">Checkout PatoPay</p>
                <h1 className="text-7xl font-[950] text-gray-900 tracking-tighter leading-none">
                   <span className="text-pix">R$</span> {parseFloat(txData.amount).toFixed(2)}
                </h1>
              </div>

              {/* QR CODE CONTAINER */}
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-6 rounded-[48px] shadow-2xl border-4 border-gray-50 relative group">
                  <div className="w-full aspect-square max-w-[240px] bg-gray-50 flex items-center justify-center rounded-[32px] overflow-hidden border-2 border-white">
                    {txData.paymentCodeBase64 ? (
                      <img src={`data:image/png;base64,${txData.paymentCodeBase64}`} alt="QR Code PIX" className="w-full h-full p-2" />
                    ) : (
                      <div className="p-8 text-gray-200 font-black text-center text-xs animate-pulse italic">GERANDO QR CODE...</div>
                    )}
                  </div>
                </div>

                {/* LOGO E CHAVE ABAIXO DO QR */}
                <div className="space-y-6 w-full">
                   <div className="flex flex-col items-center gap-2">
                     <Logo size={24} showText={true} />
                     <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Escaneie o código acima para pagar</p>
                   </div>

                   <div className="space-y-3">
                     <div className="flex justify-between px-4">
                       <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Copia e Cola</p>
                       {copied && <span className="text-[9px] font-black text-pix uppercase tracking-widest animate-pulse">Copiado!</span>}
                     </div>
                     <div className="flex gap-2 p-1.5 bg-gray-50 border-2 border-gray-100 rounded-[28px]">
                       <input readOnly value={txData.paymentCode || ''} className="flex-1 bg-transparent px-5 py-3 text-[10px] font-bold text-gray-400 truncate focus:outline-none" />
                       <button 
                         onClick={handleCopy}
                         className="bg-gray-900 text-white px-6 py-3 rounded-[20px] font-[950] text-[9px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                       >
                         Copiar
                       </button>
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 py-6 border-t border-gray-50">
                <div className="w-2 h-2 bg-pix rounded-full animate-ping"></div>
                <span className="text-[10px] font-[950] text-pix uppercase tracking-[0.2em]">Aguardando Pagamento...</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-900 p-8 text-center">
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">
             🛡️ Transação Segura e Autenticada
          </p>
        </div>
      </div>
      
      <p className="mt-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Powered by PatoPay Fintech S.A.</p>
    </div>
  );
};

export default Checkout;
