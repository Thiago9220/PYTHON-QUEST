import type { AppLanguage } from "@/contexts/LanguageContext";
import { ACHIEVEMENTS_ROOT, type Achievement } from "@/lib/achievements";
import type { BossChallenge, Challenge, World } from "@/lib/types";
import {
  ACHIEVEMENTS_EN,
  BOSSES_EN,
  LEVEL_TITLES_EN,
  WORLD_TAGS_EN,
  WORLDS_EN,
  type LocalizedChallengeFields,
} from "./worlds_en";
import { CHALLENGES_EN_1A } from "./challenges_en_1a";
import { CHALLENGES_EN_1B } from "./challenges_en_1b";
import { CHALLENGES_EN_2A } from "./challenges_en_2a";
import { CHALLENGES_EN_2B } from "./challenges_en_2b";
import { CHALLENGES_EN_DS1A } from "./challenges_en_ds1a";
import { CHALLENGES_EN_DS1B } from "./challenges_en_ds1b";
import { CHALLENGES_EN_DS2A } from "./challenges_en_ds2a";
import { CHALLENGES_EN_DS2B } from "./challenges_en_ds2b";

export const CHALLENGES_EN: Record<string, LocalizedChallengeFields> = {
  ...CHALLENGES_EN_1A,
  ...CHALLENGES_EN_1B,
  ...CHALLENGES_EN_2A,
  ...CHALLENGES_EN_2B,
  ...CHALLENGES_EN_DS1A,
  ...CHALLENGES_EN_DS1B,
  ...CHALLENGES_EN_DS2A,
  ...CHALLENGES_EN_DS2B,
};

/** Returns a challenge localized to the active language while keeping Python validation fields untouched. */
export function getLocalizedChallenge(challenge: Challenge, lang: AppLanguage): Challenge {
  if (lang !== "en") return challenge;
  const tr = CHALLENGES_EN[challenge.id];
  if (!tr) return challenge;

  return {
    ...challenge,
    title: tr.title,
    description: tr.description,
    narrative: tr.narrative,
    concept: tr.concept,
    conceptExplanation: tr.conceptExplanation,
    hints: challenge.hints.map((hint, idx) => ({
      ...hint,
      text: tr.hints[idx] ?? hint.text,
    })),
    ...(challenge.introStory !== undefined
      ? { introStory: tr.introStory ?? challenge.introStory }
      : {}),
    ...(challenge.successStory !== undefined
      ? { successStory: tr.successStory ?? challenge.successStory }
      : {}),
  };
}

/** Returns a boss challenge localized to the active language while keeping act check/setup code intact. */
export function getLocalizedBoss(boss: BossChallenge, lang: AppLanguage): BossChallenge {
  if (lang !== "en") return boss;
  const tr = BOSSES_EN[boss.id];
  if (!tr) return boss;

  return {
    ...boss,
    title: tr.title,
    codename: tr.codename,
    intro: tr.intro,
    finalStory: tr.finalStory,
    acts: boss.acts.map((act, actIdx) => {
      const trAct = tr.acts[actIdx];
      if (!trAct) return act;
      return {
        ...act,
        title: trAct.title,
        narrative: trAct.narrative,
        objectives: act.objectives.map((obj, objIdx) => ({
          ...obj,
          label: trAct.objectives[objIdx] ?? obj.label,
        })),
        hints: act.hints.map((hint, hintIdx) => ({
          ...hint,
          text: trAct.hints[hintIdx] ?? hint.text,
        })),
      };
    }),
  };
}

/** Returns a world with localized metadata, challenges, and boss encounter. */
export function getLocalizedWorld(world: World, lang: AppLanguage): World {
  if (lang !== "en") return world;
  const tr = WORLDS_EN[world.id];

  return {
    ...world,
    ...(tr ? { title: tr.title, subtitle: tr.subtitle, lore: tr.lore } : {}),
    challenges: world.challenges.map((c) => getLocalizedChallenge(c, lang)),
    ...(world.boss ? { boss: getLocalizedBoss(world.boss, lang) } : {}),
  };
}

/** Returns an achievement localized to the active language. */
export function getLocalizedAchievement(achievement: Achievement, lang: AppLanguage): Achievement {
  if (lang !== "en") return achievement;
  const tr = ACHIEVEMENTS_EN[achievement.id];
  if (!tr) return achievement;

  return {
    ...achievement,
    title: tr.title,
    description: tr.description,
    ...(tr.titleReward !== undefined ? { titleReward: tr.titleReward } : {}),
  };
}

/** Translates an unlocked title reward string stored in PT-BR state when running in EN-US. */
export function getLocalizedTitleReward(
  reward: string | null | undefined,
  lang: AppLanguage
): string | null {
  if (!reward) return null;
  if (lang !== "en") return reward;
  const match = ACHIEVEMENTS_ROOT.find((a) => a.titleReward === reward);
  if (!match) return reward;
  return ACHIEVEMENTS_EN[match.id]?.titleReward ?? reward;
}

/** Translates a player level title returned from getPlayerLevel() when running in EN-US. */
export function getLocalizedLevelTitle(title: string, lang: AppLanguage): string {
  if (lang !== "en") return title;
  return LEVEL_TITLES_EN[title] ?? title;
}

/** Returns a localized world tag pill label. */
export function getLocalizedWorldTag(
  worldId: string,
  fallback: string,
  lang: AppLanguage
): string {
  if (lang !== "en") return fallback;
  return WORLD_TAGS_EN[worldId] ?? fallback;
}

