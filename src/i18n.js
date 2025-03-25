import { createI18n } from 'vue-i18n'
import zh from './locales/zh.js'
import en from './locales/en.js'

const savedLocale = localStorage.getItem('locale') || 'zh'

export const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'zh',
    messages: {
        zh,
        en
    }
})

i18n.global.locale.value = savedLocale

export function setLocale(locale) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
}