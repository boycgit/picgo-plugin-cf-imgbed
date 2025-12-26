# picgo-plugin-cf-imgbed

plugin for [PicGo](https://github.com/Molunerfinn/PicGo)

- 自定义Web图床上传

## 使用

### 图床配置

- url: 图床上传API地址
- paramName: POST参数名
- jsonPath: 图片URL所在返回值的JsonPath(eg:data.url)
- customHeader: 自定义请求头 标准JSON(eg: {"key":"value"})
- customBody: 自定义Body 标准JSON(eg: {"key":"value"})
- uploadFolder: 上传文件夹路径(可选)
- 自定义前缀(可选)

## 致谢

本项目基于[picgo-plugin-web-uploader-cloudflare-imgbed](https://www.npmjs.com/package/picgo-plugin-web-uploader-cloudflare-imgbed)的原始工作进行开发，在此表示感谢。