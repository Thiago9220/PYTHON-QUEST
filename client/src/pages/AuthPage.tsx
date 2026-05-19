import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus, Mail } from "lucide-react";

type Mode = "landing" | "login" | "register" | "reset";

export default function AuthPage() {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("landing");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const captchaEnabled = Boolean(turnstileSiteKey);

  const requireCaptcha = () => {
    if (!captchaEnabled || captchaToken) return true;
    toast.error("Confirme o desafio de seguranca antes de continuar.");
    return false;
  };

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaNonce((nonce) => nonce + 1);
  };

  const changeMode = (nextMode: Mode) => {
    setInfo(null);
    resetCaptcha();
    setMode(nextMode);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setInfo(null);

    if (mode === "reset") {
      if (!email.trim()) return toast.error("Informe seu e-mail.");
      if (!requireCaptcha()) return;
      setSubmitting(true);
      const result = await resetPassword(email.trim(), captchaToken ?? undefined);
      setSubmitting(false);
      if (!result.success) resetCaptcha();
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
      if (!requireCaptcha()) {
        setSubmitting(false);
        return;
      }
      const result = await login(email.trim(), password, captchaToken ?? undefined);
      setSubmitting(false);
      if (!result.success) resetCaptcha();
      if (!result.success) return toast.error(result.error ?? "Credenciais inválidas.");
      toast.success("Bem-vindo de volta!");
      return;
    }

    // register
    if (!requireCaptcha()) {
      setSubmitting(false);
      return;
    }
    const result = await register(displayName.trim(), email.trim(), password, captchaToken ?? "");
    setSubmitting(false);
    if (!result.success) resetCaptcha();
    if (!result.success) return toast.error(result.error ?? "Falha ao registrar.");
    if (result.needsEmailConfirmation) {
      setInfo("Conta criada! Confirme seu e-mail para entrar.");
      resetCaptcha();
      setMode("login");
    } else {
      toast.success("Conta criada com sucesso!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/auth-bg.png')" }}
      />
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.2),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.2),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {mode !== "landing" && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/assets/images/python-quest-logo.png" 
                alt="Python Quest Logo" 
                className="w-24 h-24 object-cover rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] ring-2 ring-cyan-500/50"
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Python Quest</h1>
            <p className="text-sm text-slate-400 mt-1">
              {mode === "login" && "Entre para continuar sua jornada."}
              {mode === "register" && "Crie sua conta e comece a aventura."}
              {mode === "reset" && "Vamos recuperar seu acesso."}
            </p>
          </div>
        )}

        {mode === "landing" ? (
          <div className="text-center bg-slate-900/70 backdrop-blur border border-slate-800 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center mb-6">
                <img 
                  src="/assets/images/python-quest-logo.png" 
                  alt="Python Quest Logo" 
                  className="w-32 h-32 object-cover rounded-3xl shadow-[0_0_40px_rgba(34,211,238,0.4)] ring-2 ring-cyan-500/50"
                />
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
                PYTHON QUEST
              </h1>
              <p className="text-slate-300 text-lg mb-8 max-w-sm mx-auto leading-relaxed font-medium">
                Aprenda programação hackeando sistemas, invadindo servidores e dominando a linguagem Python.
              </p>
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all bg-cyan-600 hover:bg-cyan-500"
                  onClick={() => changeMode("register")}
                >
                  <UserPlus className="size-5 mr-2" /> Iniciar Jornada
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 text-sm font-bold uppercase tracking-widest rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300"
                  onClick={() => changeMode("login")}
                >
                  <LogIn className="size-4 mr-2" /> Acessar Terminal
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {mode !== "reset" ? (
              <div className="flex bg-slate-950/40 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all border-b-2 ${
                    mode === "login"
                      ? "text-cyan-400 border-cyan-500 bg-slate-900/20"
                      : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/10"
                  }`}
                >
                  <LogIn className="size-4" />
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all border-b-2 ${
                    mode === "register"
                      ? "text-cyan-400 border-cyan-500 bg-slate-900/20"
                      : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/10"
                  }`}
                >
                  <UserPlus className="size-4" />
                  Criar Conta
                </button>
              </div>
            ) : (
              <div className="flex bg-slate-950/40 border-b border-slate-800">
                <div className="flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm text-cyan-400 border-b-2 border-cyan-500 bg-slate-900/20">
                  Recuperar Acesso
                </div>
              </div>
            )}

            <div className="p-6">
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
                            onClick={() => changeMode("reset")}
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

                  {captchaEnabled && turnstileSiteKey && (
                    <TurnstileWidget
                      key={`${mode}-${captchaNonce}`}
                      siteKey={turnstileSiteKey}
                      onToken={setCaptchaToken}
                    />
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
                </motion.form>
              </AnimatePresence>

              <div className="mt-6 text-center text-sm text-slate-400">
                {mode === "login" && (
                  <>
                    Não tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("register")}
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Crie uma agora
                    </button>
                  </>
                )}
                {mode === "register" && (
                  <>
                    Já tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("login")}
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Entre agora
                    </button>
                  </>
                )}
                {mode === "reset" && (
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Voltar ao login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-4">
          Seu progresso é salvo na nuvem e acompanha você em qualquer dispositivo.
        </p>
      </motion.div>
    </div>
  );
}
