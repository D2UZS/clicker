import { defineStore } from "pinia";

const baseLevelScore = 25;

// [25, 50, 100 ...]
const levels = new Array(15)
  .fill(0)
  .map((_, i) => baseLevelScore * Math.pow(2, i));

// [25, 75, 175 ...]
// TODO переписать
const levelsScores = levels.map((_, level) => {
  let sum = 0;

  for (let [index, value] of levels.entries()) {
    if (index >= level) {
      return sum + value;
    }

    sum += value;
  }

  return sum;
});

function computeLevelByScore(score) {
  for (let [index, value] of levelsScores.entries()) {
    if (score <= value) {
      return {
        level: index,
        value: levels[index],
      };
    }
  }
}

// TODO переписать
export const useScoreStore = defineStore("score", {
  state: () => ({
    score: 42,
  }),
  getters: {
    level: (state) => computeLevelByScore(state.score),
    currentScore(state) {
      if (this.level.level === 0) {
        return state.score;
      }

      return state.score - levelsScores[this.level.level - 1];
    },
  },
  actions: {
    add(score = 1) {
      this.score += score;
    },
    setScore(score) {
      this.score = score;
    },
  },
});
