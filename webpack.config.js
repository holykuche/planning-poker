const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");
const appConfig = require("./app.config.json");

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

module.exports = {
    mode: "development",
    target: "node",
    entry: {
        "telegram-bot": [
            "./src/telegram-bot/index.ts",
            resolveDataImplPath(appConfig[ "db-type" ]),
            "./src/service/impl/index.ts",
        ],
    },
    devtool: 'inline-source-map',
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
        extensions: [ ".ts" ]
    },
    output: {
        path: path.resolve(__dirname, "dist/"),
        filename: "[name].js",
    },
    externals: [ nodeExternals() ],
    plugins: [
        new webpack.DefinePlugin({
            TELEGRAM_BOT_API_TOKEN: JSON.stringify(appConfig[ "telegram-bot-api-token" ]),
            LOBBY_LIFETIME_MS: JSON.stringify(appConfig[ "lobby-lifetime" ]),
        }),
    ],
};