const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

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
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src", "migration", "scripts"),
                    to: path.resolve(__dirname, "dist", "migration-scripts"),
                }
            ],
        }),
    ],
};
