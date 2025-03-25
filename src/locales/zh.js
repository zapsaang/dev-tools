export default {
    tabs: {
        baseConverter: '进制转换',
        timestampConverter: '时间戳转换',
        jsonFormatter: 'JSON格式化'
    },
    header: {
        title: '开发者工具集'
    },
    baseConverter: {
        title: '进制转换',
        input: '输入数字',
        fromBase: '源进制',
        toBase: '目标进制',
        result: '转换结果：',
        invalidInput: '无效输入',
        base: '进制'
    },
    timestampConverter: {
        title: '时间戳转换',
        toDate: {
            title: '时间戳转日期',
            input: '输入Unix时间戳',
            currentTime: '当前时间戳'
        },
        toTimestamp: {
            title: '日期转时间戳',
            currentTime: '当前时间'
        },
        invalidTimestamp: '无效时间戳',
        invalidDate: '无效日期',
        units: {
            label: '单位',
            seconds: '秒',
            milliseconds: '毫秒'
        }
    },
    jsonFormatter: {
        title: 'JSON格式化',
        formatOptions: '格式化选项',
        beautify: '美化',
        compress: '压缩',
        escape: '转义',
        input: '输入JSON字符串',
        clear: '清空',
        result: '处理结果：',
        invalidJson: '无效的 JSON 格式'
    },
    languageSelector: {
        label: '语言',
        zh: '中文',
        en: '英文'
    },
    timezone: {
        label: '时区',
        options: {
            UTC: 'UTC (UTC+0)',
            local: '本地时间',
            'Asia/Shanghai': '上海 (UTC+8)',
            'Asia/Tokyo': '东京 (UTC+9)',
            'Europe/London': '伦敦 (UTC+0)',
            'Europe/Paris': '巴黎 (UTC+1)',
            'America/New_York': '纽约 (UTC-5)',
            'America/Los_Angeles': '洛杉矶 (UTC-8)'
        }
    }
}