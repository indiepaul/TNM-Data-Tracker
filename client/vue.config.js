module.exports = {
    devServer: {
        proxy: {
            '^/balances': {
                target: 'http://192.168.1.2:3000/',
                ws: true,
                changeOrigin: true
            }
        }
    },
    productionSourceMap: false,
    transpileDependencies: [
        'resize-detector'
    ]
}