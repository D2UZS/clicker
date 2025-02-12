import { Telegraf, Markup } from "telegraf";

const token = "7914697998:AAF6_1Q4-lt2KtILytwVzrdhnIuGrEj-k_k";
const webAppUrl = `https://clicker-bbe5a.web.app`;

const bot = new Telegraf(token);

bot.command("start", (ctx) => {
  ctx.reply(
    `Привет, ${ctx.from.first_name}!`,
    Markup.inlineKeyboard([
      Markup.button.webApp(
        "👉 Перейти на сайт",
        `${webAppUrl}?ref=${ctx.payload}`
      ),
    ])
  );
});

bot.launch();
