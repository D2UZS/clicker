import supabase from "@/services/supabase";
import { useTelegram } from "@/services/telegram";
import { useScoreStore } from "@/stores/score";
import type { User, Task } from "@/stores/app";

const { user } = useTelegram();

const MY_ID = user?.id ?? 4252; // ТОDO доработать

interface FetchTasksResult {
  tasks: Task[];
  total: number;
}

// TODO доработать запрос
// Выполняет запрос к базе данных Supabase, чтобы получить все задачи из таблицы tasks
export async function fetchTasks(options?: {
  completed?: boolean;
  sortBy?: "amount" | "title";
  page?: number;
  limit?: number;
}): Promise<FetchTasksResult> {
  let query = supabase.from("tasks").select("*", { count: "exact" });

  // Фильтрация
  if (options?.completed !== undefined) {
    query = query.eq("completed", options.completed);
  }

  // Сортировка
  if (options?.sortBy) {
    query = query.order(options.sortBy, { ascending: true });
  }

  // Пагинация
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return {
    tasks: data as Task[],
    total: count || 0,
  };
}

// 1. Проверяет, существует ли пользователь с определённым Telegram ID (MY_ID) в базе данных.
// 2. Если пользователь не существует, создаёт нового пользователя и возвращает его.
export async function getOrCreateUser(): Promise<User> {
  // Поиск пользователя
  const { data: potentialUser, error: findError } = await supabase
    .from("users")
    .select()
    .eq("telegram", MY_ID);

  if (findError) {
    throw new Error(`Failed to find user: ${findError.message}`);
  }

  // Если пользователь найден, вернуть его
  if (potentialUser?.length) {
    return potentialUser[0] as User;
  }

  // Создание нового пользователя
  const newUser: User = {
    id: 0, // TODO доработать
    telegram: MY_ID,
    friends: {},
    tasks: {},
    score: 0,
  };

  const { data: createdUser, error: insertError } = await supabase
    .from("users")
    .insert(newUser)
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create user: ${insertError.message}`);
  }

  // Вернуть созданного пользователя
  return createdUser as User;
}

// Обновляет значение очков (score) для пользователя с определённым Telegram ID (MY_ID) в таблице users
export async function updateScore(score: number): Promise<void> {
  if (typeof score !== "number") {
    throw new Error("Score must be a number");
  }

  const { error } = await supabase
    .from("users")
    .update({ score })
    .eq("telegram", MY_ID);

  if (error) {
    throw new Error(`Failed to update score: ${error.message}`);
  }
}

// 1. Регистрирует пользователя как реферала (друга) для другого пользователя.
// 2. Начисляет бонусные очки пользователю, который пригласил реферала.
export async function registerRef(
  userName: string,
  refId: number
): Promise<void> {
  // Проверка входных данных
  if (typeof userName !== "string" || typeof refId !== "number") {
    throw new Error(
      "Invalid input: userName must be a string and refId must be a number"
    );
  }

  // Поиск пользователя-реферера
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("telegram", refId);

  if (error || !data || data.length === 0) {
    throw new Error("Referrer user not found");
  }

  const refUser: User = data[0];

  // Обновление данных реферера
  const { error: updateError } = await supabase
    .from("users")
    .update({
      friends: {
        ...refUser.friends,
        [MY_ID]: userName,
      },
      score: refUser.score + 50, // TODO 50 вынести в переменную
    })
    .eq("telegram", refId);

  if (updateError) {
    throw new Error(`Failed to update referrer data: ${updateError.message}`);
  }
}

// 1. Отмечает задачу как выполненную для конкретного пользователя.
// 2. Обновляет счёт пользователя, добавляя количество очков за выполнение задачи.
// 3. Сохраняет изменения в базе данных.
export async function completeTask(user: User, task: Task): Promise<void> {
  // Проверка входных данных
  if (!user || !task || typeof task.amount !== "number") {
    throw new Error(
      "Invalid input: user and task must be provided, and task.amount must be a number"
    );
  }

  // Обновление счёта в хранилище
  const score = useScoreStore();
  const newScore = score.score + task.amount;
  score.setScore(newScore);

  // Обновление данных пользователя в базе данных
  const { error } = await supabase
    .from("users")
    .update({
      tasks: { ...user.tasks, [task.id]: true },
      score: newScore,
    })
    .eq("telegram", MY_ID);

  if (error) {
    throw new Error(`Failed to update user data: ${error.message}`);
  }
}
