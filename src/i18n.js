import { createI18n } from 'vue-i18n'
import zh from './locales/zh.js'
import en from './locales/en.js'

export const i18n = createI18n({
    legacy: false,
    locale: navigator.language.split('-')[0],
    fallbackLocale: 'en',
    messages: {
        zh,
        en
    }
})