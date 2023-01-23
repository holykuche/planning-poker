const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");

const appConfig = require("./app.config");
const webpackDevConfig = require("./webpack.dev.config");
const webpackProdConfig = require("./webpack.prod.config");

const resolveDataImplPath = dbType => {
    switch (dbType) {
        case "mongo":
        case "postgres":
        case "oracle":
            throw new Error(`DB "${dbType}" doesn't support`);
        case "in-memory":
        default:
            return "./src/data/in-memory-impl/index.ts";
    }
};

const baseConfig = {
    target: "node",
    entry: {
        "telegram-bot": [
            "./src/telegram-bot/index.ts",
            resolveDataImplPath(appConfig[ "db-type" ]),
            "./src/service/impl/index.ts",
        ],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src/"),
            path.resolve(__dirname, "node_modules/"),
        ],
        extensions: [ '.js', ".ts" ]
    },
    output: {
        path: path.resolve(__dirname, "dist/"),
    },
    plugins: [
        new webpack.DefinePlugin({
            TELEGRAM_BOT_API_TOKEN: JSON.stringify(appConfig[ "telegram-bot-api-token" ]),
            LOBBY_LIFETIME_MS: JSON.stringify(appConfig[ "lobby-lifetime-minutes" ] * 60000),
        }),
    ],
};

module.exports = (env, args) => {
    switch (args.mode) {
        case "development":
            return merge(baseConfig, webpackDevConfig);
        case "production":
            return merge(baseConfig, webpackProdConfig);
        default:
            throw new Error(`Build for ${args.mode} mode is not specified`);
    }
};