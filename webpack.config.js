module.exports = {
  mode: 'development',
  entry: `${__dirname}/src/js/main.js`,
  output: {
    path: `${__dirname}/dist/js/`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
