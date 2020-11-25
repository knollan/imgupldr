module.exports = {
  mode: 'development',
  //watch: true,
  entry: './src/app.tsx',
  output: {
    filename: 'imgupldr.js',
    path: __dirname + '/build'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  //devtool: 'source-map',
  module: {
    rules: [
      { test: /\.scss$/, use: [ 'style-loader', 'css-loader', 'sass-loader' ] },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader'] },
      { test: /\.tsx?$/, loader: 'babel-loader' },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      //{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  }
};
