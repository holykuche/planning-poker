const path = require("path");

module.exports = {
    target: "node",
    entry: [
        path.resolve(__dirname, "src", "grpc-client", "impl", "index.ts"),
        path.resolve(__dirname, "src", "migration", "impl", "index.ts"),
        path.resolve(__dirname, "src", "migration", "index.ts"),
        path.resolve(__dirname, "src", "data", "impl", "index.ts"),
        path.resolve(__dirname, "src", "service", "impl", "index.ts"),
        path.resolve(__dirname, "src", "bot", "index.ts"),
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
            path.resolve(__dirname, "src/"),
            path.resolve(__dirname, "node_modules/"),
        ],
        extensions: [ '.js', ".ts" ]
    },
    output: {
        path: path.resolve(__dirname, "dist/"),
    },
};
