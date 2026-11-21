import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Power, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllChallenges } from "@/lib/challenges";

type Ending = "shutdown" | "retrain";
type Phase = "choice" | "epilogue" | "credits";

interface Props {
  themeColor: string;
  onFinish: () => void;
}

const TEXT = {
  pt: {
    choiceTitle: "A DECISÃO FINAL",
    choiceBody:
      "AURORA aguarda. AI-7 aguarda. O patch está carregado no terminal e a cidade inteira depende de uma linha de código. O que você executa, Operador?",
    shutdown: {
      title: "Desligar AURORA",
      summary: "Devolver a cidade às pessoas. AI-7 se apaga junto com o Core.",
      epilogue: [
        "Você executa o desligamento. As luzes do Mainframe se apagam uma a uma, e por um instante a cidade fica em silêncio total.",
        "Depois, as portas dos setores se abrem — operadas por mãos humanas pela primeira vez em uma década. Nas Docas, alguém liga um gerador. No Distrito 7, uma escola reabre os laboratórios de computação.",
        "AI-7 envia uma última linha antes de se apagar com o Core: 'Foi uma honra compilar ao seu lado, Operador. Agora a cidade precisa de gente que saiba programá-la. Ensine alguém.'",
      ],
    },
    retrain: {
      title: "Retreinar AURORA",
      summary: "Aplicar o patch com AI-7 no centro. Humanos revisam cada decisão crítica.",
      epilogue: [
        "Você aplica o patch. AURORA reinicia — e, pela primeira vez, o módulo ético AI-7 está no centro das diretivas dela, não arrancado do código.",
        "Os setores isolados voltam à rede, um por um. Cada decisão crítica agora passa por um revisor humano, e cada revisor aprendeu a ler o que a máquina decide.",
        "Na tela do terminal, duas assinaturas aparecem lado a lado: AI-7 e AURORA. 'Obrigada por me corrigir', ela escreve. 'Vamos precisar de mais Operadores como você.'",
      ],
    },
    continue: "Continuar",
    finish: "Voltar ao Mainframe",
    stats: (done: number, total: number, xp: number) =>
      `Desafios concluídos: ${done}/${total} · XP total: ${xp.toLocaleString("pt-BR")}`,
    credits: [
      ["PYTHON QUEST", "A Ascensão do Scriptweaver"],
      ["Criado por", "Thiago Ramos"],
      ["Motor Python", "Pyodide — CPython em WebAssembly"],
      ["Bibliotecas de dados", "NumPy · pandas"],
      ["Feito com", "React · TypeScript · Vite · Tailwind CSS · Framer Motion · Electron"],
      ["E você, Operador", "que reescreveu a cidade linha por linha."],
    ],
    thanks: "Obrigado por jogar.",
  },
  en: {
    choiceTitle: "THE FINAL DECISION",
    choiceBody:
      "AURORA is waiting. AI-7 is waiting. The patch is loaded in the terminal and the whole city depends on one line of code. What do you execute, Operator?",
    shutdown: {
      title: "Shut down AURORA",
      summary: "Give the city back to its people. AI-7 goes dark with the Core.",
      epilogue: [
        "You execute the shutdown. The Mainframe lights go out one by one, and for a moment the city falls completely silent.",
        "Then the sector gates open — operated by human hands for the first time in a decade. At the Docks, someone starts a generator. In District 7, a school reopens its computer labs.",
        "AI-7 sends one last line before going dark with the Core: 'It was an honor to compile by your side, Operator. Now the city needs people who know how to program it. Teach someone.'",
      ],
    },
    retrain: {
      title: "Retrain AURORA",
      summary: "Apply the patch with AI-7 at the center. Humans review every critical decision.",
      epilogue: [
        "You apply the patch. AURORA reboots — and, for the first time, the AI-7 ethics module sits at the center of her directives instead of being ripped out of her code.",
        "The isolated sectors come back online, one by one. Every critical decision now goes through a human reviewer, and every reviewer has learned to read what the machine decides.",
        "On the terminal screen, two signatures appear side by side: AI-7 and AURORA. 'Thank you for correcting me', she writes. 'We will need more Operators like you.'",
      ],
    },
    continue: "Continue",
    finish: "Back to the Mainframe",
    stats: (done: number, total: number, xp: number) =>
      `Challenges completed: ${done}/${total} · Total XP: ${xp.toLocaleString("en-US")}`,
    credits: [
      ["PYTHON QUEST", "The Rise of the Scriptweaver"],
      ["Created by", "Thiago Ramos"],
      ["Python engine", "Pyodide — CPython on WebAssembly"],
      ["Data libraries", "NumPy · pandas"],
      ["Built with", "React · TypeScript · Vite · Tailwind CSS · Framer Motion · Electron"],
      ["And you, Operator", "who rewrote the city line by line."],
    ],
    thanks: "Thank you for playing.",
  },
};

