<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { copyToClipboard } from '../utils/clipboard.js'

const { t } = useI18n()
const timestamp = ref('')
const unit = ref('seconds')

const convertedTime = computed(() => {
    if (!timestamp.value) return ''
    try {
        let time = parseInt(timestamp.value)
        if (isNaN(time)) return t('timestampConverter.invalidInput')

        // Convert to milliseconds if input is in seconds
        if (unit.value === 'seconds') {
            time *= 1000
        }

        const date = new Date(time)
        if (date.toString() === 'Invalid Date') {
            return t('timestampConverter.invalidInput')
        }

        return date.toLocaleString()
    } catch (e) {
        return t('timestampConverter.invalidInput')
    }
})

function clearInput() {
    timestamp.value = ''
}
</script>

<template>
<div class="converter-container">
    <h2>{{ t('timestampConverter.title') }}</h2>
    <div class="input-section">
        <div class="input-group">
            <input v-model="timestamp" type="text" :placeholder="t('timestampConverter.input')" class="timestamp-input" />
            <button @click="clearInput" class="clear-button">{{ t('timestampConverter.clear') }}</button>
        </div>
        <div class="format-options">
            <label class="radio-label">
                <input type="radio" v-model="unit" value="seconds" />
                {{ t('timestampConverter.seconds') }}
            </label>
            <label class="radio-label">
                <input type="radio" v-model="unit" value="milliseconds" />
                {{ t('timestampConverter.milliseconds') }}
            </label>
        </div>
    </div>

    <div class="result">
        <h3>{{ t('timestampConverter.result') }}</h3>
        <div class="result-container">
            <pre class="result-value">{{ convertedTime }}</pre>
            <button v-if="convertedTime" @click="copyToClipboard(convertedTime)" class="copy-button">
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

.input-section {
    margin-bottom: 20px;
}

.input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.timestamp-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
}

.clear-button {
    padding: 8px 16px;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;
}

.clear-button:hover {
    background-color: #e4e7ed;
    border-color: #c0c4cc;
}

.format-options {
    display: flex;
    gap: 20px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
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