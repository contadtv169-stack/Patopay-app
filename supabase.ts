
import { createClient } from '@supabase/supabase-js';

// Usando as novas credenciais fornecidas:
// URL do Projeto: https://evhnoxcidruhvbrstewo.supabase.co
// Chave Pública (Anon): sb_publishable_V7uS1IGcnQzxFlCqDIdHPg_jk2VXhDU
const SUPABASE_URL = 'https://evhnoxcidruhvbrstewo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_V7uS1IGcnQzxFlCqDIdHPg_jk2VXhDU'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
