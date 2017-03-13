const config = {
    entry: './public/index.js',
    output: {
        path: './public/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                presets: ['react']
            }
        }]
    }
};

module.exports = config;
