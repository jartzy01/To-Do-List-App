// webpack.config.js
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: "./app/scripts/main.js",
    card: "./app/scripts/card.js",
    edit_card: "./app/scripts/edit_card.js",
    list: "./app/scripts/list.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles/[name].css",
    }),
    new HtmlWebpackPlugin({
      template: "app/index.html",
      chunks: ["main"],
      filename: "index.html",
    }),
    new HtmlWebpackPlugin({
      template: "app/list.html",
      chunks: ["list"],
      filename: "list.html",
    }),
    new HtmlWebpackPlugin({
      template: "app/card.html",
      chunks: ["card"],
      filename: "card.html",
    }),
    new HtmlWebpackPlugin({
      template: "app/edit_card.html",
      chunks: ["edit_card"],
      filename: "edit_card.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 8080,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
};
