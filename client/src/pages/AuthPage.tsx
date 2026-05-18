import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus, Mail } from "lucide-react";

type Mode = "login" | "register" | "reset";

export default function AuthPage() {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setInfo(null);

    if (mode === "reset") {
      if (!email.trim()) return toast.error("Informe seu e-mail.");
      setSubmitting(true);
      const result = await resetPassword(email.trim());
      setSubmitting(false);
      if (!result.success) return toast.error(result.error ?? "Falha ao enviar e-mail.");
      setInfo("Enviamos um link de recuperação para seu e-mail.");
      return;
    }

    if (!email.trim() || password.length < 6) {
      return toast.error("E-mail válido e senha de 6+ caracteres.");
    }

    if (mode === "register" && displayName.trim().length < 2) {
      return toast.error("Codinome precisa ter pelo menos 2 caracteres.");
    }

    setSubmitting(true);

    if (mode === "login") {
      const result = await login(email.trim(), password);
      setSubmitting(false);
      if (!result.success) return toast.error(result.error ?? "Credenciais inválidas.");
      toast.success("Bem-vindo de volta!");
      return;
    }

    // register
    const result = await register(displayName.trim(), email.trim(), password, "");
    setSubmitting(false);
    if (!result.success) return toast.error(result.error ?? "Falha ao registrar.");
    if (result.needsEmailConfirmation) {
      setInfo("Conta criada! Confirme seu e-mail para entrar.");
      setMode("login");
    } else {
      toast.success("Conta criada com sucesso!");
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);
    if (!result.success) toast.error(result.error ?? "Falha no login com Google.");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.15),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 mb-3 shadow-lg shadow-cyan-500/30">
            <span className="text-3xl">🐍</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Python Quest</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "login" && "Entre para continuar sua jornada."}
            {mode === "register" && "Crie sua conta e comece a aventura."}
            {mode === "reset" && "Vamos recuperar seu acesso."}
          </p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Codinome</Label>
                  <Input
                    id="displayName"
                    autoComplete="nickname"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Hacker_77"
                    disabled={submitting}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  disabled={submitting}
                />
              </div>

              {mode !== "reset" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setInfo(null); setMode("reset"); }}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={submitting}
                  />
                </div>
              )}

              {info && (
                <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-md p-2.5">
                  {info}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === "login" ? (
                  <><LogIn className="size-4" /> Entrar</>
                ) : mode === "register" ? (
                  <><UserPlus className="size-4" /> Criar conta</>
                ) : (
                  <><Mail className="size-4" /> Enviar link</>
                )}
              </Button>

              {mode !== "reset" && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-slate-900 px-2 text-slate-500">ou</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 border-slate-200"
                    onClick={handleGoogle}
                    disabled={submitting}
                  >
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                    </svg>
                    Continuar com Google
                  </Button>
                </>
              )}
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === "login" && (
              <>
                Ainda não tem conta?{" "}
                <button
                  onClick={() => { setInfo(null); setMode("register"); }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Criar conta
                </button>
              </>
            )}
            {mode === "register" && (
              <>
                Já tem conta?{" "}
                <button
                  onClick={() => { setInfo(null); setMode("login"); }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Entrar
                </button>
              </>
            )}
            {mode === "reset" && (
              <button
                onClick={() => { setInfo(null); setMode("login"); }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Seu progresso é salvo na nuvem e acompanha você em qualquer dispositivo.
        </p>
      </motion.div>
    </div>
  );
}
