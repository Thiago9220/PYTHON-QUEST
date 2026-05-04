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
  { id: "first_query", title: "Primeiro Script", description: "Complete seu primeiro desafio Python", icon: "/achievements/first_query.webp", unlocked: false, titleReward: "Aprendiz Aurora" },
  { id: "xp_250_explorer", title: "Primeiros Pontos", description: "Acumule 250 XP", icon: "/achievements/xp_bronze.webp", unlocked: false, titleReward: "Visitante do Porto" },
  { id: "xp_500", title: "Codigo em Movimento", description: "Acumule 500 XP", icon: "/achievements/xp_500.webp", unlocked: false, titleReward: "Explorador Python" },
  { id: "xp_1000", title: "Rotina de Estudos", description: "Acumule 1.000 XP", icon: "/achievements/xp_1000.webp", unlocked: false, titleReward: "Praticante Python" },
  { id: "xp_1500_dedicated", title: "Oficina Ativa", description: "Acumule 1.500 XP", icon: "/achievements/xp_scroll.webp", unlocked: false, titleReward: "Construtor de Scripts" },

  { id: "world_vila-variaveis_complete", title: "Porto Organizado", description: "Complete todos os desafios do Porto das Variaveis", icon: "/achievements/library.webp", unlocked: false, titleReward: "Tecnico do Porto" },
  { id: "world_vale-condicoes_complete", title: "Jardim Mapeado", description: "Complete todos os desafios do Jardim das Escolhas", icon: "/achievements/world_floresta.webp", unlocked: false, titleReward: "Guia de Decisoes" },
  { id: "world_montanha-loops_complete", title: "Trilhos Sincronizados", description: "Complete todos os desafios dos Trilhos da Repeticao", icon: "/achievements/world_mercado.webp", unlocked: false, titleReward: "Operador de Loops" },
  { id: "world_floresta-funcoes_complete", title: "Oficina Entregue", description: "Complete todos os desafios da Oficina das Funcoes", icon: "/achievements/optimizer_high.webp", unlocked: false, titleReward: "Artesao de Funcoes" },

  { id: "no_hints", title: "Sem Rodinhas", description: "Complete 3 desafios sem usar dicas", icon: "/achievements/no_hints.webp", unlocked: false, titleReward: "Autonomo" },
  { id: "hints_used_5", title: "Estudo Ativo", description: "Use dicas em 5 desafios diferentes", icon: "/achievements/hint_magnifier.webp", unlocked: false, titleReward: "Investigador" },
  { id: "first_try_1", title: "Primeira Execucao", description: "Complete 3 desafios na primeira tentativa", icon: "/achievements/intuition.webp", unlocked: false, titleReward: "Precisao Inicial" },
  { id: "perfect_world", title: "Mundo Limpo", description: "Complete um mundo inteiro sem usar dicas", icon: "/achievements/perfect_diamond.webp", unlocked: false, titleReward: "Codigo Claro" },
  { id: "two_worlds_complete", title: "Duas Ilhas", description: "Complete 2 mundos inteiros", icon: "/achievements/double_conqueror.webp", unlocked: false, titleReward: "Navegador Aurora" },
  { id: "four_worlds_complete", title: "Arquipelago Completo", description: "Complete os 4 mundos atuais", icon: "/achievements/realm_master.webp", unlocked: false, titleReward: "Mestre do Arquipelago" },
  { id: "all_worlds_started", title: "Passaporte Carimbado", description: "Complete pelo menos 1 desafio em cada mundo", icon: "/achievements/world_map_icon.webp", unlocked: false, titleReward: "Viajante Python" },
  { id: "all_complete", title: "Python Navigator", description: "Complete todos os desafios do jogo", icon: "/achievements/grandmaster.webp", unlocked: false, titleReward: "Navegador Python" },
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
    all_worlds_started: WORLDS.every((world) =>
      world.challenges.some((c) => completedIds.includes(c.id))
    ),
    perfect_world: WORLDS.some((world) => {
      const ids = world.challenges.map((c) => c.id);
      return ids.length > 0 &&
        ids.every((id) => completedIds.includes(id)) &&
        ids.every((id) => (state.challengeProgress[id]?.hintsUsed ?? 0) === 0);
    }),
  };

  for (const world of WORLDS) {
    const ids = world.challenges.map((c) => c.id);
    conditions[`world_${world.id}_complete`] =
      ids.length > 0 && ids.every((id) => completedIds.includes(id));
  }

  return conditions;
}
