import { WORLDS } from "@/lib/challenges";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  titleReward?: string;
};

export const ACHIEVEMENTS_ROOT: Achievement[] = [
  { id: "first_query", title: "Primeiro Script", description: "Complete seu primeiro desafio Python", icon: "/achievements/first_query.png", unlocked: false, titleReward: "Aprendiz Aurora" },
  { id: "xp_250_explorer", title: "Primeiros Pontos", description: "Acumule 250 XP", icon: "/achievements/xp_bronze.png", unlocked: false, titleReward: "Visitante do Porto" },
  { id: "xp_500", title: "Codigo em Movimento", description: "Acumule 500 XP", icon: "/achievements/xp_500.png", unlocked: false, titleReward: "Explorador Python" },
  { id: "xp_1000", title: "Rotina de Estudos", description: "Acumule 1.000 XP", icon: "/achievements/xp_1000.png", unlocked: false, titleReward: "Praticante Python" },
  { id: "xp_1500_dedicated", title: "Oficina Ativa", description: "Acumule 1.500 XP", icon: "/achievements/xp_scroll.png", unlocked: false, titleReward: "Construtor de Scripts" },
  { id: "world_vila-variaveis_complete", title: "Vila Organizada", description: "Complete todos os desafios da Vila das Variáveis", icon: "/achievements/village.png", unlocked: false, titleReward: "Técnico da Vila" },
  { id: "world_vale-condicoes_complete", title: "Vale Mapeado", description: "Complete todos os desafios do Vale das Condições", icon: "/achievements/valley.png", unlocked: false, titleReward: "Guia de Decisões" },
  { id: "world_ninho-listas_complete", title: "Ninho Organizado", description: "Complete todos os desafios do Ninho das Listas", icon: "/achievements/nest.png", unlocked: false, titleReward: "Colecionador de Listas" },
  { id: "world_montanha-loops_complete", title: "Montanha Sincronizada", description: "Complete todos os desafios da Montanha dos Loops", icon: "/achievements/mountain.png", unlocked: false, titleReward: "Operador de Ciclos" },
  { id: "world_floresta-funcoes_complete", title: "Floresta Entregue", description: "Complete todos os desafios da Floresta das Funções", icon: "/achievements/forest.png", unlocked: false, titleReward: "Artesão de Funções" },

  { id: "no_hints", title: "Sem Rodinhas", description: "Complete 3 desafios sem usar dicas", icon: "/achievements/no_hints.png", unlocked: false, titleReward: "Autônomo" },
  { id: "hints_used_5", title: "Estudo Ativo", description: "Use dicas em 5 desafios diferentes", icon: "/achievements/hints.png", unlocked: false, titleReward: "Investigador" },
  { id: "first_try_1", title: "Primeira Execução", description: "Complete 3 desafios na primeira tentativa", icon: "/achievements/precision.png", unlocked: false, titleReward: "Precisão Inicial" },
  { id: "perfect_world", title: "Domínio Total", description: "Complete um mundo inteiro sem usar dicas", icon: "/achievements/perfect.png", unlocked: false, titleReward: "Código Puro" },
  { id: "two_worlds_complete", title: "Explorador Duplo", description: "Complete 2 mundos inteiros", icon: "/achievements/double_explorer.png", unlocked: false, titleReward: "Navegador Aurora" },
  { id: "all_worlds_started", title: "Passaporte Carimbado", description: "Complete pelo menos 1 desafio em cada mundo", icon: "/achievements/passport.png", unlocked: false, titleReward: "Viajante Python" },
  { id: "all_complete", title: "Mestre do Protocolo", description: "Complete todos os desafios do jogo", icon: "/achievements/master.png", unlocked: false, titleReward: "Mestre do Protocolo" },
  { id: "streak_3", title: "Hacker Persistente", description: "Mantenha uma sequência de 3 dias ativos", icon: "/achievements/streak.png", unlocked: false, titleReward: "Infiltrador" },
  { id: "streak_7", title: "Fantasma do Sistema", description: "Mantenha uma sequência de 7 dias ativos", icon: "/achievements/ghost.png", unlocked: false, titleReward: "Sombra do Core" },
  { id: "streak_14", title: "Lenda Viva", description: "Mantenha uma sequência de 14 dias ativos", icon: "/achievements/streak_14.png", unlocked: false, titleReward: "Lenda Viva" },
  { id: "streak_30", title: "Operador do Mês", description: "Mantenha uma sequência de 30 dias ativos", icon: "/achievements/streak_30.png", unlocked: false, titleReward: "Viciado no Core" },
  { id: "xp_3000", title: "Transcendente", description: "Acumule 3.000 XP", icon: "/achievements/xp_guru.png", unlocked: false, titleReward: "Transcendente" },
  { id: "xp_5000", title: "Deus Ex Machina", description: "Acumule 5.000 XP", icon: "/achievements/xp_5000.png", unlocked: false, titleReward: "Deus da Máquina" },
  { id: "first_try_10", title: "Código Limpo", description: "Complete 10 desafios na primeira tentativa", icon: "/achievements/precision_master.png", unlocked: false, titleReward: "Sniper" },
  { id: "first_try_20", title: "Máquina Implacável", description: "Complete 20 desafios na primeira tentativa", icon: "/achievements/first_try_20.png", unlocked: false, titleReward: "Ciborgue" },
  { id: "hints_used_1", title: "Curioso", description: "Use sua primeira dica", icon: "/achievements/first_hint.png", unlocked: false, titleReward: "Buscador" },
  { id: "no_hints_10", title: "Processamento Puro", description: "Complete 10 desafios sem usar dicas", icon: "/achievements/no_hints_10.png", unlocked: false, titleReward: "Mente Focada" },
  { id: "four_worlds_complete", title: "Vetor Principal", description: "Complete 4 mundos inteiros", icon: "/achievements/four_worlds.png", unlocked: false, titleReward: "Comandante de Setor" },
  { id: "perfect_3_worlds", title: "Trindade do Código", description: "Complete 3 mundos sem usar dicas", icon: "/achievements/trinity.png", unlocked: false, titleReward: "Arquiteto Neo" },
  { id: "all_perfect_worlds", title: "Nirvana Digital", description: "Complete todos os mundos disponíveis sem usar dicas", icon: "/achievements/nirvana.png", unlocked: false, titleReward: "O Iluminado" },
];

