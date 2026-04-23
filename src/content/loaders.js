import { applyLegacyData } from './legacy-loader.js';

export const PRIMARY_DATA_FILE = './data/vietnamese_im1_curriculum_seed.json';
export const LEGACY_DATA_FILES = [
  './data/vietnamese_a1_lessons_1_6_starter.json',
  './vietnamese_a1_lessons_1_6_starter.json',
];

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function applySeedData(state, seed, legacyCurriculum) {
  state.data = seed;
  state.curriculum = seed.stages || legacyCurriculum;
  state.stageDecks = seed.stageDecks || {};
  state.cards = seed.cards || [];
  state.opicTopics = seed.opicTopics || [];
}

export async function loadLearningData(state, legacyCurriculum) {
  try {
    const primary = await fetchJson(PRIMARY_DATA_FILE);
    applySeedData(state, primary, legacyCurriculum);
    state.dataSource = 'seed';
    return;
  } catch {
    // fallback below
  }

  for (const file of LEGACY_DATA_FILES) {
    try {
      const legacy = await fetchJson(file);
      applyLegacyData(state, legacy, legacyCurriculum);
      state.dataSource = `legacy:${file}`;
      return;
    } catch {
      // try next fallback
    }
  }

  throw new Error('No learning dataset available');
}
