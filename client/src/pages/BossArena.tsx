import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Skull,
  Play,
  RotateCcw,
  Lightbulb,
  Check,
  Clock,
  Terminal,
  Lock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { useLanguage, isScreenShakeEnabled } from "@/contexts/LanguageContext";
import { getLocalizedWorld } from "@/lib/i18n/localize";
import { useBossEngine } from "@/hooks/useBossEngine";
import { getWorldById } from "@/lib/challenges";
import { BossIntroModal } from "@/components/BossIntroModal";
import { BossVictoryModal } from "@/components/BossVictoryModal";
import { EndingSequence } from "@/components/EndingSequence";
import { DEMO_WORLD_IDS, isDemoBuild } from "@/lib/platform";
import PythonEditor from "@/components/PythonEditor";

interface Props {
  worldId: string;
  onBack: () => void;
  /** Demo: chamado ao vencer o chefe do último setor liberado. */
  onDemoComplete?: () => void;
}

export default function BossArena({ worldId, onBack, onDemoComplete }: Props) {
  const { dispatch, isBossDefeated, isBossUnlocked } = useGame();
  const { t, lang } = useLanguage();
  const rawWorld = getWorldById(worldId);
  const world = rawWorld ? getLocalizedWorld(rawWorld, lang) : rawWorld;
  const boss = world?.boss ?? null;
  const themeColor = world?.color || "#0ea5e9";

  const engine = useBossEngine(boss, dispatch, isBossDefeated);
  const [isShaking, setIsShaking] = useState(false);
  const prevCompletedActsRef = useRef(0);

  const completedActsCount = engine.actCompletions.filter(Boolean).length;
  useEffect(() => {
    if (completedActsCount > prevCompletedActsRef.current && isScreenShakeEnabled()) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 400);
      prevCompletedActsRef.current = completedActsCount;
      return () => clearTimeout(timer);
    }
    prevCompletedActsRef.current = completedActsCount;
  }, [completedActsCount]);

  const wasDefeated = boss ? isBossDefeated(boss.id) : false;
  const [showIntro, setShowIntro] = useState(!wasDefeated);
  const [showVictory, setShowVictory] = useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(
    wasDefeated ? Date.now() : null
  );
  const [expandedLockedAct, setExpandedLockedAct] = useState<number | null>(null);

  // Timer — começa apenas quando intro é dispensada
  useEffect(() => {
    if (showIntro || !runStartedAt || engine.defeated) return;
    const id = setInterval(() => {
      setElapsedSec(Math.round((Date.now() - runStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [runStartedAt, showIntro, engine.defeated]);

  // Trigger victory modal
  useEffect(() => {
    if (engine.defeated && !showVictory && !showEnding) {
      const id = setTimeout(() => setShowVictory(true), 1500);
      return () => clearTimeout(id);
    }
  }, [engine.defeated, showVictory, showEnding]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        engine.handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [engine.handleRun]);

  const accessAllowed = useMemo(
    () => (boss ? isBossUnlocked(worldId) || wasDefeated : false),
    [boss, worldId, isBossUnlocked, wasDefeated]
  );

  if (!world || !boss) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{lang === "en" ? "Boss not found." : "Boss não encontrado."}</p>
          <Button onClick={onBack}>{lang === "en" ? "Back" : "Voltar"}</Button>
        </div>
      </div>
    );
  }

  if (!accessAllowed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-slate-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 mb-4">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{lang === "en" ? "Boss Locked" : "Boss Bloqueado"}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {lang === "en"
              ? `Complete at least ${Math.round(boss.unlockThreshold * 100)}% of the atomic challenges in ${world.title} to unlock this boss.`
              : `Complete pelo menos ${Math.round(boss.unlockThreshold * 100)}% dos desafios atômicos do mundo ${world.title} para desbloquear o boss.`}
          </p>
          <Button
            onClick={onBack}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            {lang === "en" ? "Back" : "Voltar"}
          </Button>
        </div>
      </div>
    );
  }

  const currentAct = boss.acts[engine.currentActIndex];
  const currentHints = currentAct.hints.slice(0, engine.currentHintIdx);
  const completedCount = engine.actCompletions.filter(Boolean).length;
  const progress = (completedCount / boss.acts.length) * 100;
  const bossHpPct = Math.max(0, Math.round(100 - progress));
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;

  return (
      <motion.div
        animate={isShaking ? { x: [0, -8, 8, -5, 5, 0], y: [0, 3, -3, 2, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.38 }}
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30 relative overflow-hidden"
      >
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, ${themeColor}66, transparent 40%), radial-gradient(circle at 80% 70%, #dc2626aa, transparent 40%)`,
            }}
          />
          <div className="absolute inset-0 opacity-[0.04] [background:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_3px)]" />
        </div>

        {/* Header */}
        <header className="relative z-20 border-b border-rose-500/20 bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-3 font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("abort")}
              </Button>
              <div className="h-6 w-px bg-white/10 hidden md:block" />
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${themeColor}22`,
                    borderColor: `${themeColor}50`,
                  }}
                >
                  <Skull className="w-4 h-4" style={{ color: themeColor }} />
                </div>
                <div>
                  <div
                    className="text-[9px] font-black uppercase tracking-[0.3em]"
                    style={{ color: themeColor }}
                  >
                  // Boss Encounter
                  </div>
                  <div className="text-base font-black text-white tracking-tight">
                    {boss.title}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[230px]">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {t("bossIntegrity")}
                  </span>
                  <span className="font-mono text-white">
                    {bossHpPct}% <span className="text-slate-500">({completedCount}/{boss.acts.length} {t("bossActs")})</span>
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-rose-500/30 shadow-inner">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${bossHpPct}%` }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    style={{
                      background:
                        bossHpPct > 50
                          ? "linear-gradient(to right, #ef4444, #f97316)"
                          : bossHpPct > 0
                            ? "linear-gradient(to right, #f97316, #eab308)"
                            : "#10b981",
                      boxShadow: "0 0 14px rgba(244, 63, 94, 0.7)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-4 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
          {/* LEFT: Act narrative + objectives */}
          <div className="space-y-4">
            <motion.div
              key={engine.currentActIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl"
            >
              <div
                className="px-5 py-3 border-b border-white/5 flex items-center justify-between"
                style={{ backgroundColor: `${themeColor}11` }}
              >
                <div>
                  <div
                    className="text-[9px] font-black uppercase tracking-[0.25em]"
                    style={{ color: themeColor }}
                  >
                    {lang === "en" ? "Act" : "Ato"} {engine.currentActIndex + 1} / {boss.acts.length}
                  </div>
                  <div className="text-sm font-black text-white tracking-tight">
                    {currentAct.title}
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {currentAct.objectives.length} obj.
                </div>
              </div>

              <div className="p-5">
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic border-l-2 pl-3" style={{ borderColor: `${themeColor}50` }}>
                  {currentAct.narrative}
                </p>

                <div className="space-y-2">
                  <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">
                    {lang === "en" ? "Objectives" : "Objetivos"}
                  </div>
                  {currentAct.objectives.map((obj, i) => {
                    const result = engine.objectiveResults.find((r) => r.index === i);
                    const passed = result?.passed === true;
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-2 px-3 py-2 rounded-lg border transition-all ${passed
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-white/5 border-white/10"
                          }`}
                      >
                        <div
                          className={`shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${passed
                              ? "bg-emerald-500/30 border-emerald-400"
                              : "border-white/20"
                            }`}
                        >
                          {passed && <Check className="w-3 h-3 text-emerald-300" />}
                        </div>
                        <div
                          className={`text-[12px] leading-snug font-mono ${passed ? "text-emerald-200" : "text-slate-400"
                            }`}
                        >
                          {obj.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentHints.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <div className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400 mb-1">
                      {lang === "en" ? "Revealed Hints" : "Dicas Reveladas"}
                    </div>
                    {currentHints.map((h, i) => (
                      <div
                        key={i}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[12px] font-mono text-amber-100/90 leading-snug"
                      >
                        {h.text}
                      </div>
                    ))}
                  </div>
                )}

                {engine.feedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-4 p-3 rounded-lg text-[12px] font-mono ${engine.feedback.toLowerCase().includes("sucesso") ||
                        engine.feedback.toLowerCase().includes("concluído") ||
                        engine.feedback.toLowerCase().includes("success") ||
                        engine.feedback.toLowerCase().includes("complete")
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                        : engine.feedback.toLowerCase().startsWith("erro") ||
                            engine.feedback.toLowerCase().startsWith("error")
                          ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                          : "bg-white/5 border border-white/10 text-slate-400"
                      }`}
                  >
                    {engine.feedback}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={engine.handleRun}
                disabled={!engine.pythonReady || engine.isRunning || engine.defeated}
                className="h-12 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                <Play className="w-4 h-4 mr-2" />
                {engine.isRunning ? t("executing") : t("executeAct")}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                {engine.currentHintIdx < currentAct.hints.length && (
                  <Button
                    onClick={engine.handleHint}
                    className="h-10 text-amber-400 bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/20 rounded-xl text-[9px] font-black uppercase tracking-widest"
                  >
                    <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
                    Hint -{currentAct.hints[engine.currentHintIdx].cost}
                  </Button>
                )}
                <Button
                  onClick={engine.handleReset}
                  className="h-10 text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Editor + locked acts + output */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* Locked acts (collapsible) */}
            {engine.currentActIndex > 0 && (
              <div className="space-y-2">
                {boss.acts.slice(0, engine.currentActIndex).map((act, idx) => {
                  const expanded = expandedLockedAct === idx;
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedLockedAct(expanded ? null : idx)
                        }
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          </div>
                          <div className="text-left">
                            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
                              {lang === "en" ? `Act ${idx + 1} completed` : `Ato ${idx + 1} concluído`}
                            </div>
                            <div className="text-xs font-bold text-slate-300">
                              {act.title}
                            </div>
                          </div>
                        </div>
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expanded && (
                          <motion.pre
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-950/60 border-t border-white/5"
                          >
                            <code className="block p-4 text-[12px] font-mono text-emerald-200/80 leading-relaxed whitespace-pre-wrap">
                              {engine.actCodes[idx] || (lang === "en" ? "# (empty)" : "# (vazio)")}
                            </code>
                          </motion.pre>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Active editor for current act */}
            <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/40 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span
                    className="text-[10px] font-mono uppercase tracking-[0.2em]"
                    style={{ color: themeColor }}
                  >
                    {lang === "en"
                      ? `Act ${engine.currentActIndex + 1} — Active Editor`
                      : `Ato ${engine.currentActIndex + 1} — Editor Ativo`}
                  </span>
                </div>
              </div>
              <PythonEditor
                code={engine.actCodes[engine.currentActIndex] ?? ""}
                onChange={(newCode) =>
                  engine.setActCode(engine.currentActIndex, newCode)
                }
                onRun={engine.handleRun}
                isRunning={engine.isRunning}
                pythonReady={engine.pythonReady}
                placeholder={lang === "en" ? "# Write the code for this act here..." : "# Escreva o código deste ato aqui..."}
              />
            </div>

            {/* Output */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/40 border-b border-white/5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-[0.2em]">
                  Output
                </span>
              </div>
              <pre className="p-4 text-[12.5px] font-mono text-emerald-200/90 leading-relaxed whitespace-pre-wrap min-h-[80px] max-h-[200px] overflow-y-auto">
                {engine.output || (
                  <span className="text-slate-600">{lang === "en" ? "// awaiting execution..." : "// aguardando execução..."}</span>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Intro modal */}
        <AnimatePresence>
          {showIntro && (
            <BossIntroModal
              boss={boss}
              themeColor={themeColor}
              onAccept={() => {
                setShowIntro(false);
                const now = Date.now();
                setRunStartedAt(now);
                engine.markStart();
              }}
              onCancel={onBack}
            />
          )}
        </AnimatePresence>

        {/* Victory modal */}
        <AnimatePresence>
          {showVictory && (
            <BossVictoryModal
              boss={boss}
              themeColor={themeColor}
              durationSec={elapsedSec}
              hintsUsed={engine.hintsUsed}
              onClose={() => {
                setShowVictory(false);
                if (boss.isFinal) {
                  setShowEnding(true);
                } else if (
                  isDemoBuild() &&
                  onDemoComplete &&
                  boss.worldId === DEMO_WORLD_IDS[DEMO_WORLD_IDS.length - 1]
                ) {
                  onDemoComplete();
                } else {
                  onBack();
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Final da campanha: escolha, epílogo e créditos */}
        <AnimatePresence>
          {showEnding && <EndingSequence themeColor={themeColor} onFinish={onBack} />}
        </AnimatePresence>
    </motion.div >
  );
}
