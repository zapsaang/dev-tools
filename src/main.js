import { createApp } from 'vue'
import './styles/common.css'
import App from './App.vue'
import { i18n } from './i18n'

// Remove i18n import
// Remove createI18n initialization
// Remove app.use(i18n)
const app = createApp(App)
app.use(i18n)
app.mount('#app')
