<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BaseConverter from './components/BaseConverter.vue'
import TimestampConverter from './components/TimestampConverter.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import Base64Converter from './components/Base64Converter.vue'
import CompressionTool from './components/CompressionTool.vue'

const activeTab = ref('base')
const isSidebarOpen = ref(window.innerWidth > 768)
const isPortrait = ref(window.innerWidth <= 768)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  document.body.style.overflow = isPortrait.value && isSidebarOpen.value ? 'hidden' : ''
}

const handleResize = () => {
  isPortrait.value = window.innerWidth <= 768
  if (!isPortrait.value) {
    isSidebarOpen.value = true
  } else {
    isSidebarOpen.value = false
  }
}

const handleTabChange = (tabId) => {
  activeTab.value = tabId
  if (isPortrait.value) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const tabs = [
  { id: 'base', label: 'Base Converter' },
  { id: 'timestamp', label: 'Timestamp Converter' },
  { id: 'json', label: 'JSON Formatter' },
  { id: 'base64', label: 'Base64 Converter' },
  { id: 'compression', label: 'Compression Tool' }
]
</script>

<template>
  <div class="app-container">
    <header class="header">
      <button class="hamburger-btn" @click="toggleSidebar" :class="{ 'is-open': isSidebarOpen }">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" v-if="!isSidebarOpen"/>
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" v-else/>
        </svg>
      </button>
      <h1 class="header-title">Developer Tools</h1>
    </header>
    <div class="content-wrapper">
      <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
        <nav class="tool-nav">
          <button v-for="tab in tabs" :key="tab.id" :class="['nav-item', { active: activeTab === tab.id }]"
            @click="handleTabChange(tab.id)">
            {{ tab.label }}
          </button>
        </nav>
      </aside>
      <main class="main-content">
        <div class="tool-container">
          <div v-if="isPortrait && isSidebarOpen" class="overlay" @click="toggleSidebar"></div>
        <BaseConverter v-show="activeTab === 'base'" />
        <TimestampConverter v-show="activeTab === 'timestamp'" />
        <JsonFormatter v-show="activeTab === 'json'" />
        <Base64Converter v-show="activeTab === 'base64'" />
        <CompressionTool v-show="activeTab === 'compression'" />
              </div>
      </main>
    </div>
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
  flex-direction: column;
  background-color: #f0f2f5;
  width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
}

.hamburger-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  transition: transform 0.3s ease;
}

.hamburger-btn.is-open {
  transform: rotate(180deg);
}

.header-title {
  font-size: 1.2em;
  margin: 0;
  color: var(--text-color);
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.sidebar {
  --sidebar-width: 260px;
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-y: auto;
  height: 100%;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    z-index: 100;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .sidebar-open ~ .main-content .overlay {
    opacity: 1;
    visibility: visible;
  }
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
  width: 100%;
  transition: margin-left 0.3s ease;
  margin-left: 0;
}

@media (min-width: 769px) {
  .sidebar {
    position: fixed;
    height: calc(100vh - 60px);
    transform: translateX(0);
    transition: transform 0.3s ease;
    z-index: 10;
  }

  .main-content {
    margin-left: var(--sidebar-width, 260px);
    transition: all 0.3s ease;
    width: calc(100% - var(--sidebar-width, 260px));
    min-height: calc(100vh - 60px);
    position: relative;
  }

  .sidebar:not(.sidebar-open) {
    transform: translateX(-100%);
  }

  .sidebar:not(.sidebar-open) ~ .main-content {
    margin-left: 0;
    width: 100%;
    max-width: 100vw;
    position: relative;
    left: 0;
    right: 0;
    padding-left: 0;
    transform: translateX(0);
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  .tool-container {
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
    max-width: 100vw;
    overflow-x: hidden;
  }
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

/* Reserved ad slot style */
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
