// 参照文档：https://cli.vuejs.org/zh/config/#vue-config-js
module.exports = {
    // 部署生产环境和开发环境下的URL：可对当前环境进行区分，
    // baseUrl 从 Vue CLI 3.3 起已弃用，要使用publicPath
    // baseUrl: process.env.NODE_ENV === 'production' ? './' : '/',
    publicPath: "./",
    // 输出文件目录：在npm run build时，生成文件的目录名称 
    outputDir: 'dist',
    // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录 
    assetsDir: "assets",
    // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度 
    productionSourceMap: true,
    // 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存，你可以通过将这个选项设为 false 来关闭文件名哈希。(false的时候就是让原来的文件名不改变)
    filenameHashing: true,
    // 代码保存时进行eslint检测
    lintOnSave: false,

    devServer: {
        // 自动打开浏览器
        open: false,

        port: 8080,

        https: false,

        // 热加载
        hotOnly: true,
        // 使用代理
        proxy: {
            '/api': {
                target: process.env.VUE_APP_SERVE_URL,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'
                }
            },
        },
    },

    configureWebpack: {
        externals: {
            'vue': 'Vue',
            'vue-router': 'VueRouter',
            "axios": 'axios',
        },
    }
};