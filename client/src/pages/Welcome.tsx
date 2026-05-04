/**
 * SQL Quest — Tela de Boas-Vindas
 * Design: Dark Academia / Terminal Moderno
 * Fundo: hero image da biblioteca, texto âmbar/creme sobre escuro
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scroll, Database, Trophy, Zap } from "lucide-react";
import { WORLDS, getAllChallenges } from "@/lib/challenges";
import { DialogueCutscene } from "@/components/DialogueCutscene";

const HERO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663564200245/8qmYcZFB46ctTkkmHkw4Tz/sqlquest-hero_01414393.png";

export default function Welcome({ onStart }: { onStart: () => void }) {
  const { dispatch, state } = useGame();
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [step, setStep] = useState<"hero" | "intro" | "name">("hero");
  const [introIndex, setIntroIndex] = useState(0);

  const introDialogs = [
    {
      npc: "O Bibliotecário",
      text: "Saudações, aventureiro! Você acaba de entrar na Grande Biblioteca dos Dados, o coração de todo o conhecimento do reino.",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Para navegar por este vasto oceano de informações, você precisará dominar o SQL — a Linguagem de Consulta Estruturada.",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "O SQL é a língua universal usada para conversar com bancos de dados. Com ele, você pode buscar, filtrar e organizar dados para revelar segredos ocultos.",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Mas por que aprender esta língua arcana? Sabia que no 'Mundo Exterior', mestres do SQL são extremamente valorizados? Eles recebem os maiores salários e tomam as decisões mais importantes.",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Enquanto outros se perdem em planilhas infinitas e lentas, você poderá conjurar queries que entregam respostas em milissegundos. É o poder da produtividade absoluta!",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Imagine que os dados de todo o reino estão guardados em imensas estantes invisíveis. O SQL é a ferramenta que nos permite organizar e ler essas prateleiras.",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Com comandos como SELECT, você 'escolhe' o que quer ver. Com WHERE, você 'filtra' apenas o necessário. É como dar ordens diretas à própria realidade dos dados!",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Nesta jornada, você não apenas lerá dados, mas restaurará mundos inteiros resolvendo puzzles de lógica. Está pronto para se tornar um Mestre das Queries?",
      avatar: "/avatars/socrates_v3.webp"
    },
    {
      npc: "O Bibliotecário",
      text: "Excelente! Mas antes de abrirmos os portões... Diga-me, como você é conhecido nestas terras?",
      avatar: "/avatars/socrates_v3.webp"
    }
  ];

  const handleStart = () => {
    if (name.trim().length < 2) return;
    dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });
    onStart();
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {step === "hero" && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 bg-amber-900/30 border border-amber-700/40 rounded-full px-6 py-2 mb-8">
                <Database className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-mono tracking-widest uppercase">
                  Aprenda SQL Jogando
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-7xl md:text-8xl font-bold mb-4 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-amber-100">SQL</span>
              <br />
              <span className="text-amber-400">Quest</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-amber-200/80 text-xl mb-12 leading-relaxed max-w-xl mx-auto"
            >
              Embarque em uma jornada épica pelo mundo dos dados. Resolva
              puzzles SQL, desbloqueie mundos e torne-se um mestre das
              consultas.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto"
            >
              {[
                { icon: Scroll, label: `${getAllChallenges().length} Desafios`, sub: `${WORLDS.length} mundos temáticos` },
                { icon: Trophy, label: "21 Conquistas", sub: "Colecione todas" },
                { icon: Zap, label: "SQL Real", sub: "Motor no navegador" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <Icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">{label}</div>
                  <div className="text-amber-400/60 text-xs mt-1">{sub}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => {
                  setIntroIndex(0);
                  setStep("intro");
                }}
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold text-lg px-10 py-6 rounded-xl shadow-lg shadow-amber-900/50 transition-all duration-300 hover:scale-105 hover:shadow-amber-700/50"
              >
                Iniciar Aventura
              </Button>
            </motion.div>
          </motion.div>
        )}

        {step === "intro" && (
          <DialogueCutscene
            npc={introDialogs[introIndex].npc}
            text={introDialogs[introIndex].text}
            avatar={introDialogs[introIndex].avatar}
            onComplete={() => {
              if (introIndex < introDialogs.length - 1) {
                setIntroIndex(introIndex + 1);
              } else {
                setStep("name");
              }
            }}
          />
        )}

        {step === "name" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md w-full"
          >
            <div className="bg-[#1c1917]/90 border border-amber-800/40 rounded-2xl p-10 backdrop-blur-md shadow-2xl shadow-black/60">
              <div className="text-4xl mb-4">⚔️</div>
              <h2
                className="text-3xl font-bold text-amber-100 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Qual é o seu nome,
                <br />
                aventureiro?
              </h2>
              <p className="text-amber-400/70 text-sm mb-8">
                Seu nome aparecerá no hall da fama
              </p>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Digite seu nome..."
                maxLength={20}
                className="bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-600/50 text-center text-lg py-6 mb-6 focus:border-amber-500 focus:ring-amber-500/20"
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("hero");
                    setIntroIndex(0);
                  }}
                  className="flex-1 border-amber-800/50 text-amber-400 hover:bg-amber-950/50 hover:text-amber-300"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={name.trim().length < 2}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold disabled:opacity-40"
                >
                  Começar!
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