export function getAchievementConditions(state: any) {
  const completed = Object.entries(state.challengeProgress).filter(([, v]: any) => v.completed);
  const completedIds = completed.map(([id]) => id);
  const totalInGame = WORLDS.reduce((acc, world) => acc + world.challenges.length, 0);
  const noHintsCompleted = completed.filter(([, v]: any) => v.hintsUsed === 0);
  const hintsUsedCompleted = completed.filter(([, v]: any) => v.hintsUsed > 0);
  const firstTryCompleted = completed.filter(([, v]: any) => v.attempts === 1);
  const worldsCompleted = WORLDS.filter((world) => {
    const ids = world.challenges.map((c) => c.id);
    return ids.length > 0 && ids.every((id) => completedIds.includes(id));
  }).length;

  const conditions: Record<string, boolean> = {
    first_query: completed.length >= 1,
    xp_250_explorer: state.totalXP >= 250,
    xp_500: state.totalXP >= 500,
    xp_1000: state.totalXP >= 1000,
    xp_1500_dedicated: state.totalXP >= 1500,
    no_hints: noHintsCompleted.length >= 3,
    hints_used_5: hintsUsedCompleted.length >= 5,
    first_try_1: firstTryCompleted.length >= 3,
    two_worlds_complete: worldsCompleted >= 2,
    four_worlds_complete: worldsCompleted >= 4,
    all_complete: completed.length === totalInGame && totalInGame > 0,
    streak_3: state.streak >= 3,
    streak_7: state.streak >= 7,
    streak_14: state.streak >= 14,
    streak_30: state.streak >= 30,
    xp_3000: state.totalXP >= 3000,
    xp_5000: state.totalXP >= 5000,
    first_try_10: firstTryCompleted.length >= 10,
    first_try_20: firstTryCompleted.length >= 20,
    no_hints_10: noHintsCompleted.length >= 10,
    hints_used_1: hintsUsedCompleted.length >= 1,
    all_worlds_started: WORLDS.every((world) =>
      world.challenges.some((c) => completedIds.includes(c.id))
    ),
    perfect_world: WORLDS.some((world) => {
      const ids = world.challenges.map((c) => c.id);
      return ids.length > 0 &&
        ids.every((id) => completedIds.includes(id)) &&
        ids.every((id) => (state.challengeProgress[id]?.hintsUsed ?? 0) === 0);
    }),
    perfect_3_worlds: WORLDS.filter((world) => {
      const ids = world.challenges.map((c) => c.id);
      return ids.length > 0 &&
        ids.every((id) => completedIds.includes(id)) &&
        ids.every((id) => (state.challengeProgress[id]?.hintsUsed ?? 0) === 0);
    }).length >= 3,
    all_perfect_worlds: WORLDS.filter((world) => {
      const ids = world.challenges.map((c) => c.id);
      return ids.length > 0 &&
        ids.every((id) => completedIds.includes(id)) &&
        ids.every((id) => (state.challengeProgress[id]?.hintsUsed ?? 0) === 0);
    }).length === WORLDS.length && WORLDS.length > 0,
  };


  for (const world of WORLDS) {
    const ids = world.challenges.map((c) => c.id);
    conditions[`world_${world.id}_complete`] =
      ids.length > 0 && ids.every((id) => completedIds.includes(id));
  }

  return conditions;
}
