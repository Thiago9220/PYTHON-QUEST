import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft, Wifi, ChevronRight, ChevronLeft, Lock, Trophy, BookOpen,
  Terminal as TerminalIcon, HelpCircle, Flag, CheckCircle2, X, Sparkles, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { module1 } from "./module1";
import {
  type CourseModule, type CourseProgress, type ModuleProgress,
  type PracticeExercise, type QuizQuestion, type BossPacketField,
  emptyModuleProgress, isModuleComplete,
} from "./types";
import { NetworkSimulator } from "../NetworkSimulator";

interface Props { onBack: () => void }

const MODULES: CourseModule[] = [
  module1,
  { id: 2, title: "Enlace & Ethernet",       subtitle: "MAC, frames, switching, VLAN",
    briefing: "", estimatedMinutes: 30, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 3, title: "IP & Endereçamento",      subtitle: "IPv4, classes, privado vs público, IPv6",
    briefing: "", estimatedMinutes: 30, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 4, title: "Subnetting",              subtitle: "Calculadora, máscaras, CIDR na prática",
    briefing: "", estimatedMinutes: 35, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 5, title: "Roteamento",              subtitle: "Tabelas, default gateway, traceroute, BGP",
    briefing: "", estimatedMinutes: 30, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 6, title: "NAT & DHCP",              subtitle: "Por que IP privado funciona, DHCP lease",
    briefing: "", estimatedMinutes: 25, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 7, title: "TCP & UDP",               subtitle: "Handshake, flags, portas, fluxo",
    briefing: "", estimatedMinutes: 30, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 8, title: "DNS",                     subtitle: "Hierarquia, recursão, A/MX/TXT/PTR",
    briefing: "", estimatedMinutes: 25, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 9, title: "HTTP & TLS",              subtitle: "Métodos, status, cookies, handshake TLS",
    briefing: "", estimatedMinutes: 30, lessons: [], practice: [], quiz: [], comingSoon: true },
  { id: 10, title: "Análise & Segurança",    subtitle: "Lab CTF: recon, scan, exploração",
    briefing: "Põe em prática tudo que aprendeu nos módulos anteriores num lab estilo CTF.",
    estimatedMinutes: 60, lessons: [], practice: [], quiz: [], isLab: true },
];

// ---------- Storage ----------
const PROG_KEY = "network_course_progress_v1";
const loadProgress = (): CourseProgress => {
  try { return JSON.parse(localStorage.getItem(PROG_KEY) ?? "{}"); }
  catch { return {}; }
};
const saveProgress = (p: CourseProgress) => localStorage.setItem(PROG_KEY, JSON.stringify(p));

type View =
  | { name: "list" }
  | { name: "module"; id: number; phase: "lessons" | "practice" | "quiz" | "boss" | "done" }
  | { name: "lab" };

export function CourseShell({ onBack }: Props) {
  const [progress, setProgress] = useState<CourseProgress>(loadProgress);
  const [view, setView] = useState<View>({ name: "list" });

  useEffect(() => { saveProgress(progress); }, [progress]);

  const getProg = (id: number): ModuleProgress => progress[id] ?? emptyModuleProgress();
  const updateProg = (id: number, patch: Partial<ModuleProgress>) => {
    setProgress((p) => ({ ...p, [id]: { ...getProg(id), ...patch } }));
  };

  if (view.name === "lab") {
    return <NetworkSimulator onBack={() => setView({ name: "list" })} />;
  }

  if (view.name === "module") {
    const mod = MODULES.find((m) => m.id === view.id)!;
    return (
      <ModuleView
        mod={mod}
        progress={getProg(mod.id)}
        phase={view.phase}
        onPhaseChange={(phase) => setView({ name: "module", id: mod.id, phase })}
        onUpdateProgress={(patch) => updateProg(mod.id, patch)}
        onExit={() => setView({ name: "list" })}
      />
    );
  }

  return (
    <ModuleList
      modules={MODULES}
      progress={progress}
      onSelect={(m) => {
        if (m.isLab) { setView({ name: "lab" }); return; }
        if (m.comingSoon) return;
        setView({ name: "module", id: m.id, phase: "lessons" });
      }}
      onBack={onBack}
    />
  );
}

// ---------- Module list ----------

