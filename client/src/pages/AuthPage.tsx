import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus, Mail, Globe } from "lucide-react";

type Mode = "landing" | "login" | "register" | "reset";

export default function AuthPage() {
  const { login, register, resetPassword } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
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
    toast.error(t("authSecurityToast"));
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
      if (!email.trim()) return toast.error(t("authEmailRequired"));
      if (!requireCaptcha()) return;
      setSubmitting(true);
      const result = await resetPassword(email.trim(), captchaToken ?? undefined);
      setSubmitting(false);
      if (!result.success) resetCaptcha();
      if (!result.success) return toast.error(result.error ?? t("authEmailSendFail"));
      setInfo(t("authResetSent"));
      return;
    }

    if (!email.trim() || password.length < 6) {
      return toast.error(t("authInvalidInput"));
    }

    if (mode === "register" && displayName.trim().length < 2) {
      return toast.error(t("authNameTooShort"));
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
      if (!result.success) return toast.error(result.error ?? t("authInvalidCreds"));
      toast.success(t("authWelcomeBack"));
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
    if (!result.success) return toast.error(result.error ?? t("authRegisterFail"));
    if (result.needsEmailConfirmation) {
      setInfo(t("authConfirmEmailInfo"));
      resetCaptcha();
      setMode("login");
    } else {
      toast.success(t("authAccountCreated"));
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

      <button
        type="button"
        onClick={toggleLang}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 px-3 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 backdrop-blur-md hover:border-cyan-400 hover:bg-slate-800 transition-all"
      >
        <Globe className="w-3.5 h-3.5" />
        {lang === "pt" ? "PT-BR" : "EN-US"}
      </button>

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
              {mode === "login" && t("authSubLogin")}
              {mode === "register" && t("authSubRegister")}
              {mode === "reset" && t("authSubReset")}
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
                {t("authLandingDesc")}
              </p>
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all bg-cyan-600 hover:bg-cyan-500"
                  onClick={() => changeMode("register")}
                >
                  <UserPlus className="size-5 mr-2" /> {t("authStartJourney")}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 text-sm font-bold uppercase tracking-widest rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300"
                  onClick={() => changeMode("login")}
                >
                  <LogIn className="size-4 mr-2" /> {t("authAccessTerminal")}
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
                  {t("authLoginTab")}
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
                  {t("authRegisterTab")}
                </button>
              </div>
            ) : (
              <div className="flex bg-slate-950/40 border-b border-slate-800">
                <div className="flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm text-cyan-400 border-b-2 border-cyan-500 bg-slate-900/20">
                  {t("authResetTab")}
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
                      <Label htmlFor="displayName">{t("authCodenameLabel")}</Label>
                      <Input
                        id="displayName"
                        autoComplete="nickname"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t("authCodenamePlaceholder")}
                        disabled={submitting}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t("authEmailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("authEmailPlaceholder")}
                      disabled={submitting}
                    />
                  </div>

                  {mode !== "reset" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t("authPasswordLabel")}</Label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => changeMode("reset")}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            {t("authForgotPassword")}
                          </button>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("authPasswordPlaceholder")}
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
                      <><LogIn className="size-4" /> {t("authLoginTab")}</>
                    ) : mode === "register" ? (
                      <><UserPlus className="size-4" /> {t("authRegisterTab")}</>
                    ) : (
                      <><Mail className="size-4" /> {t("authSendLinkBtn")}</>
                    )}
                  </Button>
                </motion.form>
              </AnimatePresence>

              <div className="mt-6 text-center text-sm text-slate-400">
                {mode === "login" && (
                  <>
                    {t("authNoAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("register")}
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      {t("authCreateNow")}
                    </button>
                  </>
                )}
                {mode === "register" && (
                  <>
                    {t("authHasAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("login")}
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      {t("authSignInNow")}
                    </button>
                  </>
                )}
                {mode === "reset" && (
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {t("authBackToLogin")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-4">
          {t("authCloudFooter")}
        </p>
      </motion.div>
    </div>
  );
}
