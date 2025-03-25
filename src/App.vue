<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import BaseConverter from './components/BaseConverter.vue'
import TimestampConverter from './components/TimestampConverter.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import { setLocale } from './i18n'

const { t, locale } = useI18n()
const activeTab = ref('base')

const toggleLanguage = () => {
  const newLocale = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(newLocale)
}

const tabs = computed(() => [
  { id: 'base', label: t('tabs.baseConverter') },
  { id: 'timestamp', label: t('tabs.timestampConverter') },
  { id: 'json', label: t('tabs.jsonFormatter') }
])
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="logo">
        <h1>{{ t('header.title') }}</h1>
        <div class="language-selector">
          <span>{{ t('languageSelector.label') }}:</span>
          <button @click="toggleLanguage" class="language-button">
            {{ t(`languageSelector.${locale}`) }}
          </button>
        </div>
      </div>
      <nav class="tool-nav">
        <button v-for="tab in tabs" :key="tab.id" :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id">
          {{ tab.label }}
        </button>
      </nav>
    </aside>
    <main class="main-content">
      <div class="tool-container">
        <BaseConverter v-show="activeTab === 'base'" />
        <TimestampConverter v-show="activeTab === 'timestamp'" />
        <JsonFormatter v-show="activeTab === 'json'" />
      </div>
    </main>
  </div>
</template>

<style>
:root {
  --primary-color: #409eff;
  --background-color: #f5f7fa;
  --text-color: #2c3e50;
}

body {
  margin: 0;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  background-color: #f0f2f5;
  width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sidebar {
  width: 260px;
  min-width: 260px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-y: auto;
}

.logo {
  padding: 0 20px;
  margin-bottom: 30px;
}

.logo h1 {
  color: var(--text-color);
  font-size: 1.5em;
  margin: 0 0 15px 0;
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  white-space: nowrap;
  min-width: 200px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  min-height: 40px;
}

.language-selector span {
  color: var(--text-color);
  font-size: 0.9em;
  white-space: nowrap;
  min-width: 70px;
}

.language-button {
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
  min-width: 100px;
  white-space: nowrap;
  min-height: 36px;
}

.language-button:hover {
  background-color: #66b1ff;
  transform: translateY(-1px);
}

.tool-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  font-size: 0.95em;
  text-align: left;
  width: 100%;
  min-height: 48px;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: #f5f7fa;
  color: var(--primary-color);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: white;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  min-width: 0;
  width: calc(100% - 260px);
}

.tool-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-in-out;
  width: 100%;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 预留广告位样式 */
.ad-container {
  grid-column: 1 / -1;
  min-height: 90px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>
