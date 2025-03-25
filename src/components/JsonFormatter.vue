<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { copyToClipboard } from '../utils/clipboard.js'

const { t } = useI18n()
const jsonInput = ref('')
const formatType = ref('beautify')

const processedJson = computed(() => {
    if (!jsonInput.value) return ''
    try {
        const parsed = JSON.parse(jsonInput.value)
        switch (formatType.value) {
            case 'beautify':
                return JSON.stringify(parsed, null, 2)
            case 'compress':
                return JSON.stringify(parsed)
            case 'escape':
                return JSON.stringify(JSON.stringify(parsed))
            default:
                return ''
        }
    } catch (e) {
        return t('jsonFormatter.invalidJson')
    }
})

function clearInput() {
    jsonInput.value = ''
}
</script>

<template>
<div class="converter-container">
    <h2>{{ t('jsonFormatter.title') }}</h2>
    <div class="format-options">
        <label class="radio-label">
            <input type="radio" v-model="formatType" value="beautify" />
            {{ t('jsonFormatter.beautify') }}
        </label>
        <label class="radio-label">
            <input type="radio" v-model="formatType" value="compress" />
            {{ t('jsonFormatter.compress') }}
        </label>
        <label class="radio-label">
            <input type="radio" v-model="formatType" value="escape" />
            {{ t('jsonFormatter.escape') }}
        </label>
    </div>

    <div class="input-section">
        <textarea v-model="jsonInput" :placeholder="t('jsonFormatter.input')" class="json-input"></textarea>
        <button @click="clearInput" class="clear-button">{{ t('jsonFormatter.clear') }}</button>
    </div>

    <div class="result">
        <h3>{{ t('jsonFormatter.result') }}</h3>
        <div class="result-container">
            <pre class="result-value">{{ processedJson }}</pre>
            <button v-if="processedJson" @click="copyToClipboard(processedJson)" class="copy-button">
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
.format-options {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.json-input {
    width: 100%;
    height: 200px;
    font-family: monospace;
    font-size: 14px;
    resize: vertical;
}

.clear-button {
    align-self: flex-end;
    padding: 8px 16px;
    background-color: #f56c6c;
    color: white;
    border: none;
}

.clear-button:hover {
    background-color: #f78989;
}
</style>