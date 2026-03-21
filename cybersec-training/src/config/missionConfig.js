// missionConfig.js
export const PHASE_CONFIG = {
  phishing: {
    basePoints: 100,
    attemptPenalty: 15,
    maxTimeBonus: 30, // max bonus
    expectedTime: 60 // seconds
  },
  password: {
    basePoints: 120,
    attemptPenalty: 20,
    maxTimeBonus: 40,
    expectedTime: 120
  },
  network: {
    basePoints: 150,
    attemptPenalty: 25,
    maxTimeBonus: 50,
    expectedTime: 180
  }
};