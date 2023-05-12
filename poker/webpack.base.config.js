const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const MIGRATION_SCRIPTS_DIR = "migration-scripts";

module.exports = {
    target: "node",
    entry: [
        path.resolve(__dirname, "src", "db-client", "impl", "index.ts"),
        path.resolve(__dirname, "src", "migration", "impl", "index.ts"),
        path.resolve(__dirname, "src", "migration", "index.ts"),
    ],
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
            path.resolve(__dirname, "src"),
            path.resolve(__dirname, "node_modules"),
        ],
        extensions: [ '.js', ".ts" ]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new webpack.DefinePlugin({
            MIGRATION_SCRIPTS_DIR: `"${ MIGRATION_SCRIPTS_DIR }"`,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src", "migration", "scripts"),
                    to: path.resolve(__dirname, "dist", MIGRATION_SCRIPTS_DIR),
                },
                path.resolve(__dirname, "proto"),
            ],
        }),
        new CleanWebpackPlugin(),
    ],
};