/**
 * Modo offline: stub que substitui o cliente Supabase.
 * Permite o app rodar sem credenciais — auth e persistência ficam inertes.
 * Para ligar Supabase de verdade, defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * no .env e troque este arquivo por: export const supabase = createClient(url, key);
 */

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const buildStub = () => {
  const query: any = {
    select: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    eq: () => query,
    single: async () => ({ data: null, error: { code: "STUB" } }),
    then: (resolve: any) => resolve({ data: null, error: null }),
  };
  return {
    from: (_table: string) => query,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({ data: null, error: { message: "Modo offline" } }),
      signInWithOAuth: async () => ({ data: null, error: { message: "Modo offline" } }),
      signUp: async () => ({ data: { session: null }, error: { message: "Modo offline" } }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: null, error: { message: "Modo offline" } }),
      resetPasswordForEmail: async () => ({ data: null, error: { message: "Modo offline" } }),
    },
  } as any;
};

export const supabase = url && anon ? createClient(url, anon) : buildStub();

if (!url || !anon) {
  console.info("[supabase] rodando em modo offline (sem credenciais).");
}
