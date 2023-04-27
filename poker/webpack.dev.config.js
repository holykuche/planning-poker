const nodeExternals = require("webpack-node-externals");

module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    externals: [ nodeExternals() ],
    output: {
        filename: "[name].dev.js",
    },
};