module.exports = (ctx) => {
    const register = () => {
        ctx.helper.uploader.register('cf-imgbed-boyc', {
            handle,
            name: 'cf-imgbed-boyc 自定义文件夹和前缀',
            config: config
        })
    }
    const handle = async function (ctx) {
        let userConfig = ctx.getConfig('picBed.cf-imgbed-boyc')
        if (!userConfig) {
            throw new Error('Can\'t find uploader config')
        }
        let url = userConfig.url
        const paramName = userConfig.paramName
        const jsonPath = userConfig.jsonPath
        const customHeader = userConfig.customHeader
        const customBody = userConfig.customBody
        const uploadFolder = userConfig.uploadFolder
        const imageUrlPrefix = userConfig.imageUrlPrefix

        // 添加 uploadFolder 参数(依据自定义图床 API 接口参数)
        if (uploadFolder) {
            const separator = url.includes('?') ? '&' : '?'
            const folderPath = uploadFolder.startsWith('/') ? uploadFolder : '/' + uploadFolder
            url = `${url}${separator}uploadFolder=${encodeURIComponent(folderPath)}`
        }

        try {
            let imgList = ctx.output
            for (let i in imgList) {
                let image = imgList[i].buffer
                if (!image && imgList[i].base64Image) {
                    image = Buffer.from(imgList[i].base64Image, 'base64')
                }
                const postConfig = postOptions(image, customHeader, customBody, url, paramName, imgList[i].fileName)
                let body = await ctx.Request.request(postConfig)

                delete imgList[i].base64Image
                delete imgList[i].buffer

                // body 格式: [{"src":"/file/ttt/1766739130956_2025-12-25_12-49-02.jpg"}]
                const resData = JSON.parse(body)

                if (!jsonPath) {
                    // 默认是在 data[0].src为获得的图片链接（注意不包含域名，需要自己添加）
                    let imgUrl = resData[0].src
                    imgList[i]['imgUrl'] = imageUrlPrefix + imgUrl
                } else {
                    let imgUrl = resData
                    for (let field of jsonPath.split('.')) {
                        imgUrl = imgUrl[field]
                    }
                    if (imgUrl) {
                        imgList[i]['imgUrl'] = imageUrlPrefix + imgUrl
                    } else {
                        ctx.emit('notification', {
                            title: '返回解析失败',
                            body: '请检查JsonPath设置'
                        })
                    }
                }
            }
        } catch (err) {
            ctx.emit('notification', {
                title: '上传失败',
                body: JSON.stringify(err)
            })
        }
    }

    const postOptions = (image, customHeader, customBody, url, paramName, fileName) => {
        let headers = {
            contentType: 'multipart/form-data',
            'User-Agent': 'PicGo'
        }
        if (customHeader) {
            headers = Object.assign(headers, JSON.parse(customHeader))
        }
        let formData = {}
        if (customBody) {
            formData = Object.assign(formData, JSON.parse(customBody))
        }

        const opts = {
            method: 'POST',
            url: url,
            headers: headers,
            formData: formData
        }
        opts.formData[paramName] = {}
        opts.formData[paramName].value = image
        opts.formData[paramName].options = {
            filename: fileName
        }
        return opts
    }

    const config = ctx => {
        let userConfig = ctx.getConfig('picBed.cf-imgbed-boyc')
        if (!userConfig) {
            userConfig = {}
        }
        return [
            {
                name: 'url',
                type: 'input',
                default: userConfig.url,
                required: true,
                message: 'API地址',
                alias: 'API地址'
            },
            {
                name: 'paramName',
                type: 'input',
                default: userConfig.paramName,
                required: true,
                message: 'POST参数名',
                alias: 'POST参数名'
            },
            {
                name: 'uploadFolder',
                type: 'input',
                default: userConfig.uploadFolder,
                required: false,
                message: '上传文件夹路径(可选)',
                alias: '文件夹路径'
            },
            {
                name: 'imageUrlPrefix',
                type: 'input',
                default: userConfig.imageUrlPrefix,
                required: false,
                message: '自定义图片URL前缀',
                alias: '自定义图片URL前缀'
            },
            {
                name: 'jsonPath',
                type: 'input',
                default: userConfig.jsonPath,
                required: false,
                message: '图片URL JSON路径(eg: data.url)',
                alias: 'JSON路径'
            },
            {
                name: 'customHeader',
                type: 'input',
                default: userConfig.customHeader,
                required: false,
                message: '自定义请求头 标准JSON(eg: {"key":"value"})',
                alias: '自定义请求头'
            },
            {
                name: 'customBody',
                type: 'input',
                default: userConfig.customBody,
                required: false,
                message: '自定义Body 标准JSON(eg: {"key":"value"})',
                alias: '自定义Body'
            }
        ]
    }
    return {
        uploader: 'cf-imgbed-boyc',
        register

    }
}