import { createApp } from 'vue'
import './styles/common.css'
import App from './App.vue'


// Remove i18n import
// Remove createI18n initialization
// Remove app.use(i18n)
const app = createApp(App)
app.mount('#app')
