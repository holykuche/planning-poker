## Project building
####App config
Before you build the project you should create app config file(s) in project's root catalog.

######Files
`app.config.json` is a config file by default.

`app.config.dev.json` is a config file for development mode.

`app.config.prod.json` is a config file for production mode.

######Example
```json
{
  "db-type": "in-memory",
  "telegram-bot-api-token": "0123456789:AbA9AAAAbAAAbA99AAAbAbbbAAAbb9AbA99",
  "lobby-lifetime-minutes": 60
}
```

######Description
For now as `db-type` parameter available only `"in-memory"` value.
If not specified, `"in-memory"` will be used by default.
 `"in-memory"` means that app data will be saved in RAM. In the future I want to add `mongo` database supporting.
 
 `telegram-bot-api-token` is your telegram bot's api token which you should get via [@BotFather](https://t.me/BotFather) telegram bot.
 
 `lobby-lifetime-minutes` is the time in minutes after which a lobby along with all its data will be destroyed.
 Destroying timer is reset when any member of a lobby make some activity in that lobby.
 
####Commands
1. Install dependencies
   ```
   npm install
   ```
2. Start project in development mode
   ```
   npm start
   ```
3. Build project for production
   ```
   npm run build
   ```
4. Run tests
   ```
   npm run test
   ```
 
 ## Demo
 You may try [the working telegram bot](https://t.me/ScrumPokerByHolyKucheBot).