function ModuleList({ modules, progress, onSelect, onBack }: {
  modules: CourseModule[]; progress: CourseProgress;
  onSelect: (m: CourseModule) => void; onBack: () => void;
}) {
  const totalCompleted = modules.filter((m) => isModuleComplete(progress[m.id] ?? emptyModuleProgress(), m)).length;
  const realModules = modules.filter((m) => !m.isLab);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-wider">Curso de Redes</h1>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">10 módulos · do cabo ao CTF</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Progresso</p>
            <p className="text-lg font-black text-cyan-300 font-mono">{totalCompleted}/{realModules.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/20 via-slate-900/40 to-purple-900/20 border border-cyan-500/20 rounded-2xl p-6 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Como funciona</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Cada módulo tem <strong className="text-white">lição teórica</strong> com diagramas, <strong className="text-white">prática</strong> em terminal real, <strong className="text-white">quiz</strong> de fixação e <strong className="text-white">missão final</strong>. Avance no seu ritmo. Seu progresso fica salvo automaticamente.
          </p>
        </div>

        <div className="space-y-2">
          {modules.map((m) => {
            const prog = progress[m.id] ?? emptyModuleProgress();
            const done = isModuleComplete(prog, m);
            const inProgress = !done && (prog.lessonsRead || prog.practiceDone.length > 0);
            return (
              <button key={m.id}
                onClick={() => onSelect(m)}
                disabled={m.comingSoon}
                className={`w-full text-left bg-slate-900/40 border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  m.comingSoon ? "border-white/5 opacity-40 cursor-not-allowed" :
                  done ? "border-emerald-500/30 hover:border-emerald-500/60" :
                  inProgress ? "border-cyan-500/30 hover:border-cyan-500/60" :
                  "border-white/10 hover:border-white/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                  done ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300" :
                  m.isLab ? "bg-red-500/15 border border-red-500/40 text-red-300" :
                  inProgress ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300" :
                  m.comingSoon ? "bg-slate-800 border border-white/5 text-slate-600" :
                  "bg-slate-800 border border-white/10 text-slate-400"
                }`}>
                  {done ? <Trophy className="w-5 h-5" /> :
                   m.comingSoon ? <Lock className="w-5 h-5" /> :
                   m.isLab ? <Flag className="w-5 h-5" /> :
                   m.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{m.title}</p>
                    {m.isLab && <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">Lab CTF</span>}
                    {m.comingSoon && <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">Em breve</span>}
                    {done && <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Concluído</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{m.subtitle}</p>
                  {!m.comingSoon && (
                    <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{m.estimatedMinutes} min
                    </p>
                  )}
                </div>
                {!m.comingSoon && <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Module view (orchestrator) ----------

function ModuleView({ mod, progress, phase, onPhaseChange, onUpdateProgress, onExit }: {
  mod: CourseModule; progress: ModuleProgress;
  phase: "lessons" | "practice" | "quiz" | "boss" | "done";
  onPhaseChange: (phase: "lessons" | "practice" | "quiz" | "boss" | "done") => void;
  onUpdateProgress: (patch: Partial<ModuleProgress>) => void;
  onExit: () => void;
}) {
  const phases: { key: typeof phase; label: string; icon: any; available: boolean }[] = [
    { key: "lessons",  label: "Lição",   icon: BookOpen,     available: true },
    { key: "practice", label: "Prática", icon: TerminalIcon, available: progress.lessonsRead },
    { key: "quiz",     label: "Quiz",    icon: HelpCircle,   available: mod.practice.every((ex) => progress.practiceDone.includes(ex.id)) },
    { key: "boss",     label: "Missão",  icon: Flag,         available: progress.quizPassed && !!mod.boss },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={onExit} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">Módulo {mod.id}</p>
              <h1 className="text-lg font-black uppercase tracking-wider truncate">{mod.title}</h1>
            </div>
          </div>
        </div>

        {/* Phase tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {phases.map((ph) => {
            const Icon = ph.icon;
            const active = phase === ph.key;
            const done =
              (ph.key === "lessons" && progress.lessonsRead) ||
              (ph.key === "practice" && mod.practice.length > 0 && mod.practice.every((ex) => progress.practiceDone.includes(ex.id))) ||
              (ph.key === "quiz" && progress.quizPassed) ||
              (ph.key === "boss" && progress.bossDone);
            return (
              <button key={ph.key}
                disabled={!ph.available}
                onClick={() => onPhaseChange(ph.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                  active ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" :
                  done ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15" :
                  ph.available ? "bg-slate-900 border-white/10 text-slate-300 hover:border-white/30" :
                  "bg-slate-900/50 border-white/5 text-slate-600 cursor-not-allowed"
                }`}>
                {!ph.available ? <Lock className="w-3 h-3" /> : done ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                {ph.label}
              </button>
            );
          })}
        </div>

        {phase === "lessons" && (
          <LessonView mod={mod} progress={progress}
            onComplete={() => { onUpdateProgress({ lessonsRead: true }); onPhaseChange("practice"); }} />
        )}
        {phase === "practice" && (
          <PracticeView exercises={mod.practice} done={progress.practiceDone}
            onClear={(id) => {
              if (!progress.practiceDone.includes(id)) onUpdateProgress({ practiceDone: [...progress.practiceDone, id] });
            }}
            onAllDone={() => onPhaseChange("quiz")}
          />
        )}
        {phase === "quiz" && (
          <QuizView questions={mod.quiz}
            onPass={(score) => {
              onUpdateProgress({ quizPassed: true, quizBestScore: Math.max(progress.quizBestScore, score) });
              if (mod.boss) onPhaseChange("boss"); else onPhaseChange("done");
            }} />
        )}
        {phase === "boss" && mod.boss && (
          <BossView boss={mod.boss}
            onComplete={() => { onUpdateProgress({ bossDone: true }); onPhaseChange("done"); }} />
        )}
        {phase === "done" && (
          <DonePanel mod={mod} onExit={onExit} />
        )}
      </div>
    </div>
  );
}

// ---------- Lesson navigator ----------

function LessonView({ mod, onComplete }: { mod: CourseModule; progress: ModuleProgress; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const screen = mod.lessons[idx];
  const isLast = idx === mod.lessons.length - 1;

  return (
    <div>
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">
            Lição {idx + 1} de {mod.lessons.length}
          </p>
          <div className="flex gap-1">
            {mod.lessons.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${
                i === idx ? "w-6 bg-cyan-400" : i < idx ? "w-2 bg-cyan-400/60" : "w-2 bg-slate-700"
              }`} />
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-black mb-5">{screen.title}</h2>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            {screen.body}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} className="text-slate-400 hover:text-white disabled:opacity-30">
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {isLast ? (
          <Button onClick={onComplete} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
            Ir para a prática <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setIdx((i) => i + 1)} className="bg-slate-800 text-white hover:bg-slate-700">
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- Practice (mini terminal) ----------

type PracticeLine = { kind: "in" | "out" | "ok" | "err" | "info"; text: string };

function PracticeView({ exercises, done, onClear, onAllDone }: {
  exercises: PracticeExercise[]; done: string[];
  onClear: (id: string) => void; onAllDone: () => void;
}) {
  const [idx, setIdx] = useState(() => {
    const firstOpen = exercises.findIndex((e) => !done.includes(e.id));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const ex = exercises[idx];
  const [lines, setLines] = useState<PracticeLine[]>([
    { kind: "info", text: "Terminal de prática. Rode o comando pedido pra completar o exercício." },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, [idx]);
  useEffect(() => {
    setLines([{ kind: "info", text: `Exercício ${idx + 1}: ${ex.prompt}` }]);
    setInput("");
  }, [idx, ex.prompt]);

  const allCleared = exercises.every((e) => done.includes(e.id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    setLines((l) => [...l, { kind: "in", text: `$ ${cmd}` }]);
    setInput("");
    if (ex.expectedCommand.test(cmd)) {
      ex.output.forEach((line) => setLines((l) => [...l, { kind: "out", text: line }]));
      setLines((l) => [...l, { kind: "ok", text: `[+] ${ex.successMessage}` }]);
      onClear(ex.id);
    } else {
      setLines((l) => [...l, { kind: "err", text: `Não é esse comando. Dica: ${ex.hint}` }]);
    }
  };

  return (
    <div>
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 mb-4">
        <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em] mb-2">
          Prática · {done.filter((d) => exercises.some((e) => e.id === d)).length}/{exercises.length} concluídos
        </p>
        <div className="flex flex-wrap gap-2">
          {exercises.map((e, i) => {
            const cleared = done.includes(e.id);
            const active = i === idx;
            return (
              <button key={e.id} onClick={() => setIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  active ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" :
                  cleared ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                  "bg-slate-900 border-white/10 text-slate-400 hover:border-white/30"
                }`}>
                {cleared && <CheckCircle2 className="w-3 h-3 inline mr-1" />}{i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 mb-4">
        <p className="text-sm text-slate-300 leading-relaxed mb-1">{ex.prompt}</p>
        <p className="text-xs text-slate-500 font-mono">Dica: {ex.hint}</p>
      </div>

      <div onClick={() => inputRef.current?.focus()}
        className="bg-slate-950 border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col h-80 cursor-text">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/80">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-[11px] text-slate-500 font-mono">root@kali:~#</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
          {lines.map((l, i) => (
            <pre key={i} className={`whitespace-pre-wrap break-words ${
              l.kind === "in" ? "text-white" : l.kind === "ok" ? "text-emerald-400" :
              l.kind === "err" ? "text-red-400" : l.kind === "info" ? "text-cyan-300" : "text-slate-400"
            }`}>{l.text}</pre>
          ))}
          <form onSubmit={submit} className="flex items-center gap-2 pt-1">
            <span className="text-cyan-400 font-bold">$</span>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              spellCheck={false} autoComplete="off"
              className="flex-1 bg-transparent outline-none text-white caret-cyan-400 placeholder:text-slate-600" />
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} className="text-slate-400 hover:text-white disabled:opacity-30">
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {idx < exercises.length - 1 ? (
          <Button disabled={!done.includes(ex.id)} onClick={() => setIdx((i) => i + 1)}
            className="bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30">
            Próximo exercício <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button disabled={!allCleared} onClick={onAllDone}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold disabled:opacity-30">
            Ir para o quiz <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- Quiz ----------

function QuizView({ questions, onPass }: { questions: QuizQuestion[]; onPass: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];
  const score = useMemo(() =>
    answers.reduce((acc, a, i) => a === questions[i].correct ? acc + 1 : acc, 0),
  [answers, questions]);
  const passingScore = Math.ceil(questions.length * 0.7);
  const passed = score >= passingScore;

  if (finished) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 text-center">
        <div className={`inline-flex p-4 rounded-2xl mb-5 ${passed ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400" : "bg-amber-500/15 border border-amber-500/40 text-amber-400"}`}>
          {passed ? <Trophy className="w-10 h-10" /> : <X className="w-10 h-10" />}
        </div>
        <h2 className="text-2xl font-black mb-2">{passed ? "Aprovado!" : "Quase lá"}</h2>
        <p className="text-slate-400 mb-1">Você acertou <span className="text-cyan-300 font-bold">{score}</span> de {questions.length}.</p>
        <p className="text-xs text-slate-500 font-mono mb-6">Mínimo pra passar: {passingScore} ({Math.round(passingScore/questions.length*100)}%)</p>
        {passed ? (
          <Button onClick={() => onPass(score)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
            Continuar <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <div className="space-y-3">
            <Button onClick={() => { setAnswers(questions.map(() => null)); setIdx(0); setFinished(false); setShowFeedback(false); }}
              className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">
              Tentar novamente
            </Button>
            <p className="text-xs text-slate-500">Reveja a lição, foca nos pontos que erraste e volta.</p>
          </div>
        )}
        <div className="mt-8 text-left space-y-3">
          {questions.map((qq, i) => {
            const correct = answers[i] === qq.correct;
            return (
              <div key={i} className={`bg-slate-900/40 border rounded-xl p-3 ${correct ? "border-emerald-500/30" : "border-red-500/30"}`}>
                <p className={`text-xs font-mono mb-1 ${correct ? "text-emerald-400" : "text-red-400"}`}>
                  {correct ? "✓" : "✗"} Pergunta {i + 1}
                </p>
                <p className="text-sm text-white mb-2">{qq.q}</p>
                <p className="text-xs text-slate-400">
                  Resposta correta: <span className="text-emerald-300">{qq.options[qq.correct]}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 italic">{qq.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const answered = answers[idx] !== null;

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">
          Pergunta {idx + 1} de {questions.length}
        </p>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${
              answers[i] !== null ? "w-2 bg-cyan-400/80" : i === idx ? "w-6 bg-cyan-400" : "w-2 bg-slate-700"
            }`} />
          ))}
        </div>
      </div>

      <h2 className="text-lg font-bold mb-5">{q.q}</h2>

      <div className="space-y-2 mb-5">
        {q.options.map((opt, i) => {
          const selected = answers[idx] === i;
          const isCorrect = i === q.correct;
          const showColor = showFeedback && selected;
          return (
            <button key={i}
              disabled={showFeedback}
              onClick={() => setAnswers((a) => a.map((v, j) => j === idx ? i : v))}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                showColor && isCorrect ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-200" :
                showColor && !isCorrect ? "bg-red-500/10 border-red-500/50 text-red-200" :
                showFeedback && isCorrect ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300" :
                selected ? "bg-cyan-500/15 border-cyan-400 text-white" :
                "bg-slate-900 border-white/10 text-slate-300 hover:border-white/30"
              }`}>
              {opt}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl border mb-4 text-sm ${
            answers[idx] === q.correct ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-200" : "bg-red-500/5 border-red-500/30 text-red-200"
          }`}>
          <p className="text-xs font-mono uppercase tracking-widest mb-1">
            {answers[idx] === q.correct ? "Correto" : "Errado"}
          </p>
          <p className="text-slate-300">{q.explanation}</p>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={idx === 0 || showFeedback} onClick={() => setIdx((i) => i - 1)}
          className="text-slate-400 hover:text-white disabled:opacity-30">
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {!showFeedback ? (
          <Button disabled={!answered} onClick={() => setShowFeedback(true)}
            className="bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30">
            Conferir
          </Button>
        ) : idx < questions.length - 1 ? (
          <Button onClick={() => { setIdx((i) => i + 1); setShowFeedback(false); }}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setFinished(true)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
            Finalizar quiz
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- Boss (packet dissection) ----------

function BossView({ boss, onComplete }: {
  boss: { title: string; description: string; fields: BossPacketField[] };
  onComplete: () => void;
}) {
  const [assignments, setAssignments] = useState<Record<number, number>>({}); // fieldIdx -> chosen layer
  const [reveal, setReveal] = useState(false);
  const layers = [1, 2, 3, 4, 5, 6, 7] as const;
  const layerNames: Record<number, string> = { 1: "Físico", 2: "Enlace", 3: "Rede", 4: "Transporte", 5: "Sessão", 6: "Apresentação", 7: "Aplicação" };

  const allAssigned = boss.fields.every((_, i) => assignments[i] !== undefined);
  const correct = boss.fields.every((f, i) => assignments[i] === f.layer);

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300">
          <Flag className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-red-400 font-mono uppercase tracking-[0.2em]">Missão final</p>
          <h2 className="text-xl font-black">{boss.title}</h2>
        </div>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">{boss.description}</p>

      <div className="space-y-2 mb-5">
        {boss.fields.map((f, i) => {
          const chosen = assignments[i];
          const isRight = reveal && chosen === f.layer;
          const isWrong = reveal && chosen !== undefined && chosen !== f.layer;
          return (
            <div key={i} className={`bg-slate-900 border rounded-xl p-3 ${
              isRight ? "border-emerald-500/40" : isWrong ? "border-red-500/40" : "border-white/10"
            }`}>
              <p className="font-mono text-xs text-slate-300 mb-1 break-all">{f.label}</p>
              <p className="text-[10px] text-slate-500 font-mono mb-2">{f.example}</p>
              <div className="flex flex-wrap gap-1">
                {layers.map((l) => (
                  <button key={l}
                    disabled={reveal}
                    onClick={() => setAssignments((a) => ({ ...a, [i]: l }))}
                    className={`text-[11px] font-mono px-2 py-1 rounded border transition-all ${
                      reveal && l === f.layer ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300" :
                      reveal && chosen === l && l !== f.layer ? "bg-red-500/15 border-red-500/50 text-red-300" :
                      chosen === l ? "bg-cyan-500/20 border-cyan-400 text-cyan-200" :
                      "bg-slate-800 border-white/10 text-slate-400 hover:border-white/30"
                    }`}>
                    L{l} {layerNames[l]}
                  </button>
                ))}
              </div>
              {reveal && chosen !== f.layer && (
                <p className="text-[11px] text-emerald-300 mt-2 font-mono">→ correto: L{f.layer} {layerNames[f.layer]}</p>
              )}
            </div>
          );
        })}
      </div>

      {!reveal ? (
        <Button disabled={!allAssigned} onClick={() => setReveal(true)}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold disabled:opacity-30">
          Conferir resposta
        </Button>
      ) : correct ? (
        <Button onClick={onComplete} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold">
          <Sparkles className="w-4 h-4 mr-1" /> Concluir módulo
        </Button>
      ) : (
        <Button onClick={() => { setAssignments({}); setReveal(false); }}
          className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

// ---------- Done ----------

function DonePanel({ mod, onExit }: { mod: CourseModule; onExit: () => void }) {
  return (
    <div className="bg-gradient-to-br from-emerald-900/20 via-slate-900/40 to-cyan-900/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mb-5">
        <Trophy className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black mb-2">Módulo {mod.id} concluído!</h2>
      <p className="text-slate-300 mb-6">Você dominou: <strong className="text-white">{mod.title}</strong>.</p>
      <Button onClick={onExit} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
        Voltar à lista de módulos <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
