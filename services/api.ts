
import { CreatePaymentParams, WithdrawParams } from '../types';

/**
 * CONFIGURAÇÕES DA API CAKTO
 */
const API_BASE = 'https://api.cakto.com.br';
const CLIENT_ID = 'F7IG7Az7vGlfLhXmvq7UdXzYfu7Gn1dFZp1E434Z';
const CLIENT_SECRET = 'sOQyZ8L3Ydjir4Az9jxQtknwaIp7IAZkO3feYOxky0Htwp74NdIORAsgrcxxK7KfFEFAq6KmGugQZHLtMG8OnsCIImcP47kS1h2Oq8LLfHxQMG9jrwjYVRDOxzuvCwcW';

/**
 * Estratégia de Roteamento PatoShield 4.0
 * Adicionado cache-busting para evitar erros persistentes de rede.
 */
const ROUTES = [
  (url: string) => `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, // 1. Direto
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(`${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`)}`, // 2. CorsProxy
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(`${url}${url.includes('?') ? '&' : '?'}cache=${Date.now()}`)}`, // 3. AllOrigins Raw
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`${url}${url.includes('?') ? '&' : '?'}nocache=${Date.now()}`)}`, // 4. Codetabs
];

const getHeaders = () => ({
  'client-id': CLIENT_ID,
  'client-secret': CLIENT_SECRET,
  // Headers redundantes para proxies que filtram cabeçalhos customizados
  'X-Client-Id': CLIENT_ID,
  'X-Client-Secret': CLIENT_SECRET,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
});

const onlyNumbers = (val: string = "") => val.replace(/\D/g, '');

const generateExternalId = () => {
  return `PATO${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

/**
 * Executor de Requisições PatoShield 4.0 - Resiliência Extrema
 */
async function performRequest(url: string, options: RequestInit) {
  let lastError: any = null;

  for (const [index, routeFn] of ROUTES.entries()) {
    const targetUrl = routeFn(url);
    const isDirect = index === 0;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), isDirect ? 3500 : 12000);

      const response = await fetch(targetUrl, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options.headers,
        },
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Se for o direto e falhar (CORS), pula para proxy sem olhar o erro
      if (isDirect && !response.ok) continue;

      const text = await response.text();
      const cleanText = text.trim();

      // Detecta se a resposta é HTML de erro do proxy (Cloudflare/Nginx)
      if (cleanText.startsWith('<!doctype') || cleanText.startsWith('<html')) {
        console.warn(`[PatoShield] Rota ${index} bloqueada ou indisponível.`);
        continue;
      }

      if (!response.ok) {
        // Se a API retornar 401, as chaves estão erradas, não adianta trocar de proxy
        if (response.status === 401) {
          throw new Error("CHAVES DE API INVÁLIDAS: Verifique suas credenciais Cakto.");
        }
        continue;
      }

      try {
        const parsed = JSON.parse(cleanText);
        // Algumas APIs ou proxies podem retornar a data dentro de uma propriedade 'data' ou 'contents'
        return parsed;
      } catch (e) {
        // Se não for JSON mas status foi 200, retorna o texto bruto
        return cleanText;
      }
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes("CHAVES DE API")) throw err;
      continue;
    }
  }

  throw new Error("CONEXÃO INSTÁVEL: Nossos servidores de borda estão inacessíveis. Por favor, desative AdBlockers ou VPNs e tente recarregar.");
}

export const paymentApi = {
  createPayment: async (params: CreatePaymentParams) => {
    const targetUrl = `${API_BASE}/gateway/pix-qrcode`;
    const body = {
      amount: Number(params.amount),
      externalId: generateExternalId(),
      customer: {
        name: params.name || "Cliente PatoPay",
        email: params.email || "vendas@patopay.com.br",
        phone: onlyNumbers(params.phone || "11999999999"),
        document: {
          type: "cpf",
          number: onlyNumbers(params.cpf || "00000000000")
        }
      },
      items: [{
        title: params.description || `Venda PatoPay`,
        unitPrice: Number(params.amount),
        quantity: 1,
        tangible: false
      }],
      paymentMethod: "pix",
      installments: "1"
    };

    return performRequest(targetUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  withdraw: async (params: WithdrawParams) => {
    const targetUrl = `${API_BASE}/gateway/pix-cash-out`;
    const body = {
      externalId: generateExternalId(),
      amount: Number(params.amount),
      key_type: params.keyType === 'random' ? 'evp' : params.keyType,
      document: onlyNumbers(params.document),
      pix_key: params.pixKey,
    };

    return performRequest(targetUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * getWallet - Busca robusta de saldo
   */
  getWallet: async () => {
    const targetUrl = `${API_BASE}/gateway/wallet`;
    // Tentamos via POST que é o padrão da maioria dos endpoints Cakto
    return performRequest(targetUrl, {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  getTransaction: async (id: string) => {
    const targetUrl = `${API_BASE}/gateway/transaction/${id}`;
    return performRequest(targetUrl, {
      method: 'GET'
    });
  }
};
