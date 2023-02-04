const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");

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
            return path.resolve(__dirname, "src/data/in-memory-impl/index.ts");
    }
};

const resolveAppConfig = mode => {
    try {
        switch (mode) {
            case "development":
                return require("./app.config.dev");
            case "production":
                return require("./app.config.prod");
            default:
                return require("./app.config");
        }
    } catch (error) {
        return require("./app.config");
    }
};

const baseConfig = appConfig => ({
    target: "node",
    entry: {
        "telegram-bot": [
            path.resolve(__dirname, "src/config/index.ts"),
            resolveDataImplPath(appConfig[ "db-type" ]),
            path.resolve(__dirname, "src/service/impl/index.ts"),
            path.resolve(__dirname, "src/scheduler/impl/index.ts"),
            path.resolve(__dirname, "src/telegram-bot/index.ts"),
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
});

module.exports = (env, args) => {
    const appConfig = resolveAppConfig(args.mode);
    switch (args.mode) {
        case "development":
            return merge(baseConfig(appConfig), webpackDevConfig);
        case "production":
            return merge(baseConfig(appConfig), webpackProdConfig);
        default:
            throw new Error(`Build for ${args.mode} mode is not specified`);
    }
};