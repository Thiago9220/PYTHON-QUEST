/**
 * SQL Quest — Tela de Login / Registro
 * Design: Dark Academia / Terminal Moderno
 * Formulário com alternância entre Login e Cadastro
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
import {
  Database,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Scroll,
  Trophy,
  Zap,
} from "lucide-react";
import { getAllChallenges, WORLDS } from "@/lib/challenges";

const HERO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663564200245/8qmYcZFB46ctTkkmHkw4Tz/sqlquest-hero_01414393.png";

type Mode = "login" | "register";

export default function AuthPage() {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [isResetting, setIsResetting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setInfo("");
    setShowPassword(false);
    setCaptchaToken(null);
    setCaptchaResetKey((k) => k + 1);
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Digite seu email para receber o link de recuperação.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email inválido.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Confirme que você não é um robô para continuar.");
      return;
    }
    setIsResetting(true);
    try {
      const result = await resetPassword(email.trim(), captchaToken ?? undefined);
      if (!result.success) {
        const err = result.error?.toLowerCase() || "";
        if (err.includes("captcha")) {
          setError("Não conseguimos confirmar que você é humano. Recarregue a página e tente novamente.");
        } else {
          setError(result.error || "Não foi possível enviar o email de recuperação.");
        }
        setCaptchaToken(null);
        setCaptchaResetKey((k) => k + 1);
      } else {
        setInfo("Enviamos um link de recuperação para seu email. Verifique sua caixa de entrada.");
        setCaptchaToken(null);
        setCaptchaResetKey((k) => k + 1);
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsResetting(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // Validações
    if (!email.trim()) {
      setError("Digite seu email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email inválido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (mode === "register") {
      if (!name.trim() || name.trim().length < 2) {
        setError("Digite um nome com pelo menos 2 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Confirme que você não é um robô para continuar.");
      return;
    }
    if (mode === "register" && !TURNSTILE_SITE_KEY) {
      setError("Cadastro indisponivel: CAPTCHA nao configurado. Use login com Google.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await login(email.trim(), password, captchaToken ?? undefined);
        if (!result.success) {
          const err = result.error?.toLowerCase() || "";
          if (err.includes("email not confirmed")) {
            setError("Por favor, verifique sua caixa de entrada e confirme seu e-mail para jogar.");
          } else if (err.includes("invalid login credentials")) {
            setError("E-mail ou senha incorretos.");
          } else if (err.includes("captcha")) {
            setError("Não conseguimos confirmar que você é humano. Recarregue a página e tente novamente.");
          } else {
            setError(result.error || "Erro ao entrar.");
          }
          setCaptchaToken(null);
          setCaptchaResetKey((k) => k + 1);
        }
      } else {
        const result = await register(name.trim(), email.trim(), password, captchaToken!);
        if (!result.success) {
          const err = result.error?.toLowerCase() || "";
          if (err.includes("user already registered")) {
            setError("Este e-mail já está em uso.");
          } else if (err.includes("password should be at least") || err.includes("at least 6")) {
            setError("A senha deve ter pelo menos 6 caracteres.");
          } else if (err.includes("email signups are disabled")) {
            setError("Cadastro por e-mail indisponível. Use o login com Google.");
          } else if (err.includes("captcha")) {
            setError("Não conseguimos confirmar que você é humano. Recarregue a página e tente novamente.");
          } else {
            setError(result.error || "Erro ao criar conta.");
          }
          setCaptchaToken(null);
          setCaptchaResetKey((k) => k + 1);
        } else if (result.needsEmailConfirmation) {
          setInfo("Conta criada! Verifique seu e-mail para confirmar antes de entrar.");
        }
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0d0b08]">
      {/* Hero background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_URL})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0d0b08]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Partículas decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo + Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-amber-900/30 border border-amber-700/40 rounded-full px-6 py-2 mb-6">
            <Database className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-mono tracking-widest uppercase">
              Aprenda SQL Jogando
            </span>
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-amber-100">SQL</span>{" "}
            <span className="text-amber-400">Quest</span>
          </h1>

          <p className="text-amber-200/60 text-sm max-w-md mx-auto">
            Embarque em uma jornada épica pelo mundo dos dados
          </p>
        </motion.div>

        {/* Card de Login/Registro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1c1917]/90 border border-amber-800/40 rounded-2xl backdrop-blur-md shadow-2xl shadow-black/60 overflow-hidden">
            {/* Tabs Login / Registro */}
            <div className="flex border-b border-amber-900/30">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === "login"
                    ? "text-amber-300 border-b-2 border-amber-500 bg-amber-950/20"
                    : "text-amber-600/60 hover:text-amber-400 hover:bg-amber-950/10"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === "register"
                    ? "text-amber-300 border-b-2 border-amber-500 bg-amber-950/20"
                    : "text-amber-600/60 hover:text-amber-400 hover:bg-amber-950/10"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Criar Conta
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Título do formulário */}
                  <div className="text-center mb-2">
                    <div className="text-3xl mb-2">
                      {mode === "login" ? "⚔️" : "🛡️"}
                    </div>
                    <h2
                      className="text-2xl font-bold text-amber-100"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {mode === "login"
                        ? "Entrar no Reino"
                        : "Criar sua conta"}
                    </h2>
                    <p className="text-amber-400/60 text-sm mt-1">
                      {mode === "login"
                        ? "Sua aventura SQL aguarda"
                        : "Comece sua jornada agora"}
                    </p>
                  </div>

                  {/* Campo Nome (apenas no registro) */}
                  {mode === "register" && (
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-amber-500 uppercase tracking-wider">
                        Nome de Aventureiro
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/50" />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome no jogo..."
                          maxLength={20}
                          className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/40 pl-10 py-5 focus:border-amber-500 focus:ring-amber-500/20"
                          autoFocus={mode === "register"}
                        />
                      </div>
                    </div>
                  )}

                  {/* Campo Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-amber-500 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/50" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/40 pl-10 py-5 focus:border-amber-500 focus:ring-amber-500/20"
                        autoFocus={mode === "login"}
                      />
                    </div>
                  </div>

                  {/* Campo Senha */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-amber-500 uppercase tracking-wider">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/50" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha..."
                        className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/40 pl-10 pr-10 py-5 focus:border-amber-500 focus:ring-amber-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600/50 hover:text-amber-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {mode === "login" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isResetting || isSubmitting}
                          className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors disabled:opacity-50"
                        >
                          {isResetting ? "Enviando..." : "Esqueceu a senha?"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Confirmar Senha (apenas no registro) */}
                  {mode === "register" && (
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-amber-500 uppercase tracking-wider">
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/50" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a senha..."
                          className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/40 pl-10 py-5 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Captcha — login e cadastro */}
              {TURNSTILE_SITE_KEY && (
                <div className="pt-1">
                  <TurnstileWidget
                    key={captchaResetKey}
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={setCaptchaToken}
                  />
                </div>
              )}

              {/* Mensagem de erro */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
                {info && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 text-amber-300 text-sm bg-amber-950/30 border border-amber-700/40 rounded-lg px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {info}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão de submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold text-base py-6 rounded-xl shadow-lg shadow-amber-900/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-700/50 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar na Aventura
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta e Jogar
                  </>
                )}
              </Button>

              {/* Link alternativo */}
              <p className="text-center text-amber-500/50 text-xs">
                {mode === "login" ? (
                  <>
                    Não tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                      Crie uma agora
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                      Faça login
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>
        </motion.div>

        {/* Features abaixo do card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mt-8 max-w-md w-full"
        >
          {[
            { icon: Scroll, label: `${getAllChallenges().length} Desafios`, sub: `${WORLDS.length} mundos` },
            { icon: Trophy, label: "Conquistas", sub: "Progresso salvo" },
            { icon: Zap, label: "SQL Real", sub: "Motor no navegador" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-3 backdrop-blur-sm text-center"
            >
              <Icon className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-amber-100 font-semibold text-xs">{label}</div>
              <div className="text-amber-400/50 text-[10px] mt-0.5">{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
