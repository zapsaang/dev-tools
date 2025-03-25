import { createI18n } from 'vue-i18n'
// Load all locale files synchronously using Vite's glob import
const localeModules = import.meta.glob('./locales/*.js', { eager: true })
const messages = Object.keys(localeModules).reduce((acc, path) => {
    const locale = path.match(/\.\/locales\/(.+)\.js$/)[1]
    acc[locale] = localeModules[path].default
    return acc
}, {})

// Create messages object with imported translations


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
    messages
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