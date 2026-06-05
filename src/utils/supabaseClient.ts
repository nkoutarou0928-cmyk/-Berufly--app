import { createClient } from '@supabase/supabase-js';

// ============================================================
// Supabase クライアント初期化
// Vite の define により process.env が埋め込まれる
// ============================================================
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// URL末尾の /rest/v1/ を自動削除
let supabaseUrl = rawUrl;
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

const supabaseAnonKey = rawKey;

// ============================================================
// 起動時診断ログ（ブラウザのコンソールで確認可能）
// ============================================================
console.group('[🔌 Supabase Client Diagnostics]');
console.log('URL (実際の値):', supabaseUrl || '❌ 空（env未注入）');
console.log('ANON KEY 先頭20文字:', supabaseAnonKey ? supabaseAnonKey.slice(0, 20) + '...' : '❌ 空（env未注入）');
console.log('設定OK?:', supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 30);
console.groupEnd();

export const getSupabaseClientStatus = () => {
  const isConfigured =
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-supabase-project') &&
    supabaseAnonKey.length > 30 &&
    !supabaseAnonKey.includes('your-anon-public-key');
  return {
    isConfigured,
    url: supabaseUrl,
    hasAnonKey: supabaseAnonKey.length > 0
  };
};

// 設定が空の場合でもクライアントは生成する（ダミーURLでも例外は出ない）
// 実際のAPIコールで 4xx/5xx が返るため、エラーハンドリングで検知できる
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
