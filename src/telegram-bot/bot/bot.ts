import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, { polling: true });

bot.setMyCommands(
    [
        { command: "/help", description: "Show help message" },
        { command: "/reset", description: "Reset user state" },
    ])
    .catch(console.log);

export default bot;