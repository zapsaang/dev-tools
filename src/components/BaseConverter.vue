<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { copyToClipboard } from '../utils/clipboard.js'

const { t } = useI18n()
const inputNumber = ref('')
const fromBase = ref(10)
const toBase = ref(16)

const availableBases = Array.from({ length: 35 }, (_, i) => i + 2)

const convertedNumber = computed(() => {
    if (!inputNumber.value) return ''
    try {
        const decimal = parseInt(inputNumber.value, fromBase.value)
        if (isNaN(decimal)) return t('baseConverter.invalidInput')
        return decimal.toString(toBase.value).toUpperCase()
    } catch (e) {
        return t('baseConverter.invalidInput')
    }
})
</script>

<template>
<div class="converter-container">
    <h2>{{ t('baseConverter.title') }}</h2>
    <div class="input-group">
        <input v-model="inputNumber" type="text" :placeholder="t('baseConverter.input')" class="number-input" />
    </div>
    <div class="base-selectors">
        <div class="base-group">
            <label>{{ t('baseConverter.fromBase') }}</label>
            <select v-model="fromBase">
                <option v-for="base in availableBases" :key="base" :value="base">
                    {{ base }} {{ t('baseConverter.base') }}
                </option>
            </select>
        </div>
        <div class="base-group">
            <label>{{ t('baseConverter.toBase') }}</label>
            <select v-model="toBase">
                <option v-for="base in availableBases" :key="base" :value="base">
                    {{ base }} {{ t('baseConverter.base') }}
                </option>
            </select>
        </div>
    </div>

    <div class="result">
        <h3>{{ t('baseConverter.result') }}</h3>
        <div class="result-container">
            <pre class="result-value">{{ convertedNumber }}</pre>
            <button v-if="convertedNumber" @click="copyToClipboard(convertedNumber)" class="copy-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
    </div>
</div>
</template>

<style scoped>
.converter-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    width: 100%;
}

.input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.base-selectors {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.base-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.base-group label {
    font-size: 14px;
    color: #606266;
}

.base-group select {
    padding: 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
    background-color: #fff;
}

.result {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    min-height: 100px;
}

.result h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #606266;
}

.result-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.result-value {
    font-family: monospace;
    font-size: 18px;
    color: #409eff;
    word-break: break-all;
    flex: 1;
}

.copy-button {
    padding: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #606266;
    transition: color 0.2s;
}

.copy-button:hover {
    color: #409eff;
}
</style>