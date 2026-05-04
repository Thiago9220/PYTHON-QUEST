import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Compass, Trophy, Zap } from "lucide-react";
import { WORLDS, getAllChallenges } from "@/lib/challenges";
import { DialogueCutscene } from "@/components/DialogueCutscene";

export default function Welcome({ onStart }: { onStart: () => void }) {
  const { dispatch } = useGame();
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [step, setStep] = useState<"hero" | "intro" | "name">("hero");
  const [introIndex, setIntroIndex] = useState(0);

  const introDialogs = [
    {
      npc: "Lina",
      text: "Bem-vindo ao Arquipelago Aurora. Aqui, cada ilha ensina uma habilidade de Python por meio de pequenos desafios praticos.",
      avatar: "/avatars/guido.webp",
    },
    {
      npc: "Lina",
      text: "Voce vai escrever codigo real, executar no navegador e comparar a saida do console com o objetivo da missao.",
      avatar: "/avatars/guido.webp",
    },
    {
      npc: "Lina",
      text: "Comece pelo Porto das Variaveis. Depois, avance para escolhas, repeticoes e funcoes.",
      avatar: "/avatars/guido.webp",
    },
    {
      npc: "Lina",
      text: "Antes de embarcar, diga como voce quer aparecer no seu painel de progresso.",
      avatar: "/avatars/guido.webp",
    },
  ];

  const handleStart = () => {
    if (name.trim().length < 2) return;
    dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });
    onStart();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-white to-emerald-100">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-[-8rem] w-96 h-96 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-8rem] w-[28rem] h-[28rem] rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {step === "hero" && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 border border-sky-200 rounded-full px-5 py-2 mb-8 shadow-sm">
              <Code2 className="w-4 h-4 text-sky-600" />
              <span className="text-sky-700 text-sm font-mono tracking-widest uppercase">
                Aprenda Python jogando
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-5 tracking-tight text-slate-950">
              Python
              <br />
              <span className="text-sky-600">Quest</span>
            </h1>

            <p className="text-slate-600 text-xl mb-10 leading-relaxed max-w-xl mx-auto">
              Explore ilhas claras, resolva scripts curtos e construa uma base solida em Python.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
              {[
                { icon: Compass, label: `${getAllChallenges().length} Desafios`, sub: `${WORLDS.length} ilhas` },
                { icon: Trophy, label: "Conquistas", sub: "Titulos de progresso" },
                { icon: Zap, label: "Python Real", sub: "Pyodide no navegador" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white/80 border border-sky-100 rounded-xl p-4 shadow-sm">
                  <Icon className="w-6 h-6 text-sky-600 mx-auto mb-2" />
                  <div className="text-slate-900 font-semibold text-sm">{label}</div>
                  <div className="text-slate-500 text-xs mt-1">{sub}</div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setIntroIndex(0);
                setStep("intro");
              }}
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg px-10 py-6 rounded-xl shadow-lg shadow-sky-900/20"
            >
              Iniciar Jornada
            </Button>
          </motion.div>
        )}

        {step === "intro" && (
          <DialogueCutscene
            npc={introDialogs[introIndex].npc}
            text={introDialogs[introIndex].text}
            avatar={introDialogs[introIndex].avatar}
            onComplete={() => {
              if (introIndex < introDialogs.length - 1) setIntroIndex(introIndex + 1);
              else setStep("name");
            }}
          />
        )}

        {step === "name" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md w-full"
          >
            <div className="bg-white/90 border border-sky-100 rounded-2xl p-8 shadow-xl">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                PY
              </div>
              <h2 className="text-3xl font-black text-slate-950 mb-2">Qual e o seu nome?</h2>
              <p className="text-slate-500 text-sm mb-7">Ele aparecera no seu painel de progresso.</p>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Digite seu nome..."
                maxLength={20}
                className="bg-white border-sky-200 text-slate-900 placeholder:text-slate-400 text-center text-lg py-6 mb-6 focus:border-sky-500 focus:ring-sky-500/20"
                autoFocus
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("hero")} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleStart} disabled={name.trim().length < 2} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold">
                  Comecar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
