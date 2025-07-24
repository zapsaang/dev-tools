<script setup>
import { ref, computed, nextTick } from 'vue'

import { copyToClipboard } from '../utils/clipboard.js'


const jsonInput = ref('')
const formatType = ref('beautify')
const showLineNumbers = ref(true)
const enableFolding = ref(true)
const collapsedNodes = ref(new Set())

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
        return "Invalid JSON"
    }
})

// 解析JSON结构用于折叠功能
const jsonStructure = computed(() => {
    if (!jsonInput.value || formatType.value !== 'beautify') return null
    try {
        const parsed = JSON.parse(jsonInput.value)
        return parseJsonStructure(parsed, [])
    } catch (e) {
        return null
    }
})

// 递归解析JSON结构
function parseJsonStructure(obj, path) {
    if (Array.isArray(obj)) {
        return {
            type: 'array',
            path: path.join('.'),
            length: obj.length,
            children: obj.map((item, index) => parseJsonStructure(item, [...path, index]))
        }
    } else if (obj !== null && typeof obj === 'object') {
        const keys = Object.keys(obj)
        return {
            type: 'object',
            path: path.join('.'),
            keys: keys,
            children: keys.map(key => ({
                key,
                value: parseJsonStructure(obj[key], [...path, key])
            }))
        }
    } else {
        return {
            type: 'primitive',
            value: obj,
            path: path.join('.')
        }
    }
}

// 生成带行号和折叠功能的JSON显示
const formattedJsonWithFeatures = computed(() => {
    if (!processedJson.value || processedJson.value === "Invalid JSON") {
        return { lines: [{ number: 1, content: processedJson.value, isCollapsed: false, canCollapse: false, indent: 0 }], hasStructure: false }
    }
    
    if (formatType.value !== 'beautify' || !jsonStructure.value) {
        const lines = processedJson.value.split('\n')
        return { 
            lines: lines.map((line, index) => ({
                number: index + 1,
                content: line,
                isCollapsed: false,
                canCollapse: false,
                indent: 0
            })), 
            hasStructure: false 
        }
    }

    const result = generateFormattedLines(jsonStructure.value, 0, '')
    return { lines: result, hasStructure: true }
})

function generateFormattedLines(structure, level, parentPath) {
    const lines = []
    const indent = '  '.repeat(level)
    let lineNumber = 1
    
    function addLine(content, options = {}) {
        lines.push({
            number: lineNumber++,
            content: indent + content,
            isCollapsed: false,
            canCollapse: false,
            indent: level,
            ...options
        })
    }

    if (structure.type === 'object') {
        const currentPath = parentPath ? `${parentPath}.object` : 'object'
        const isCollapsed = collapsedNodes.value.has(currentPath)
        const canCollapse = structure.children && structure.children.length > 0
        
        addLine('{', { 
            canCollapse, 
            path: currentPath,
            isObjectStart: true 
        })

        if (!isCollapsed && structure.children) {
            structure.children.forEach((child, index) => {
                const isLast = index === structure.children.length - 1
                const comma = isLast ? '' : ','
                
                if (child.value.type === 'primitive') {
                    addLine(`"${child.key}": ${JSON.stringify(child.value.value)}${comma}`)
                } else {
                    addLine(`"${child.key}": `)
                    const childLines = generateFormattedLines(child.value, level + 1, `${currentPath}.${child.key}`)
                    childLines.forEach((childLine, idx) => {
                        if (idx === childLines.length - 1) {
                            childLine.content += comma
                        }
                        childLine.number = lineNumber++
                        lines.push(childLine)
                    })
                }
            })
        } else if (isCollapsed) {
            addLine(`  // ... ${structure.keys ? structure.keys.length : 0} properties`, {
                isCollapsedContent: true
            })
        }

        addLine('}')
    } else if (structure.type === 'array') {
        const currentPath = parentPath ? `${parentPath}.array` : 'array'
        const isCollapsed = collapsedNodes.value.has(currentPath)
        const canCollapse = structure.children && structure.children.length > 0
        
        addLine('[', { 
            canCollapse, 
            path: currentPath,
            isArrayStart: true 
        })

        if (!isCollapsed && structure.children) {
            structure.children.forEach((child, index) => {
                const isLast = index === structure.children.length - 1
                const comma = isLast ? '' : ','
                
                if (child.type === 'primitive') {
                    addLine(`${JSON.stringify(child.value)}${comma}`)
                } else {
                    const childLines = generateFormattedLines(child, level + 1, `${currentPath}[${index}]`)
                    childLines.forEach((childLine, idx) => {
                        if (idx === childLines.length - 1) {
                            childLine.content += comma
                        }
                        childLine.number = lineNumber++
                        lines.push(childLine)
                    })
                }
            })
        } else if (isCollapsed) {
            addLine(`  // ... ${structure.length || 0} items`, {
                isCollapsedContent: true
            })
        }

        addLine(']')
    }

    return lines
}

function toggleCollapse(path) {
    if (collapsedNodes.value.has(path)) {
        collapsedNodes.value.delete(path)
    } else {
        collapsedNodes.value.add(path)
    }
    // 触发重新计算
    collapsedNodes.value = new Set(collapsedNodes.value)
}

function clearInput() {
    jsonInput.value = ''
    collapsedNodes.value.clear()
}
</script>

