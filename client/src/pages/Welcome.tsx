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
      npc: "AI-7",
      text: "Conexão estabelecida, Operador. O Mainframe da cidade está instável e o Core central foi isolado pelo sistema de defesa.",
      avatar: "PY",
    },
    {
      npc: "AI-7",
      text: "Para contornar o firewall, você deve dominar a linguagem Python. Cada setor guarda um módulo corrompido que precisa ser reescrito.",
      avatar: "PY",
    },
    {
      npc: "AI-7",
      text: "Seu primeiro destino é o Terminal Alpha. Lá, você aprenderá a alocar memória e a executar seus primeiros scripts de invasão.",
      avatar: "PY",
    },
    {
      npc: "AI-7",
      text: "Mais tarde, caso obtenha XP suficiente, seu Nível de Acesso permitirá explorar os protocolos avançados de Ciência de Dados e Machine Learning.",
      avatar: "PY",
    },
    {
      npc: "AI-7",
      text: "O console será sua principal interface. Diga-me, qual será o seu codinome nos registros da rede?",
      avatar: "PY",
    },
  ];

  const handleStart = () => {
    if (name.trim().length < 2) return;
    dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });
    onStart();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617]">
      <div className="absolute inset-0">
        {/* Cyberpunk Background Image */}
        <img 
          src="/assets/images/cyberpunk_bg.png" 
          alt="Cyberpunk Hacker Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/40 to-[#020617]" />
        
        {/* Subtle Scanline/Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center px-6 py-12 md:px-12">
        {step === "hero" && (
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md shadow-2xl">
                <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-sky-200/80">
                  Sistema Iniciado: Hacker Protocol
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Conexão Estabelecida, Operador</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                O Mainframe da cidade está instável. O Core central do sistema foi comprometido e apenas você, através da engenharia reversa do Python, pode restaurá-lo.
              </p>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-6">
                <div className="flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    A Rede clama por sua presença. Quebre os firewalls, recupere o <span className="text-white font-bold">Core do Sistema</span> dominando a lógica da programação e torne-se um Operador Elite.
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setIntroIndex(0);
                  setStep("intro");
                }}
                className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white font-black tracking-widest text-[10px] uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
              >
                <Zap className="w-4 h-4 mr-2" />
                Iniciar Conexão
              </Button>

              <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
                {[
                  { icon: Compass, label: `${getAllChallenges().length}`, sub: "Nodes" },
                  { icon: Map, label: `${WORLDS.length}`, sub: "Setores" },
                  { icon: Zap, label: "Py", sub: "Engine" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={sub} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="mb-4 h-6 w-6 text-sky-400 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-black text-white">{label}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={() => {
                    setIntroIndex(0);
                    setStep("intro");
                  }}
                  size="lg"
                  className="h-16 rounded-2xl bg-sky-600 px-10 text-lg font-black text-white shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)] transition-all hover:bg-sky-500 hover:-translate-y-1 active:translate-y-0"
                >
                  <Play className="mr-3 h-5 w-5 fill-current" />
                  Iniciar Ritual
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setStep("name")} 
                  className="h-16 rounded-2xl border-white/10 bg-white/5 px-10 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20"
                >
                  Ir ao Mapa das Ilhas
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
                { name: "Terminal", top: "15%", left: "8%", color: "from-sky-300 to-cyan-100", active: true },
                { name: "Nodes", top: "36%", left: "45%", color: "from-emerald-300 to-lime-100" },
                { name: "Loops", top: "57%", left: "18%", color: "from-amber-300 to-orange-100" },
                { name: "Modulos", top: "18%", left: "68%", color: "from-violet-300 to-fuchsia-100" },
              ].map((island, index) => (
                <motion.div
                  key={island.name}
                  animate={{ y: [0, index % 2 === 0 ? -8 : 8, 0] }}
                  transition={{ repeat: Infinity, duration: 5 + index, ease: "easeInOut" }}
                  className={`absolute rounded-[2rem] border border-white/80 bg-gradient-to-br ${island.color} p-4 shadow-xl shadow-sky-950/10`}
                  style={{ top: island.top, left: island.left, width: island.active ? 170 : 148 }}
                >
                  <div className="rounded-2xl bg-white/80 p-3">
                    <img
                      src="/assets/images/python-protocol-mark.png"
                      alt="Python Protocol"
                      className="mb-3 h-9 w-9 rounded-xl object-cover shadow-[0_0_14px_rgba(14,165,233,0.35)]"
                    />
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
                <div className="mt-1 text-xs text-slate-500">XP, setores e permissões</div>
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
            <div className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-10 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden group">
              {/* Decorative scanline effect inside the card */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-500 to-emerald-400 font-black text-white text-2xl shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                  PY
                </div>
                
                <h2 className="mb-2 text-3xl font-black text-white tracking-tight">Identificação</h2>
                <p className="mb-8 text-sm text-slate-400 font-medium">Informe seu codinome para os registros da rede.</p>

                <div className="relative mb-8">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                    placeholder="Codinome do Operador..."
                    maxLength={20}
                    className="h-14 border-white/10 bg-white/5 py-6 text-center text-lg text-white placeholder:text-slate-600 focus:border-sky-500 focus:ring-sky-500/20 rounded-xl transition-all"
                    autoFocus
                  />
                  <div className="absolute inset-0 rounded-xl border border-sky-500/20 pointer-events-none" />
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep("hero")} 
                    className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl font-bold transition-all"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleStart} 
                    disabled={name.trim().length < 2} 
                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-[0_10px_20px_-5px_rgba(14,165,233,0.4)] transition-all active:scale-95 disabled:bg-white/5 disabled:text-slate-600"
                  >
                    INICIAR BYPASS
                  </Button>
                </div>
              </div>

              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
