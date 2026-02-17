
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        setFormData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
        });
      }
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="space-y-1">
        <p className="text-[10px] font-black uppercase text-pix tracking-[0.2em]">Preferências</p>
        <h1 className="text-5xl font-[900] text-gray-900 tracking-tighter leading-none">Meu Perfil.</h1>
        <p className="text-gray-400 font-bold text-sm mt-4">Gerencie suas informações pessoais e segurança da conta.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleUpdateProfile} className="bg-white p-12 rounded-[56px] border-4 border-gray-50 shadow-sm space-y-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Dados Pessoais</h2>
            
            {message.text && (
              <div className={`p-6 rounded-[32px] border-2 font-black text-xs uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-6">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[32px] font-bold text-gray-900 focus:bg-white focus:border-pix focus:outline-none transition-all" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-6">Endereço de Email</label>
                <input 
                  disabled
                  type="email" 
                  value={formData.email} 
                  className="w-full p-6 bg-gray-100 border-4 border-gray-100 rounded-[32px] font-bold text-gray-400 cursor-not-allowed" 
                />
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest ml-6">O email não pode ser alterado por segurança.</p>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gray-900 text-white font-[900] py-8 rounded-[32px] hover:bg-black hover:shadow-2xl transition-all active:scale-95 text-lg uppercase tracking-widest"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        {/* Security / Stats Card */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gray-900 p-12 rounded-[56px] text-white shadow-2xl space-y-12 h-full">
            <div className="w-20 h-20 bg-pix rounded-[24px] flex items-center justify-center text-4xl shadow-lg shadow-pix/20">🔒</div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tighter">Segurança Máxima.</h3>
              <p className="text-gray-400 font-medium leading-relaxed">Sua conta é protegida com criptografia de ponta a ponta e auditoria constante de nossa equipe de segurança.</p>
            </div>
            
            <div className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10">
                <div>
                  <p className="text-[10px] font-black uppercase text-pix tracking-widest">Senha</p>
                  <p className="text-sm font-bold text-white">Última alteração: Recentemente</p>
                </div>
                <button className="text-[10px] font-black uppercase text-white/40 hover:text-white transition">Alterar</button>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10">
                <div>
                  <p className="text-[10px] font-black uppercase text-pix tracking-widest">2FA Autenticação</p>
                  <p className="text-sm font-bold text-white">Desativado</p>
                </div>
                <button className="text-[10px] font-black uppercase text-pix hover:underline transition">Ativar</button>
              </div>
            </div>

            <div className="pt-12 border-t border-white/10">
              <button className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 tracking-[0.2em]">Encerrar Conta Permanentemente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