<template>
<div class="converter-container">
    <h2>JSON Formatter</h2>
    <div class="format-options">
        <label class="radio-label">
            <input type="radio" v-model="formatType" value="beautify" />
            Beautify
        </label>
        <label class="radio-label">
            <input type="radio" v-model="formatType" value="compress" />
            Compress
        </label>
        <label class="radio-label">
            <input type="radio" v-model="formatType" value="escape" />
            Escape
        </label>
    </div>

    <!-- 显示选项 -->
    <div class="display-options" v-if="formatType === 'beautify'">
        <label class="checkbox-label">
            <input type="checkbox" v-model="showLineNumbers" />
            Show Line Numbers
        </label>
        <label class="checkbox-label">
            <input type="checkbox" v-model="enableFolding" />
            Enable Folding
        </label>
    </div>

    <div class="input-section">
        <textarea v-model="jsonInput" placeholder="Enter JSON" class="json-input"></textarea>
        <button @click="clearInput" class="clear-button">Clear</button>
    </div>

    <div class="result">
        <div class="result-header">
            <h3>Formatted Result</h3>
            <button v-if="processedJson && processedJson !== 'Invalid JSON'" 
                    @click="copyToClipboard(processedJson)" 
                    class="copy-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        
        <!-- 增强的JSON显示区域 -->
        <div class="result-container enhanced-json" v-if="formatType === 'beautify' && formattedJsonWithFeatures.hasStructure">
            <div class="json-viewer">
                <div v-for="(line, index) in formattedJsonWithFeatures.lines" 
                     :key="index" 
                     class="json-line"
                     :class="{ 
                         'collapsed-content': line.isCollapsedContent,
                         'collapsible': line.canCollapse && enableFolding
                     }">
                    <!-- 行号 -->
                    <span v-if="showLineNumbers" class="line-number">{{ line.number }}</span>
                    
                    <!-- 折叠按钮 -->
                    <span v-if="line.canCollapse && enableFolding" 
                          class="fold-button"
                          @click="toggleCollapse(line.path)">
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <path d="M4 6l2 2 2-2" stroke="currentColor" fill="none" stroke-width="1.5" 
                                  :class="{ 'rotated': collapsedNodes.has(line.path) }"/>
                        </svg>
                    </span>
                    <span v-else-if="enableFolding" class="fold-spacer"></span>
                    
                    <!-- JSON内容 -->
                    <span class="json-content" 
                          :style="{ marginLeft: showLineNumbers ? '0' : `${line.indent * 20}px` }">{{ line.content }}</span>
                </div>
            </div>
        </div>
        
        <!-- 简单显示模式 -->
        <div v-else class="result-container">
            <pre class="result-value">{{ processedJson }}</pre>
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

.display-options {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #495057;
}

.checkbox-label input[type="checkbox"] {
    margin: 0;
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
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    resize: vertical;
    padding: 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
}

.clear-button {
    align-self: flex-end;
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

.result {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    min-height: 100px;
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
    max-height: 400px;
    overflow-y: auto;
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

/* 增强JSON显示样式 */
.enhanced-json {
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    max-height: 500px;
    overflow: auto;
}

.json-viewer {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
}

.json-line {
    display: flex;
    align-items: center;
    min-height: 24px;
    padding: 2px 8px;
    border-left: 3px solid transparent;
    transition: all 0.2s;
}

.json-line:hover {
    background-color: #f8f9fa;
}

.json-line.collapsible {
    border-left-color: #e9ecef;
}

.json-line.collapsible:hover {
    border-left-color: #409eff;
    background-color: #ecf5ff;
}

.json-line.collapsed-content {
    color: #909399;
    font-style: italic;
}

.line-number {
    display: inline-block;
    min-width: 40px;
    text-align: right;
    margin-right: 12px;
    padding-right: 8px;
    color: #909399;
    font-size: 12px;
    border-right: 1px solid #e4e7ed;
    user-select: none;
}

.fold-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    cursor: pointer;
    color: #909399;
    transition: color 0.2s;
    border-radius: 2px;
}

.fold-button:hover {
    color: #409eff;
    background-color: #ecf5ff;
}

.fold-button svg path {
    transition: transform 0.2s;
}

.fold-button svg path.rotated {
    transform: rotate(-90deg);
    transform-origin: center;
}

.fold-spacer {
    display: inline-block;
    width: 16px;
    margin-right: 6px;
}

.json-content {
    color: #303133;
    white-space: pre;
    word-break: break-all;
}

/* JSON语法高亮 */
.json-line:not(.collapsed-content) .json-content {
    color: #303133;
}

/* 字符串 */
.json-content:has-text('"') {
    color: #409eff;
}

/* 数字 */
.json-content:has-text(/\d/) {
    color: #f56c6c;
}

/* 布尔值和null */
.json-content:has-text('true'),
.json-content:has-text('false'),
.json-content:has-text('null') {
    color: #e6a23c;
}

/* 括号和符号 */
.json-content:has-text('{'),
.json-content:has-text('}'),
.json-content:has-text('['),
.json-content:has-text(']') {
    color: #909399;
    font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .display-options {
        flex-direction: column;
        gap: 12px;
    }
    
    .line-number {
        min-width: 30px;
        font-size: 11px;
    }
    
    .json-viewer {
        font-size: 12px;
    }
    
    .enhanced-json {
        max-height: 300px;
    }
}

/* 滚动条样式 */
.enhanced-json::-webkit-scrollbar,
.result-value::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.enhanced-json::-webkit-scrollbar-track,
.result-value::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.enhanced-json::-webkit-scrollbar-thumb,
.result-value::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.enhanced-json::-webkit-scrollbar-thumb:hover,
.result-value::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>