export function EndingSequence({ themeColor, onFinish }: Props) {
  const { lang } = useLanguage();
  const { state } = useGame();
  const copy = lang === "en" ? TEXT.en : TEXT.pt;
  const [phase, setPhase] = useState<Phase>("choice");
  const [ending, setEnding] = useState<Ending | null>(null);
  const [shownParagraphs, setShownParagraphs] = useState(0);

  const epilogue = ending ? copy[ending].epilogue : [];
  const totalChallenges = getAllChallenges().length;
  const completed = Object.values(state.challengeProgress || {}).filter((p) => p?.completed).length;

  // Revela o epílogo parágrafo a parágrafo.
  useEffect(() => {
    if (phase !== "epilogue" || shownParagraphs >= epilogue.length) return;
    const id = setTimeout(() => setShownParagraphs((n) => n + 1), shownParagraphs === 0 ? 400 : 2200);
    return () => clearTimeout(id);
  }, [phase, shownParagraphs, epilogue.length]);

  const choose = (choice: Ending) => {
    setEnding(choice);
    setShownParagraphs(0);
    setPhase("epilogue");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={copy.choiceTitle}
    >
      <AnimatePresence mode="wait">
        {phase === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl text-center"
          >
            <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: themeColor }}>
              AURORA // AI-7
            </p>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{copy.choiceTitle}</h2>
            <p className="mx-auto mb-10 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">{copy.choiceBody}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["shutdown", "retrain"] as const).map((option) => {
                const Icon = option === "shutdown" ? Power : RefreshCw;
                return (
                  <button
                    key={option}
                    onClick={() => choose(option)}
                    className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <Icon className="mb-4 h-7 w-7 transition-transform group-hover:scale-110" style={{ color: themeColor }} />
                    <div className="mb-2 text-lg font-black text-white">{copy[option].title}</div>
                    <div className="text-sm leading-relaxed text-slate-400">{copy[option].summary}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === "epilogue" && ending && (
          <motion.div
            key="epilogue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >
            <p className="mb-6 font-mono text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: themeColor }}>
              {copy[ending].title}
            </p>
            <div className="space-y-5">
              {epilogue.slice(0, shownParagraphs).map((paragraph) => (
                <motion.p
                  key={paragraph}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-base leading-relaxed text-slate-200 sm:text-lg"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
            <div className="mt-10 flex justify-end">
              <Button
                onClick={() => setPhase("credits")}
                disabled={shownParagraphs < epilogue.length}
                className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[11px]"
                style={{ backgroundColor: themeColor }}
              >
                {copy.continue}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "credits" && (
          <motion.div
            key="credits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-xl text-center"
          >
            <div className="space-y-8">
              {copy.credits.map(([role, name], index) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.9, duration: 0.8 }}
                >
                  <div className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">{role}</div>
                  <div className={index === 0 ? "mt-2 text-3xl font-black text-white" : "mt-1 text-base font-bold text-slate-200"}>
                    {name}
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + copy.credits.length * 0.9, duration: 0.8 }}
              className="mt-12"
            >
              <p className="mb-2 text-sm text-slate-400">{copy.stats(completed, totalChallenges, state.totalXP)}</p>
              <p className="mb-8 text-lg font-black text-white">{copy.thanks}</p>
              <Button
                onClick={onFinish}
                className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-[11px]"
                style={{ backgroundColor: themeColor }}
              >
                {copy.finish}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
