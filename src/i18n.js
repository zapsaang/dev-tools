import { createI18n } from 'vue-i18n'
// Import language files directly with explicit paths to ensure they're bundled properly
// This helps with Cloudflare Pages deployment
import zh from './locales/zh.js'
import en from './locales/en.js'

// Create messages object with imported translations
const messages = {
    zh,
    en
}

// Get saved locale or default to zh
// Use try-catch to handle potential localStorage issues in Cloudflare Pages
let savedLocale = 'zh'
try {
    const storedLocale = localStorage.getItem('locale')
    if (storedLocale && messages[storedLocale]) {
        savedLocale = storedLocale
    }
} catch (e) {
    console.error('Failed to access localStorage:', e)
}

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
    try {
        localStorage.setItem('locale', locale)
    } catch (e) {
        console.error('Failed to save locale to localStorage:', e)
    }
}