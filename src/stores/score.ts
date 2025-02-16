// import { defineStore } from "pinia";
// import { debounce } from "remeda";
// import { updateScore } from "@/api/app";

// const debounceUpdateScore = debounce(updateScore, { waitMs: 500 });

// const baseLevelScore = 25;

// // [25, 50, 100 ...]
// const levels = new Array(15)
//   .fill(0)
//   .map((_, i) => baseLevelScore * Math.pow(2, i));

// // [25, 75, 175 ...]
// const levelsScores = levels.map((_, level) => {
//   let sum = 0;

//   for (let [index, value] of levels.entries()) {
//     if (index >= level) {
//       return sum + value;
//     }

//     sum += value;
//   }

//   return sum;
// });

// function computeLevelByScore(score) {
//   for (let [index, value] of levelsScores.entries()) {
//     if (score <= value) {
//       return {
//         level: index,
//         value: levels[index],
//       };
//     }
//   }
// }

// // TODO переписать
// export const useScoreStore = defineStore("score", {
//   state: () => ({
//     score: 0,
//   }),
//   getters: {
//     level: (state) => computeLevelByScore(state.score),
//     currentScore(state) {
//       if (this.level.level === 0) {
//         return state.score;
//       }

//       return state.score - levelsScores[this.level.level - 1];
//     },
//   },
//   actions: {
//     add(score = 1) {
//       this.score += score;

//       debounceUpdateScore(this.score);
//     },
//     setScore(score) {
//       this.score = score;
//     },
//   },
// });

import { defineStore } from "pinia";
import { debounce } from "remeda";
import { updateScore } from "@/api/app";
import { ref, computed } from "vue";

// Типы
interface Level {
  level: number;
  value: number;
}

interface ScoreStoreState {
  score: number;
}

// Константы
const BASE_LEVEL_SCORE = 25;
const LEVELS_COUNT = 15;

// Вычисление уровней
const levels = new Array(LEVELS_COUNT)
  .fill(0)
  .map((_, i) => BASE_LEVEL_SCORE * Math.pow(2, i));

// Вычисление cumulative scores для уровней
const levelsScores = levels.map((_, level) => {
  return levels.slice(0, level + 1).reduce((sum, value) => sum + value, 0);
});

// Функция для вычисления уровня по количеству очков
function computeLevelByScore(score: number): Level {
  for (let [index, value] of levelsScores.entries()) {
    if (score <= value) {
      return {
        level: index,
        value: levels[index],
      };
    }
  }
  // Если очков больше, чем максимальный уровень, возвращаем последний уровень
  return {
    level: levels.length - 1,
    value: levels[levels.length - 1],
  };
}

// Дебаунс для обновления счёта
const debounceUpdateScore = debounce(updateScore, { waitMs: 500 });

export const useScoreStore = defineStore("score", () => {
  // Состояние
  const score = ref<number>(0);

  // Геттеры
  const level = computed(() => computeLevelByScore(score.value));
  const currentScore = computed(() => {
    if (level.value.level === 0) {
      return score.value;
    }
    return score.value - levelsScores[level.value.level - 1];
  });

  // Действия
  function add(scoreToAdd: number = 1): void {
    score.value += scoreToAdd;
    debounceUpdateScore.call(score.value);
  }

  function setScore(newScore: number): void {
    score.value = newScore;
  }

  return {
    score,
    level,
    currentScore,
    add,
    setScore,
  };
});
