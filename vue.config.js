const path = require('path');
module.exports = {
  // 部署应用包时的基本 URL,用法和 webpack 本身的 output.publicPath 一致
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  // 输出文件目录
  outputDir: process.env.NODE_ENV === 'production' ? 'dist' : 'devdist',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: true,
  // 是否使用包含运行时编译器的 Vue 构建版本
//   runtimeCompiler: false,
  // 生产环境是否生成 sourceMap 文件
  // 生成的 HTML 中的 <link rel="stylesheet"> 和 <script> 标签上启用 Subresource Integrity (SRI)
//   integrity: false,
  // webpack相关配置
  chainWebpack: (config) => {
  },
  configureWebpack: (config) => {
    config.resolve = {//配置解析别名
        extensions: ['.js', '.json', '.vue'], // 自动添加文件名后缀
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@c': path.resolve(__dirname, './src/components')
        }
    }
  },
  productionSourceMap: false,
  // css相关配置
  css: {
    // 是否分离css（插件ExtractTextPlugin）
    extract: false,
    // 是否开启 CSS source maps
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      sass: {
        prependData: `@import "./src/styles/main.scss";`
      }
    },
    // 是否启用 CSS modules for all css / pre-processor files.
    requireModuleExtension: true,
  },
  // 是否使用 thread-loader
  parallel: require('os').cpus().length > 1,
  // PWA 插件相关配置,see https://github.com/vue.js/vue-cli/tree/dev/packages/%40vue/cli-pugin-pwa
  pwa: {},
  // webpack-dev-server 相关配置
  devServer: {
    open: false,// 编译完成是否打开网页
    host: '0.0.0.0',// 指定使用地址，默认localhost，0.0.0.0代表可以被外界访问
    port: 8080,// 访问端口
    https: false,// 编译失败时刷新页面
    hot: true,// 开启热加载
    hotOnly: false,
    // http 代理配置
    proxy: null,
    proxy: {
      '/devApi': {
        target: 'http://www.web-jshtml.cn/productapi', //API服务器的地址http://www.web-jshtml.cn/api
        changeOrigin: true,
        pathRewrite: {
          '^/devApi': ''
        }
      }
    },
    overlay:{
        warnings: true,
        errors: true
    },
    before: app => {}
  },
  // 第三方插件配置
  pluginOptions: {}
}