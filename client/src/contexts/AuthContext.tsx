/**
 * Python Quest — Contexto de Autenticação (SUPABASE)
 * Gerencia login/registro/logout usando Supabase Auth e tabela profiles
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { type AuthChangeEvent, type Session, type User } from "@supabase/supabase-js";

export type UserAccount = {
  id: string;
  displayName: string;
  email: string;
  avatarEmoji: string;
  avatarUrl?: string | null;
  isMuted?: boolean;
  lastPlayedAt?: string | null;
};

type AuthState = {
  user: UserAccount | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
};

type AuthContextType = {
  user: UserAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (
    displayName: string,
    email: string,
    password: string,
    captchaToken: string
  ) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  logout: () => void;
  resetPassword: (email: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isPasswordRecovery: boolean;
  exitPasswordRecovery: () => void;
  updateProfile: (updates: Partial<Pick<UserAccount, "displayName" | "avatarEmoji" | "avatarUrl">>) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AVATAR_EMOJI_GROUPS = [
  {
    id: "magia",
    label: "Magia",
    icon: "🪄",
    emojis: ["🧙", "🧙‍♀️", "🧝", "🧝‍♀️", "🧛", "🧛‍♀️", "🧞", "🧞‍♀️", "🦸", "🦹", "🥷", "👑"],
  },
  {
    id: "feras",
    label: "Feras",
    icon: "🐉",
    emojis: ["🐉", "🦄", "🦉", "🦅", "🐺", "🦊", "🦁", "🐯", "🐍", "🦇", "🦑", "🐙", "🦂", "🕷️"],
  },
  {
    id: "exclusivos",
    label: "Exclusivos",
    icon: "💎",
    emojis: [
      "/avatars/wizard.webp", 
      "/avatars/knight.webp", 
      "/avatars/alchemist.webp", 
      "/avatars/rogue.webp", 
      "/avatars/dragon.webp",
      "/avatars/hacker.webp",
      "/avatars/golem.webp",
      "/avatars/phoenix.webp",
      "/avatars/kraken.webp",
      "/avatars/samurai.webp",
      "/avatars/elf_ranger.webp",
      "/avatars/necromancer.webp"
    ],
  },
];

export const AVATAR_EMOJIS = AVATAR_EMOJI_GROUPS.flatMap(g => g.emojis);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isPasswordRecovery:
      typeof window !== "undefined" &&
      (window.location.hash.includes("type=recovery") ||
        window.location.pathname === "/reset-password"),
  });

  // Função auxiliar para timeout
  const withTimeout = <T,>(promise: PromiseLike<T>, ms = 5000): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
      Promise.resolve(promise)
        .then(value => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  // Função para buscar dados do perfil no Supabase baseado no User ID do Auth
  const fetchProfile = useCallback(async (supabaseUser: User) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single(),
        2500
      ) as any;

      let profileData = data;

      if (error) {
        if (error.code === 'PGRST116') {
          // Tentar criar se não existir (precisa da política de INSERT no Supabase)
          const defaultName = supabaseUser.user_metadata?.display_name || 'Aventureiro';
          const starterEmojis = ["👤", "👾", "🎓", "🐉", "⚔️", "🛡️", "🔮", "⚡"];
          const randomAvatar = starterEmojis[Math.floor(Math.random() * starterEmojis.length)];
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ id: supabaseUser.id, display_name: defaultName, avatar_emoji: randomAvatar }])
            .select()
            .single();
          if (newProfile) profileData = newProfile;
        }
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        displayName: profileData?.display_name || supabaseUser.user_metadata?.display_name || 'Aventureiro',
        avatarEmoji: profileData?.avatar_emoji || '👤',
        avatarUrl: profileData?.avatar_url || null,
        isMuted: profileData?.is_muted || false,
        lastPlayedAt: profileData?.last_played_at,
      };
    } catch (e) {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        displayName: 'Aventureiro (Offline)',
        avatarEmoji: '👤',
      };
    }
  }, []);

  // Monitorar mudanças no estado de autenticação e verificar sessão inicial
  useEffect(() => {
    let mounted = true;
    let lastProfileUserId: string | null = null;
    let initialAuthResolved = false;

    // Seta o usuário com dados mínimos da sessão (sem bloquear em fetchProfile).
    // Permite que GameProvider monte e carregue dados em paralelo com o fetch
    // do profile — que segue em background e enriquece o user quando pronto.
    const applySession = (supabaseUser: User | null) => {
      initialAuthResolved = true;
      if (!mounted) return;

      if (!supabaseUser) {
        lastProfileUserId = null;
        setAuthState(prev => ({ user: null, isLoading: false, isPasswordRecovery: prev.isPasswordRecovery }));
        return;
      }

      setAuthState(prev => ({
        user: prev.user?.id === supabaseUser.id
          ? prev.user
          : {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              displayName: supabaseUser.user_metadata?.display_name || 'Aventureiro',
              avatarEmoji: supabaseUser.user_metadata?.avatar_emoji || '👤',
            },
        isLoading: false,
        isPasswordRecovery: prev.isPasswordRecovery,
      }));

      // Evita refetch duplicado quando onAuthStateChange dispara INITIAL_SESSION
      // logo após getSession retornar.
      if (lastProfileUserId === supabaseUser.id) return;
      lastProfileUserId = supabaseUser.id;

      fetchProfile(supabaseUser).then(profile => {
        if (mounted) setAuthState(prev => ({ user: profile, isLoading: false, isPasswordRecovery: prev.isPasswordRecovery }));
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthState(prev => ({ ...prev, isPasswordRecovery: true }));
      }
      applySession(session?.user ?? null);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => applySession(session?.user ?? null))
      .catch((err: unknown) => {
        console.error("Erro ao restaurar sessao:", err);
        if (!mounted || initialAuthResolved) return;
        setAuthState(prev => ({ user: null, isLoading: false, isPasswordRecovery: prev.isPasswordRecovery }));
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(
    async (email: string, password: string, captchaToken?: string): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (): Promise<{ success: boolean; error?: string }> => {
      const redirectTo = `${window.location.origin}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const register = useCallback(
    async (
      displayName: string,
      email: string,
      password: string,
      captchaToken: string
    ): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          captchaToken,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Se a confirmacao de e-mail estiver ativa no painel do Supabase, signUp nao devolve session.
      // Nesse caso avisamos o AuthPage para exibir "verifique sua caixa de entrada".
      if (!data.session) {
        return { success: true, needsEmailConfirmation: true };
      }

      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      setAuthState(prev => ({ ...prev, isPasswordRecovery: false }));
      return { success: true };
    },
    []
  );

  const exitPasswordRecovery = useCallback(() => {
    setAuthState(prev => ({ ...prev, isPasswordRecovery: false }));
    supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string, captchaToken?: string): Promise<{ success: boolean; error?: string }> => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
        captchaToken,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserAccount, "displayName" | "avatarEmoji" | "avatarUrl">>) => {
      if (!authState.user) return;

      const payload: any = {};
      if (updates.displayName) payload.display_name = updates.displayName;
      if (updates.avatarEmoji) payload.avatar_emoji = updates.avatarEmoji;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', authState.user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
      }

      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null
      }));
    },
    [authState.user]
  );

  const deleteAccount = useCallback(async () => {
    if (!authState.user) return;

    try {
      // 1. Deletar progresso e conquistas primeiro
      const { error: progressError } = await supabase
        .from('challenge_progress')
        .delete()
        .eq('user_id', authState.user.id);
      if (progressError) throw progressError;

      const { error: achievementsError } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', authState.user.id);
      if (achievementsError) throw achievementsError;

      // Compras/desbloqueios pagos sao autoritativos e nao devem ser apagados
      // diretamente pelo cliente. Remocao completa de conta precisa de backend
      // usando service role para limpar auth.users e registros de pagamento.
      
      // 2. Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', authState.user.id);
      if (profileError) throw profileError;

      // 3. Logout
      await logout();

      setAuthState(prev => ({ user: null, isLoading: false, isPasswordRecovery: prev.isPasswordRecovery }));
    } catch (err) {
      console.error("Erro ao deletar conta:", err);
      throw err;
    }
  }, [authState.user, logout]);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isLoading: authState.isLoading,
        isAuthenticated: !!authState.user,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updatePassword,
        isPasswordRecovery: authState.isPasswordRecovery,
        exitPasswordRecovery,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
