import { createI18n } from 'vue-i18n'
import zh from './locales/zh.js'
import en from './locales/en.js'

// Get saved locale or default to zh
const savedLocale = localStorage.getItem('locale') || 'zh'

export const i18n = createI18n({
    legacy: true,
    locale: savedLocale,
    fallbackLocale: 'zh',
    messages: {
        zh,
        en
    }
})

// Set the locale value
i18n.global.locale.value = savedLocale

// Function to change locale and save to localStorage
export function setLocale(locale) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
}