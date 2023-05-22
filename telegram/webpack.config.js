const { merge } = require("webpack-merge");

const webpackBaseConfig = require("./webpack.base.config");
const webpackDevConfig = require("./webpack.dev.config");
const webpackProdConfig = require("./webpack.prod.config");

module.exports = (env, args) => {
    switch (args.mode) {
        case "development":
            return merge(webpackBaseConfig, webpackDevConfig);
        case "production":
            return merge(webpackBaseConfig, webpackProdConfig);
        default:
            throw new Error(`Build for ${args.mode} mode is not specified`);
    }
};
