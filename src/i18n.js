import { createI18n } from 'vue-i18n'
// Load all locale files synchronously using Vite's glob import
import en from './locales/en.js'
const messages = {
    en: en.default
}

// Create messages object with imported translations


// Get saved locale or default to zh
// Use try-catch to handle potential localStorage issues in Cloudflare Pages
const savedLocale = 'en'

export const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'zh',
    messages
})

// Set the locale value
i18n.global.locale.value = savedLocale

// Function to change locale and save to localStorage