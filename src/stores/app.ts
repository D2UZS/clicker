// import { defineStore } from "pinia";
// import {
//   getOrCreateUser,
//   registerRef,
//   fetchTasks,
//   completeTask,
// } from "@/api/app";
// import { useScoreStore } from "./score";
// import { useTelegram } from "@/services/telegram";

// const { user } = useTelegram();

// export const useAppStore = defineStore("app", {
//   state: () => ({
//     user: {},
//     tasks: [],
//   }),

//   actions: {
//     async init(ref) {
//       this.user = await getOrCreateUser();

//       const score = useScoreStore();

//       score.setScore(this.user.score);

//       if (ref && +ref !== +this.user.telegram) {
//         await registerRef(user?.first_name ?? "Anonymous", ref); // TODO доработать
//       }
//     },

//     async completeTask(task) {
//       await completeTask(this.user, task);
//     },

//     async fetchTasks() {
//       const result = await fetchTasks({ page: 1, limit: 10 }); // TODO доработать лейзилоудинг
//       this.tasks = result.tasks;
//     },
//   },
// });

import { defineStore } from "pinia";
import {
  getOrCreateUser,
  registerRef,
  fetchTasks,
  completeTask,
} from "@/api/app";
import { useScoreStore } from "./score";
import { useTelegram } from "@/services/telegram";
import { ref } from "vue";

// Тип данных для пользователя из базы данных
export interface User {
  id: number;
  telegram: number;
  friends: Record<number, string>;
  tasks: Record<number, boolean>;
  score: number;
}

// Тип данных для задач из базы данных
export interface Task {
  id: number;
  title: string;
  url: string | null;
  amount: number; // Количество очков за выполнение
}

export const useAppStore = defineStore("app", () => {
  const { user: telegramUser } = useTelegram();
  const scoreStore = useScoreStore();

  // Состояние
  const user = ref<User | null>(null);
  const tasks = ref<Task[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Действия
  const init = async (refId?: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Получаем или создаем пользователя
      const currentUser = await getOrCreateUser();
      user.value = currentUser;

      // Обновляем счёт в сторе
      scoreStore.setScore(currentUser.score);

      // Регистрируем реферала, если передан refId
      if (refId && refId !== currentUser.telegram) {
        await registerRef(telegramUser?.first_name ?? "Anonymous", refId);
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to initialize user";
      console.error("Initialization error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const completeTaskAction = async (task: Task): Promise<void> => {
    if (!user.value) {
      throw new Error("User is not initialized");
    }

    try {
      await completeTask(user.value, task);
    } catch (err) {
      console.error("Failed to complete task:", err);
      throw err;
    }
  };

  const fetchTasksAction = async (page: number = 1, limit: number = 10) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await fetchTasks({ page, limit });
      tasks.value = result.tasks;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      console.error("Fetch tasks error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    tasks,
    isLoading,
    error,
    init,
    completeTask: completeTaskAction,
    fetchTasks: fetchTasksAction,
  };
});
