
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

export interface Wallet {
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  amount: string;
  fee_in: string;
  balance_after: string;
  status: 'pending' | 'paid' | 'canceled' | 'refunded' | 'completed';
  transaction_type: 'payment' | 'withdrawal';
  created_at: string;
  payment_method: string;
  payment_code?: string;
  payment_code_base64?: string;
  customer_name?: string;
  description?: string;
}

export interface CreatePaymentParams {
  amount: number;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  description: string;
  redirectUrl: string;
}

export interface WithdrawParams {
  amount: number;
  keyType: 'cpf' | 'email' | 'phone' | 'random';
  pixKey: string;
  document: string;
}
