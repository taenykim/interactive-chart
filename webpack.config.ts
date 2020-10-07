const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: "production", // ['development', 'production']
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js", // chunk시, [name][hash].js
    libraryTarget: "umd", // ['var', 'this', 'commonjs', 'commonjs2', 'amd', 'umd']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["awesome-typescript-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        // use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        use: ["style-loader", "css-loader", "sass-loader"],
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
    // ~.min.js 파일에 .min.js가 있는 경우에만 난독화를 하도록 설정
    minimizer: [
      new TerserJSPlugin({
        include: /\.min\.ts$/,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  devtool: "cheap-eval-source-map", // 데브서버가 디버깅 해줌.
  devServer: {
    contentBase: path.join(__dirname, "./dist"),
    publicPath: "/",
    host: "localhost",
    overlay: true,
    port: 8081,
    stats: "errors-only",
  },
};
