const webpack = require("webpack");

module.exports = {
    mode: "production",
    output: {
        filename: "[name].prod.js",
    },
    plugins: [
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
    ],
};
