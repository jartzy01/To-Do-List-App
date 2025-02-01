const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: "./public/scripts/main.js",
    card: "./public/scripts/card.js",
    edit_card: "./public/scripts/edit_card.js",
    list: "./public/scripts/list.js",
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
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                quietDeps: true,
              },
            },
          },
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
      template: "public/index.html",
      chunks: ["main"],
      filename: "index.html",
      favicon: "public/images/favicon-16x16.png",
    }),
    new HtmlWebpackPlugin({
      template: "public/list.html",
      chunks: ["list"],
      filename: "list.html",
      favicon: "public/images/favicon-16x16.png",
    }),
    new HtmlWebpackPlugin({
      template: "public/card.html",
      chunks: ["card"],
      filename: "card.html",
    }),
    new HtmlWebpackPlugin({
      template: "public/edit_card.html",
      chunks: ["edit_card"],
      filename: "edit_card.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 8080, // ✅ Webpack Dev Server will run on port 3000
    hot: true,
    open: true, // Auto open browser
    historyApiFallback: true,
  },
};
