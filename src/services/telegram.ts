export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    throw new Error("Telegram.WebApp is not available.");
  }

  return {
    tg,
    user: tg.initDataUnsafe?.user,
  };
}
