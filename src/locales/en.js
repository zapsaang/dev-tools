export default {
    tabs: {
        baseConverter: 'Base Converter',
        timestampConverter: 'Timestamp Converter',
        jsonFormatter: 'JSON Formatter'
    },
    header: {
        title: 'Developer Tools'
    },
    baseConverter: {
        title: 'Base Converter',
        input: 'Enter Number',
        fromBase: 'From Base',
        toBase: 'To Base',
        result: 'Result:',
        invalidInput: 'Invalid Input',
        base: 'Base'
    },
    timestampConverter: {
        title: 'Timestamp Converter',
        toDate: {
            title: 'Timestamp to Date',
            input: 'Enter Unix Timestamp',
            currentTime: 'Current Timestamp'
        },
        toTimestamp: {
            title: 'Date to Timestamp',
            currentTime: 'Current Time'
        },
        invalidTimestamp: 'Invalid Timestamp',
        invalidDate: 'Invalid Date',
        units: {
            label: 'Unit',
            seconds: 'Seconds',
            milliseconds: 'Milliseconds'
        }
    },
    jsonFormatter: {
        title: 'JSON Formatter',
        formatOptions: 'Format Options',
        beautify: 'Beautify',
        compress: 'Compress',
        escape: 'Escape',
        input: 'Enter JSON String',
        clear: 'Clear',
        result: 'Result:',
        invalidJson: 'Invalid JSON Format'
    },
    languageSelector: {
        label: 'Language',
        zh: 'Chinese',
        en: 'English'
    },
    timezone: {
        label: 'Timezone',
        options: {
            UTC: 'UTC (UTC+0)',
            local: 'Local Time',
            'Asia/Shanghai': 'Shanghai (UTC+8)',
            'Asia/Tokyo': 'Tokyo (UTC+9)',
            'Europe/London': 'London (UTC+0)',
            'Europe/Paris': 'Paris (UTC+1)',
            'America/New_York': 'New York (UTC-5)',
            'America/Los_Angeles': 'Los Angeles (UTC-8)'
        }
    }
}