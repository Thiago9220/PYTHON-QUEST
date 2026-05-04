import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Compass, Map, Play, Terminal, Trophy, Zap } from "lucide-react";
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
      avatar: "PY",
    },
    {
      npc: "Lina",
      text: "Voce vai escrever codigo real, executar no navegador e comparar a saida do console com o objetivo da missao.",
      avatar: "PY",
    },
    {
      npc: "Lina",
      text: "Comece pelo Porto das Variaveis. Depois, avance para escolhas, repeticoes e funcoes.",
      avatar: "PY",
    },
    {
      npc: "Lina",
      text: "Antes de embarcar, diga como voce quer aparecer no seu painel de progresso.",
      avatar: "PY",
    },
  ];

  const handleStart = () => {
    if (name.trim().length < 2) return;
    dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });
    onStart();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#eef9ff]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_84%_80%,rgba(16,185,129,0.28),transparent_34%),linear-gradient(135deg,#f8fdff_0%,#edf8ff_52%,#e7fff3_100%)]" />
        <div className="absolute inset-0 opacity-[0.32] [background-image:linear-gradient(rgba(14,165,233,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute left-[6%] top-[16%] h-28 w-28 rounded-[2rem] bg-white/55 rotate-12 shadow-sm" />
        <div className="absolute right-[8%] top-[14%] h-20 w-36 rounded-[2rem] bg-emerald-100/60 -rotate-6 shadow-sm" />
        <div className="absolute left-[14%] bottom-[13%] h-24 w-40 rounded-[2rem] bg-sky-100/70 -rotate-3 shadow-sm" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center px-5 py-8 md:px-10">
        {step === "hero" && (
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 shadow-sm shadow-sky-950/5 backdrop-blur">
                <Code2 className="h-4 w-4 text-sky-600" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-sky-700">
                  Aprenda Python jogando
                </span>
              </div>

              <h1 className="text-6xl font-black leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
                Python
                <span className="block bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                  Quest
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-xl leading-relaxed text-slate-600">
                Explore um arquipelago de desafios curtos, rode Python real no navegador e desbloqueie novas ilhas conforme aprende.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { icon: Compass, label: `${getAllChallenges().length}`, sub: "desafios" },
                  { icon: Map, label: `${WORLDS.length}`, sub: "ilhas" },
                  { icon: Zap, label: "Py", sub: "no navegador" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={sub} className="rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm shadow-sky-950/5 backdrop-blur">
                    <Icon className="mb-3 h-5 w-5 text-sky-600" />
                    <div className="text-2xl font-black text-slate-950">{label}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    setIntroIndex(0);
                    setStep("intro");
                  }}
                  size="lg"
                  className="h-13 rounded-xl bg-sky-600 px-8 text-base font-black text-white shadow-xl shadow-sky-900/20 hover:bg-sky-700"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Iniciar jornada
                </Button>
                <Button variant="outline" size="lg" onClick={() => setStep("name")} className="h-13 rounded-xl border-sky-200 bg-white/70 px-8 font-bold text-sky-700 hover:bg-white">
                  Ir direto ao mapa
                </Button>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, scale: 0.97, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
              className="relative hidden min-h-[620px] lg:block"
              aria-hidden="true"
            >
              <div className="absolute left-8 right-8 top-8 h-[500px] rounded-[3rem] border border-white/80 bg-white/45 shadow-2xl shadow-sky-950/10 backdrop-blur-md" />
              <div className="absolute inset-x-0 top-20 h-[420px] rounded-[4rem] bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.85),transparent_48%)]" />

              <svg className="absolute left-[12%] top-[18%] h-[390px] w-[76%]" viewBox="0 0 700 390" fill="none">
                <path d="M82 250C180 128 272 315 360 178C456 30 548 150 628 88" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 14" opacity="0.55" />
                <path d="M96 262C208 165 282 320 388 210C486 108 536 185 616 130" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 12" opacity="0.38" />
              </svg>

              {[
                { name: "Porto", top: "15%", left: "8%", color: "from-sky-300 to-cyan-100", active: true },
                { name: "Escolhas", top: "36%", left: "45%", color: "from-emerald-300 to-lime-100" },
                { name: "Loops", top: "57%", left: "18%", color: "from-amber-300 to-orange-100" },
                { name: "Funcoes", top: "18%", left: "68%", color: "from-violet-300 to-fuchsia-100" },
              ].map((island, index) => (
                <motion.div
                  key={island.name}
                  animate={{ y: [0, index % 2 === 0 ? -8 : 8, 0] }}
                  transition={{ repeat: Infinity, duration: 5 + index, ease: "easeInOut" }}
                  className={`absolute rounded-[2rem] border border-white/80 bg-gradient-to-br ${island.color} p-4 shadow-xl shadow-sky-950/10`}
                  style={{ top: island.top, left: island.left, width: island.active ? 170 : 148 }}
                >
                  <div className="rounded-2xl bg-white/80 p-3">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">PY</div>
                    <div className="text-sm font-black text-slate-950">{island.name}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${island.active ? "w-2/3 bg-sky-500" : "w-1/4 bg-slate-300"}`} />
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="absolute bottom-10 right-3 w-[360px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-sky-950/25">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-sky-300" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-100">console</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <pre className="p-5 font-mono text-sm leading-relaxed text-sky-50">
{`nome = "Aurora"
print(f"Ola, {nome}!")

> Ola, Aurora!`}
                </pre>
              </div>

              <div className="absolute bottom-28 left-2 rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-xl shadow-sky-950/10 backdrop-blur">
                <Trophy className="mb-3 h-6 w-6 text-emerald-600" />
                <div className="text-sm font-black text-slate-950">Progresso salvo</div>
                <div className="mt-1 text-xs text-slate-500">XP, ilhas e conquistas</div>
              </div>
            </motion.section>
          </div>
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
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl border border-sky-100 bg-white/90 p-8 text-center shadow-2xl shadow-sky-950/10 backdrop-blur">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 font-black text-white shadow-lg shadow-sky-900/20">
                PY
              </div>
              <h2 className="mb-2 text-3xl font-black text-slate-950">Como voce quer aparecer?</h2>
              <p className="mb-7 text-sm text-slate-500">Seu nome sera usado no mapa, no perfil e no certificado.</p>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Digite seu nome..."
                maxLength={20}
                className="mb-6 border-sky-200 bg-white py-6 text-center text-lg text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20"
                autoFocus
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("hero")} className="flex-1 border-sky-200">
                  Voltar
                </Button>
                <Button onClick={handleStart} disabled={name.trim().length < 2} className="flex-1 bg-sky-600 font-bold hover:bg-sky-700">
                  Entrar no mapa
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
