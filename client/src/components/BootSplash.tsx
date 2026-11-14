import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Terminal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { initPython } from "@/lib/pythonEngine";

type BootSplashProps = {
  isDataReady: boolean;
  onComplete: () => void;
};

export function BootSplash({ isDataReady, onComplete }: BootSplashProps) {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [progress, setProgress] = useState(12);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const completedRef = useRef(false);

  // Warm up offline Pyodide runtime during boot splash
  useEffect(() => {
    let active = true;
    initPython()
      .then(() => {
        if (active) setPyodideReady(true);
      })
      .catch(() => {
        if (active) setPyodideReady(true);
      });

    const minTimer = setTimeout(() => {
      if (active) setMinDelayDone(true);
    }, 1500);

    // Failsafe so splash never blocks startup on slow disks
    const maxTimer = setTimeout(() => {
      if (active) {
        setPyodideReady(true);
        setMinDelayDone(true);
      }
    }, 3500);

    return () => {
      active = false;
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Animate progress realistically through boot phases
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const target =
          minDelayDone && isDataReady && pyodideReady
            ? 100
            : pyodideReady
            ? 88
            : isDataReady
            ? 64
            : 38;
        if (prev >= target) return prev;
        const step = Math.max(1, Math.ceil((target - prev) * 0.22));
        return Math.min(100, prev + step);
      });
    }, 45);
    return () => clearInterval(interval);
  }, [minDelayDone, isDataReady, pyodideReady]);

  // Trigger fade-out once everything is loaded and progress reaches 100%
  useEffect(() => {
    if (progress < 100 || !minDelayDone || !isDataReady || completedRef.current) return;
    completedRef.current = true;
    const t1 = setTimeout(() => setFadeOut(true), 180);
    const t2 = setTimeout(() => onComplete(), 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progress, minDelayDone, isDataReady, onComplete]);

  const statusText = (() => {
    if (progress < 35) {
      return isEn ? "Mounting local save & filesystem..." : "Montando save local e sistema de arquivos...";
    }
    if (progress < 75) {
      return isEn
        ? "Booting offline Python runtime (Pyodide WASM)..."
        : "Inicializando motor Python offline (Pyodide WASM)...";
    }
    if (progress < 98) {
      return isEn
        ? "Synchronizing sectors, achievements & simulators..."
        : "Sincronizando setores, conquistas e simuladores...";
    }
    return isEn ? "Scriptweaver Protocol ready." : "Protocolo Scriptweaver pronto.";
  })();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.34, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] text-slate-100 select-none overflow-hidden"
    >
      {/* Ambient radial lighting + subtle cyber grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center"
      >
        {/* Emblem */}
        <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-3xl border border-sky-400/30 bg-slate-900/90 shadow-[0_0_50px_rgba(14,165,233,0.28)]">
          <div className="absolute -inset-2 rounded-[1.75rem] border border-sky-500/15 animate-pulse" />
          <img
            src="/assets/images/python-protocol-mark.png"
            alt="Python Quest"
            className="h-14 w-14 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1">
          <Terminal className="h-3 w-3 text-sky-400" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-sky-300">
            Scriptweaver OS
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          PYTHON QUEST
        </h1>
        <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          {isEn ? "The Rise of the Scriptweaver" : "A Ascensão do Scriptweaver"}
        </p>

        {/* Progress Bar */}
        <div className="mt-10 w-full">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 truncate pr-3">
              <Cpu className="h-3.5 w-3.5 shrink-0 text-sky-400 animate-pulse" />
              <span className="truncate">{statusText}</span>
            </span>
            <span className="shrink-0 font-bold text-sky-300">{progress}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-900/90 p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" />
          <span>{isEn ? "100% Offline Local Runtime" : "Runtime Local 100% Offline"}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

