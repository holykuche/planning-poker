const path = require("path");

module.exports = {
    target: "node",
    entry: path.resolve(__dirname, "src/index.ts"),
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
