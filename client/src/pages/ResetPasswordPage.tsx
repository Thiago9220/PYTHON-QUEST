/**
 * SQL Quest — Tela de Redefinição de Senha
 * Exibida quando o usuário chega via link de recuperação do Supabase.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Database,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

const HERO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663564200245/8qmYcZFB46ctTkkmHkw4Tz/sqlquest-hero_01414393.png";

export default function ResetPasswordPage() {
  const { updatePassword, exitPasswordRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePassword(password);
      if (!result.success) {
        setError(result.error || "Não foi possível redefinir a senha.");
      } else {
        setSuccess(true);
        if (window.location.pathname === "/reset-password" || window.location.hash) {
          window.history.replaceState({}, "", "/");
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_URL})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0d0b08]" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-amber-900/30 border border-amber-700/40 rounded-full px-6 py-2 mb-6">
            <Database className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-mono tracking-widest uppercase">
              Recuperação de Acesso
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-amber-100">Nova</span>{" "}
            <span className="text-amber-400">Senha</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1c1917]/90 border border-amber-800/40 rounded-2xl backdrop-blur-md shadow-2xl shadow-black/60 overflow-hidden p-8">
            {success ? (
              <div className="text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-700/40 bg-emerald-950/30">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h2
                  className="text-2xl font-bold text-amber-100"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Senha redefinida!
                </h2>
                <p className="text-amber-300/70 text-sm">
                  Sua senha foi atualizada com sucesso. Faça login novamente para continuar sua jornada.
                </p>
                <Button
                  type="button"
                  onClick={exitPasswordRecovery}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold py-6 rounded-xl"
                >
                  Ir para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-700/40 bg-amber-950/30">
                    <KeyRound className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-amber-100"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Defina sua nova senha
                  </h2>
                  <p className="text-amber-400/60 text-sm mt-1">
                    Escolha uma senha com pelo menos 6 caracteres.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-amber-500 uppercase tracking-wider">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nova senha..."
                      className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/40 pl-10 pr-10 py-5 focus:border-amber-500 focus:ring-amber-500/20"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600/50 hover:text-amber-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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
                      placeholder="Repita a nova senha..."
                      className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/40 pl-10 py-5 focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold text-base py-6 rounded-xl shadow-lg shadow-amber-900/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Redefinir senha
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={exitPasswordRecovery}
                  className="w-full text-center text-amber-500/60 hover:text-amber-400 text-xs underline underline-offset-2 transition-colors"
                >
                  Cancelar e voltar para o login
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
