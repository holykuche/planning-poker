## Project building
Before you build project you should create `app.config.json` in project's root catalog:
```json
{
  "db-type": "in-memory",
  "telegram-bot-api-token": "your telegram bot's api token",
  "lobby-lifetime-minutes": 60
}
```

For now as `db-type` parameter available only `"in-memory"` value.
If not specified, `"in-memory"` will be used by default.
 `"in-memory"` means that app data will be saved in RAM. In the future I want to add `mongo` database supporting.
 
 `telegram-bot-api-token"` is your telegram bot's api token which you should get via [@BotFather](https://t.me/BotFather) telegram bot.
 
 `lobby-lifetime-minutes` is the time in minutes after which a lobby along with all its data will be destroyed.
 Destroying timer is reset when any member of a lobby make some activity in that lobby.