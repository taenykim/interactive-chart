const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");

module.exports = [
  {
    mode: "production", // ['development', 'production']
    entry: {
      "index.min": "./src/index.ts",
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].js", // chunk시, [name][hash].js
      libraryTarget: "commonjs2", // ['var', 'this', 'commonjs', 'commonjs2', 'amd', 'umd']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ["awesome-typescript-loader"],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],

      alias: {
        "@src": path.join(__dirname, "src"),
      },
    },
    externals: {},
    target: "web", // ['web', 'webworker', 'node', async-node', 'electron']
    plugins: [],
    optimization: {
      minimize: true,
      minimizer: [new TerserJSPlugin()],
    },
    devtool: "cheap-eval-source-map",
    devServer: {
      contentBase: path.join(__dirname, "./dist"),
      publicPath: "/",
      host: "localhost",
      overlay: true,
      port: 8081,
      stats: "errors-only",
    },
  },
  {
    mode: "production", // ['development', 'production']
    entry: {
      "index.umd": "./src/index.ts",
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].js", // chunk시, [name][hash].js
      libraryTarget: "umd", // ['var', 'this', 'commonjs', 'commonjs2', 'amd', 'umd']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ["awesome-typescript-loader"],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],

      alias: {
        "@src": path.join(__dirname, "src"),
      },
    },
    externals: {},
    target: "web", // ['web', 'webworker', 'node', async-node', 'electron']
    plugins: [],
    optimization: {
      minimize: true,
      minimizer: [new TerserJSPlugin()],
    },
  },
];
