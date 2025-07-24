<script setup>
import { ref, computed } from 'vue'
import { copyToClipboard } from '../utils/clipboard.js'

const inputText = ref('')
const operationType = ref('encode') // 'encode' or 'decode'

const processedText = computed(() => {
    if (!inputText.value) return ''
    
    try {
        if (operationType.value === 'encode') {
            // 编码：将字符串转换为 Base64
            return btoa(unescape(encodeURIComponent(inputText.value)))
        } else {
            // 解码：将 Base64 转换为字符串
            return decodeURIComponent(escape(atob(inputText.value)))
        }
    } catch (e) {
        return "Invalid input for " + (operationType.value === 'encode' ? 'encoding' : 'decoding')
    }
})

function clearInput() {
    inputText.value = ''
}

function switchOperation() {
    // 切换操作类型，并将结果作为新的输入
    const currentResult = processedText.value
    if (currentResult && !currentResult.startsWith('Invalid input')) {
        inputText.value = currentResult
        operationType.value = operationType.value === 'encode' ? 'decode' : 'encode'
    }
}
</script>

<template>
<div class="converter-container">
    <h2>Base64 Converter</h2>
    
    <div class="operation-options">
        <label class="radio-label">
            <input type="radio" v-model="operationType" value="encode" />
            Encode (Text → Base64)
        </label>
        <label class="radio-label">
            <input type="radio" v-model="operationType" value="decode" />
            Decode (Base64 → Text)
        </label>
    </div>

    <div class="input-section">
        <label class="input-label">
            {{ operationType === 'encode' ? 'Input Text:' : 'Input Base64:' }}
        </label>
        <textarea 
            v-model="inputText" 
            :placeholder="operationType === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'" 
            class="text-input"
        ></textarea>
        <div class="button-group">
            <button @click="clearInput" class="clear-button">Clear</button>
            <button @click="switchOperation" class="switch-button" :disabled="!processedText || processedText.startsWith('Invalid input')">
                Switch & {{ operationType === 'encode' ? 'Decode' : 'Encode' }}
            </button>
        </div>
    </div>

    <div class="result">
        <div class="result-header">
            <h3>{{ operationType === 'encode' ? 'Base64 Result:' : 'Decoded Text:' }}</h3>
            <button v-if="processedText && !processedText.startsWith('Invalid input')" 
                    @click="copyToClipboard(processedText)" 
                    class="copy-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        <div class="result-container">
            <pre class="result-value" :class="{ 'error': processedText.startsWith('Invalid input') }">{{ processedText || 'No input provided' }}</pre>
        </div>
    </div>

    <div class="info-section">
        <h4>About Base64</h4>
        <p>Base64 是一种用于将二进制数据编码为ASCII字符的编码方法。它常用于：</p>
        <ul>
            <li>在JSON或XML中嵌入二进制数据</li>
            <li>在URL中传输数据</li>
            <li>在邮件系统中编码附件</li>
            <li>在网页中嵌入图片数据（Data URLs）</li>
        </ul>
    </div>
</div>
</template>

<style scoped>
.converter-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.converter-container h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
}

.operation-options {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    justify-content: center;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #495057;
}

.input-section {
    margin-bottom: 20px;
}

.input-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #495057;
}

.text-input {
    width: 100%;
    height: 150px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    resize: vertical;
    padding: 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
}

.text-input:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    justify-content: flex-end;
}

.clear-button {
    padding: 8px 16px;
    background-color: #f56c6c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.clear-button:hover {
    background-color: #f78989;
}

.switch-button {
    padding: 8px 16px;
    background-color: #67c23a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.switch-button:hover:not(:disabled) {
    background-color: #85ce61;
}

.switch-button:disabled {
    background-color: #c0c4cc;
    cursor: not-allowed;
}

.result {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.result-header h3 {
    margin: 0;
    font-size: 16px;
    color: #606266;
}

.result-container {
    position: relative;
}

.result-value {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    color: #409eff;
    word-break: break-all;
    white-space: pre-wrap;
    margin: 0;
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    max-height: 300px;
    overflow-y: auto;
}

.result-value.error {
    color: #f56c6c;
    background-color: #fef0f0;
    border-color: #fbc4c4;
}

.copy-button {
    padding: 8px;
    background: transparent;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    color: #606266;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.copy-button:hover {
    color: #409eff;
    border-color: #409eff;
}

.info-section {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    border-left: 4px solid #409eff;
}

.info-section h4 {
    margin: 0 0 10px 0;
    color: #2c3e50;
}

.info-section p {
    margin: 0 0 10px 0;
    color: #606266;
    line-height: 1.5;
}

.info-section ul {
    margin: 0;
    color: #606266;
}

.info-section li {
    margin-bottom: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .converter-container {
        padding: 15px;
    }
    
    .operation-options {
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }
    
    .button-group {
        justify-content: center;
    }
    
    .text-input {
        height: 120px;
    }
    
    .result-value {
        font-size: 12px;
        max-height: 200px;
    }
}

/* 滚动条样式 */
.result-value::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.result-value::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.result-value::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.result-value::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
