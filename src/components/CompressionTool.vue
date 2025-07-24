<script setup>
import { ref, computed, provide } from 'vue'
import { copyToClipboard } from '../utils/clipboard.js'

// 环境检测
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// 条件性导入调试面板
const DebugPanel = ref(null)
if (isDevelopment) {
    import('./DebugPanel.vue').then(module => {
        DebugPanel.value = module.default
    })
}

// 动态导入 WASM 库 - 使用响应式变量
const zstdLib = ref(null)
const snappyLib = ref(null)
const brotliLib = ref(null)
const zstdLoading = ref(true)
const snappyLoading = ref(true)
const brotliLoading = ref(true)

// 初始化 WASM 库
const initWasmLibs = async () => {
    if (isDevelopment) {
        console.log('🚀 开始初始化WASM库...')
        console.log('浏览器环境检查:', {
            wasm: typeof WebAssembly !== 'undefined',
            worker: typeof Worker !== 'undefined',
            sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
            crossOriginIsolated: typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : 'undefined'
        })
    }
    
    // 初始化 ZSTD
    const initZstd = async () => {
        try {
            if (isDevelopment) console.log('开始加载ZSTD库...')
            const zstdModule = await import('@bokuweb/zstd-wasm')
            if (isDevelopment) {
                console.log('ZSTD模块导入成功:', zstdModule)
                console.log('ZSTD模块方法:', Object.keys(zstdModule))
            }
            
            // 确保init方法存在并调用
            if (typeof zstdModule.init === 'function') {
                if (isDevelopment) console.log('开始ZSTD初始化（使用默认路径）...')
                
                const initResult = await Promise.race([
                    zstdModule.init(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('ZSTD初始化超时')), 15000)
                    )
                ])
                if (isDevelopment) console.log('ZSTD初始化完成:', initResult)
            } else {
                if (isDevelopment) console.log('ZSTD模块没有init方法，直接使用')
            }
            
            zstdLib.value = zstdModule
            zstdLoading.value = false
            if (isDevelopment) console.log('✅ ZSTD library loaded successfully')
        } catch (e) {
            if (isDevelopment) {
                console.error('❌ Failed to load ZSTD library:', e)
                console.error('错误详情:', e.message, e.stack)
            }
            zstdLoading.value = false
        }
    }
    
    // 初始化 Snappy
    const initSnappy = async () => {
        try {
            if (isDevelopment) console.log('开始加载Snappy库...')
            const snappyModule = await import('snappyjs')
            snappyLib.value = snappyModule.default || snappyModule
            snappyLoading.value = false
            if (isDevelopment) console.log('✅ Snappy library loaded successfully')
        } catch (e) {
            if (isDevelopment) console.error('❌ Failed to load Snappy library:', e)
            snappyLoading.value = false
        }
    }
    
    // 初始化 Brotli
    const initBrotli = async () => {
        try {
            if (isDevelopment) console.log('开始加载Brotli库...')
            
            // 导入brotli-wasm
            const brotliModule = await import('brotli-wasm')
            if (isDevelopment) {
                console.log('Brotli模块导入成功:', brotliModule)
                console.log('Brotli模块方法:', Object.keys(brotliModule))
            }
            
            // brotli-wasm导出一个Promise，需要等待
            const brotli = await brotliModule.default
            if (isDevelopment) {
                console.log('Brotli初始化成功:', brotli)
                console.log('Brotli可用方法:', Object.keys(brotli))
            }
            
            brotliLib.value = brotli
            brotliLoading.value = false
            if (isDevelopment) console.log('✅ Brotli library loaded successfully')
        } catch (e) {
            if (isDevelopment) {
                console.error('❌ Failed to load Brotli library:', e)
                console.error('错误详情:', e.message, e.stack)
            }
            brotliLoading.value = false
        }
    }
    
    // 并行初始化三个库
    await Promise.allSettled([initZstd(), initSnappy(), initBrotli()])
    
    // WASM库加载完成后，重新检查并更新默认算法
    updateDefaultAlgorithm()
    
    if (isDevelopment) {
        console.log('📊 最终状态:', {
            zstdLoaded: !!zstdLib.value,
            snappyLoaded: !!snappyLib.value,
            brotliLoaded: !!brotliLib.value,
            zstdLoading: zstdLoading.value,
            snappyLoading: snappyLoading.value,
            brotliLoading: brotliLoading.value
        })
        console.log('🏁 WASM库初始化完成')
    }
}

// 初始化库
initWasmLibs()

// 为调试面板提供依赖注入
if (isDevelopment) {
    provide('zstdLib', zstdLib)
    provide('snappyLib', snappyLib)
    provide('brotliLib', brotliLib)
    provide('zstdLoading', zstdLoading)
    provide('snappyLoading', snappyLoading)
    provide('brotliLoading', brotliLoading)
    provide('initWasmLibs', initWasmLibs)
}

const inputText = ref('')
const operationType = ref('compress') // 'compress' or 'decompress'

// 先定义一个简单的默认值，稍后会在算法检测完成后更新
const compressionAlgorithm = ref('gzip')

// 安全地将Uint8Array转换为Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 8192 // 分块处理大数组
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize)
        binary += String.fromCharCode.apply(null, chunk)
    }
    
    return btoa(binary)
}

// 压缩和解压缩函数
async function compressText(text, algorithm) {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    
    switch (algorithm) {
        case 'gzip': {
            const compressionStream = new CompressionStream('gzip')
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(data)
                    controller.close()
                }
            })
            const compressedStream = stream.pipeThrough(compressionStream)
            const compressedData = await new Response(compressedStream).arrayBuffer()
            const compressedBytes = new Uint8Array(compressedData)
            return arrayBufferToBase64(compressedBytes)
        }
        case 'deflate': {
            const compressionStream = new CompressionStream('deflate')
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(data)
                    controller.close()
                }
            })
            const compressedStream = stream.pipeThrough(compressionStream)
            const compressedData = await new Response(compressedStream).arrayBuffer()
            const compressedBytes = new Uint8Array(compressedData)
            return arrayBufferToBase64(compressedBytes)
        }
        case 'brotli': {
            if (!brotliLib.value) {
                throw new Error('Brotli library not loaded')
            }
            // brotli-wasm的compress函数接受Uint8Array和options对象
            const compressed = brotliLib.value.compress(data, { quality: 6 })
            // 安全地转换为Base64
            return arrayBufferToBase64(compressed)
        }
        case 'zstd': {
            if (!zstdLib.value) {
                throw new Error('ZSTD library not loaded')
            }
            const compressed = zstdLib.value.compress(data, 3) // 使用压缩级别3
            return arrayBufferToBase64(compressed)
        }
        case 'snappy': {
            if (!snappyLib.value) {
                throw new Error('Snappy library not loaded')
            }
            const compressed = snappyLib.value.compress(data)
            return arrayBufferToBase64(compressed)
        }
        case 'none': {
            // 直接转换为base64，不压缩
            return arrayBufferToBase64(data)
        }
        default:
            throw new Error('Unsupported compression algorithm')
    }
}

async function decompressText(base64String, algorithm) {
    try {
        // 验证Base64字符串格式
        if (!base64String || typeof base64String !== 'string') {
            throw new Error('Invalid input: empty or non-string input')
        }
        
        // 清理Base64字符串（移除空格和换行符）
        const cleanBase64 = base64String.trim().replace(/\s/g, '')
        
        // 验证Base64格式
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
        if (!base64Regex.test(cleanBase64)) {
            throw new Error('Invalid Base64 format')
        }
        
        // 从base64解码
        const binaryString = atob(cleanBase64)
        const compressedData = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            compressedData[i] = binaryString.charCodeAt(i)
        }
        
        switch (algorithm) {
            case 'gzip': {
                const decompressionStream = new DecompressionStream('gzip')
                const stream = new ReadableStream({
                    start(controller) {
                        controller.enqueue(compressedData)
                        controller.close()
                    }
                })
                const decompressedStream = stream.pipeThrough(decompressionStream)
                const decompressedData = await new Response(decompressedStream).arrayBuffer()
                const decoder = new TextDecoder()
                return decoder.decode(decompressedData)
            }
            case 'deflate': {
                const decompressionStream = new DecompressionStream('deflate')
                const stream = new ReadableStream({
                    start(controller) {
                        controller.enqueue(compressedData)
                        controller.close()
                    }
                })
                const decompressedStream = stream.pipeThrough(decompressionStream)
                const decompressedData = await new Response(decompressedStream).arrayBuffer()
                const decoder = new TextDecoder()
                return decoder.decode(decompressedData)
            }
            case 'brotli': {
                if (!brotliLib.value) {
                    throw new Error('Brotli library not loaded')
                }
                const decompressed = brotliLib.value.decompress(compressedData)
                const decoder = new TextDecoder()
                return decoder.decode(decompressed)
            }
            case 'zstd': {
                if (!zstdLib.value) {
                    throw new Error('ZSTD library not loaded')
                }
                const decompressed = zstdLib.value.decompress(compressedData)
                const decoder = new TextDecoder()
                return decoder.decode(decompressed)
            }
            case 'snappy': {
                if (!snappyLib.value) {
                    throw new Error('Snappy library not loaded')
                }
                const decompressed = snappyLib.value.uncompress(compressedData)
                const decoder = new TextDecoder()
                return decoder.decode(decompressed)
            }
            case 'none': {
                // 直接解码，无压缩
                const decoder = new TextDecoder()
                return decoder.decode(compressedData)
            }
            default:
                throw new Error('Unsupported decompression algorithm')
        }
    } catch (e) {
        throw new Error('Failed to decompress data: ' + e.message)
    }
}

const processedText = computed(() => {
    if (!inputText.value) return ''
    
    return new Promise(async (resolve) => {
        try {
            if (operationType.value === 'compress') {
                const result = await compressText(inputText.value, compressionAlgorithm.value)
                resolve(result)
            } else {
                const result = await decompressText(inputText.value, compressionAlgorithm.value)
                resolve(result)
            }
        } catch (e) {
            resolve("Error: " + e.message)
        }
    })
})

// 由于计算属性是异步的，我们需要用响应式数据来存储结果
const result = ref('')

// 监听输入变化并处理
const processInput = async () => {
    if (!inputText.value) {
        result.value = ''
        return
    }
    
    try {
        if (operationType.value === 'compress') {
            result.value = await compressText(inputText.value, compressionAlgorithm.value)
        } else {
            result.value = await decompressText(inputText.value, compressionAlgorithm.value)
        }
    } catch (e) {
        result.value = "Error: " + e.message
    }
}

// 监听输入变化
const handleInputChange = () => {
    processInput()
}

// 清空输入
function clearInput() {
    inputText.value = ''
    result.value = ''
}

// 切换操作类型
function switchOperation() {
    if (result.value && !result.value.startsWith('Error:')) {
        inputText.value = result.value
        operationType.value = operationType.value === 'compress' ? 'decompress' : 'compress'
        processInput()
    }
}

// 检查浏览器支持
const isCompressionSupported = computed(() => {
    return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'
})

// 检查各种压缩算法支持
const algorithmSupport = ref({
    gzip: false,
    deflate: false,
    brotli: false
})

// 检测各种压缩算法支持
const detectAlgorithmSupport = async () => {
    const testData = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
    
    // 检测 GZIP 支持
    try {
        const compressionStream = new CompressionStream('gzip')
        const inputStream = new ReadableStream({
            start(controller) {
                controller.enqueue(testData)
                controller.close()
            }
        })
        const compressedStream = inputStream.pipeThrough(compressionStream)
        await new Response(compressedStream).arrayBuffer()
        algorithmSupport.value.gzip = true
        if (isDevelopment) console.log('✅ GZIP compression test passed')
    } catch (e) {
        algorithmSupport.value.gzip = false
        if (isDevelopment) console.warn('❌ GZIP not supported:', e.message)
    }
    
    // 检测 Deflate 支持
    try {
        const compressionStream = new CompressionStream('deflate')
        const inputStream = new ReadableStream({
            start(controller) {
                controller.enqueue(testData)
                controller.close()
            }
        })
        const compressedStream = inputStream.pipeThrough(compressionStream)
        await new Response(compressedStream).arrayBuffer()
        algorithmSupport.value.deflate = true
        if (isDevelopment) console.log('✅ Deflate compression test passed')
    } catch (e) {
        algorithmSupport.value.deflate = false
        if (isDevelopment) console.warn('❌ Deflate not supported:', e.message)
    }
    
    // Brotli 通过 WASM 库支持，状态在库加载后确定
    // algorithmSupport.value.brotli 在这里不设置，由isAlgorithmAvailable动态检查
    if (isDevelopment) console.log('ℹ️ Brotli support depends on WASM library loading')
    
    // 算法检测完成后，智能调整默认算法
    updateDefaultAlgorithm()
    
    if (isDevelopment) {
        console.log('算法支持检测结果:', algorithmSupport.value)
    }
}

// 更新默认算法选择
const updateDefaultAlgorithm = () => {
    // 如果当前选择的算法不可用，自动切换到可用的算法
    if (!isAlgorithmAvailable(compressionAlgorithm.value)) {
        if (isAlgorithmAvailable('brotli')) {
            compressionAlgorithm.value = 'brotli'
        } else if (isAlgorithmAvailable('gzip')) {
            compressionAlgorithm.value = 'gzip'
        } else if (isAlgorithmAvailable('deflate')) {
            compressionAlgorithm.value = 'deflate'
        } else if (isAlgorithmAvailable('zstd')) {
            compressionAlgorithm.value = 'zstd'
        } else if (isAlgorithmAvailable('snappy')) {
            compressionAlgorithm.value = 'snappy'
        } else {
            compressionAlgorithm.value = 'gzip' // 默认回退到gzip
        }
        if (isDevelopment) console.log('🔄 自动切换到可用算法:', compressionAlgorithm.value)
    }
}

// 执行算法支持检测
if (isCompressionSupported.value) {
    detectAlgorithmSupport()
}

// 检查 WASM 库支持
const wasmLibraryStatus = computed(() => {
    return {
        zstd: !!zstdLib.value,
        snappy: !!snappyLib.value,
        brotli: !!brotliLib.value,
        zstdLoading: zstdLoading.value,
        snappyLoading: snappyLoading.value,
        brotliLoading: brotliLoading.value
    }
})

// 检查特定算法是否可用
const isAlgorithmAvailable = (algorithm) => {
    switch (algorithm) {
        case 'gzip':
            return isCompressionSupported.value && algorithmSupport.value.gzip
        case 'deflate':
            return isCompressionSupported.value && algorithmSupport.value.deflate
        case 'brotli':
            return !!brotliLib.value
        case 'zstd':
            return wasmLibraryStatus.value.zstd
        case 'snappy':
            return wasmLibraryStatus.value.snappy
        case 'none':
            return true
        default:
            return false
    }
}

// 计算压缩比
const compressionRatio = computed(() => {
    if (operationType.value === 'compress' && inputText.value && result.value && !result.value.startsWith('Error:')) {
        try {
            const originalSize = new TextEncoder().encode(inputText.value).length
            // 安全地计算Base64解码后的大小
            const cleanBase64 = result.value.trim().replace(/\s/g, '')
            const compressedSize = Math.ceil(cleanBase64.length * 3 / 4) - (cleanBase64.match(/=/g) || []).length
            const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
            return ratio > 0 ? `${ratio}%` : '0%'
        } catch (e) {
            return 'N/A'
        }
    }
    return ''
})
</script>

<template>
<div class="converter-container">
    <h2>Compression Tool</h2>
    
    <!-- 环境指示器 - 仅在开发环境中显示 -->
    <div v-if="isDevelopment" class="environment-indicator" style="margin-bottom: 10px; padding: 5px 10px; background: #e3f2fd; border: 1px solid #2196f3; border-radius: 4px; color: #1976d2; font-size: 12px;">
        🛠️ 开发环境 - 调试功能已启用
    </div>
    
    <!-- 浏览器支持检查 -->
    <div v-if="!isCompressionSupported" class="warning-section">
        <h4>⚠️ Browser Compatibility</h4>
        <p>Your browser doesn't fully support the Compression Streams API. GZIP, Deflate, and Brotli algorithms require Chrome 80+, Firefox 123+, or Safari 16.4+.</p>
    </div>
    
    <!-- WASM 库状态 -->
    <div class="wasm-status">
        <h4>Algorithm Availability</h4>
        <div class="status-grid">
            <div class="status-item" :class="{ 'available': algorithmSupport.gzip }">
                <span class="status-icon">{{ algorithmSupport.gzip ? '✅' : '❌' }}</span>
                GZIP (Native API)
            </div>
            <div class="status-item" :class="{ 'available': algorithmSupport.deflate }">
                <span class="status-icon">{{ algorithmSupport.deflate ? '✅' : '❌' }}</span>
                Deflate (Native API)
            </div>
            <div class="status-item" :class="{ 'available': wasmLibraryStatus.brotli, 'loading': wasmLibraryStatus.brotliLoading && !wasmLibraryStatus.brotli }">
                <span class="status-icon">{{ wasmLibraryStatus.brotli ? '✅' : (wasmLibraryStatus.brotliLoading ? '⏳' : '❌') }}</span>
                Brotli (WebAssembly)
                <span v-if="wasmLibraryStatus.brotliLoading && !wasmLibraryStatus.brotli" class="loading-text">Loading...</span>
            </div>
            <div class="status-item" :class="{ 'available': wasmLibraryStatus.zstd, 'loading': wasmLibraryStatus.zstdLoading && !wasmLibraryStatus.zstd }">
                <span class="status-icon">
                    {{ wasmLibraryStatus.zstd ? '✅' : (wasmLibraryStatus.zstdLoading ? '⏳' : '❌') }}
                </span>
                ZSTD (WebAssembly)
                <span v-if="wasmLibraryStatus.zstdLoading && !wasmLibraryStatus.zstd" class="loading-text">Loading...</span>
            </div>
            <div class="status-item" :class="{ 'available': wasmLibraryStatus.snappy, 'loading': wasmLibraryStatus.snappyLoading && !wasmLibraryStatus.snappy }">
                <span class="status-icon">
                    {{ wasmLibraryStatus.snappy ? '✅' : (wasmLibraryStatus.snappyLoading ? '⏳' : '❌') }}
                </span>
                Snappy (JavaScript)
                <span v-if="wasmLibraryStatus.snappyLoading && !wasmLibraryStatus.snappy" class="loading-text">Loading...</span>
            </div>
        </div>
    </div>
    
    <div class="operation-options">
        <label class="radio-label">
            <input type="radio" v-model="operationType" value="compress" @change="handleInputChange" />
            Compress (Text → Base64)
        </label>
        <label class="radio-label">
            <input type="radio" v-model="operationType" value="decompress" @change="handleInputChange" />
            Decompress (Base64 → Text)
        </label>
    </div>

    <div class="algorithm-options">
        <label class="select-label">
            Compression Algorithm:
            <select v-model="compressionAlgorithm" @change="handleInputChange" class="algorithm-select">
                <option value="gzip" :disabled="!isAlgorithmAvailable('gzip')">
                    GZIP {{ !isAlgorithmAvailable('gzip') ? '(Not Available)' : '' }}
                </option>
                <option value="deflate" :disabled="!isAlgorithmAvailable('deflate')">
                    Deflate {{ !isAlgorithmAvailable('deflate') ? '(Not Available)' : '' }}
                </option>
                <option value="brotli" :disabled="!isAlgorithmAvailable('brotli')">
                    Brotli {{ !isAlgorithmAvailable('brotli') ? '(Loading...)' : '' }}
                </option>
                <option value="zstd" :disabled="!isAlgorithmAvailable('zstd')">
                    ZSTD {{ !isAlgorithmAvailable('zstd') ? '(Loading...)' : '' }}
                </option>
                <option value="snappy" :disabled="!isAlgorithmAvailable('snappy')">
                    Snappy {{ !isAlgorithmAvailable('snappy') ? '(Loading...)' : '' }}
                </option>
                <option value="none">None (Base64 only)</option>
            </select>
        </label>
    </div>

    <!-- 调试面板 - 仅在开发环境中显示 -->
    <component v-if="isDevelopment && DebugPanel" :is="DebugPanel" />
    
    <div class="input-section">
        <label class="input-label">
            {{ operationType === 'compress' ? 'Input Text:' : 'Input Base64:' }}
        </label>
        <textarea 
            v-model="inputText" 
            @input="handleInputChange"
            :placeholder="operationType === 'compress' ? 'Enter text to compress...' : 'Enter Base64 string to decompress...'" 
            class="text-input"
            :disabled="!isAlgorithmAvailable(compressionAlgorithm)"
        ></textarea>
        <div class="button-group">
            <button @click="clearInput" class="clear-button" :disabled="!isAlgorithmAvailable(compressionAlgorithm)">Clear</button>
            <button @click="switchOperation" class="switch-button" 
                    :disabled="!isAlgorithmAvailable(compressionAlgorithm) || !result || result.startsWith('Error:')">
                Switch & {{ operationType === 'compress' ? 'Decompress' : 'Compress' }}
            </button>
        </div>
    </div>

    <div class="result">
        <div class="result-header">
            <div class="result-title">
                <h3>{{ operationType === 'compress' ? 'Compressed Base64:' : 'Decompressed Text:' }}</h3>
                <span v-if="compressionRatio" class="compression-ratio">
                    Size reduction: {{ compressionRatio }}
                </span>
            </div>
            <button v-if="result && !result.startsWith('Error:')" 
                    @click="copyToClipboard(result)" 
                    class="copy-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        <div class="result-container">
            <pre class="result-value" :class="{ 'error': result.startsWith('Error:') }">{{ result || 'No input provided' }}</pre>
        </div>
    </div>

    <div class="info-section">
        <h4>About Compression Algorithms</h4>
        <p>此工具支持多种压缩算法，包括浏览器原生支持和 WebAssembly 实现：</p>
        <ul>
            <li><strong>GZIP</strong>: 最常用的压缩算法，良好的压缩率和广泛支持（浏览器原生）</li>
            <li><strong>Deflate</strong>: 更快的压缩速度，略低的压缩率（浏览器原生）</li>
            <li><strong>Brotli</strong>: Google 开发的现代压缩算法，最高压缩率但速度较慢（浏览器原生）</li>
            <li><strong>ZSTD</strong>: Facebook 开发的现代压缩算法，优秀的压缩率和速度平衡（WebAssembly）</li>
            <li><strong>Snappy</strong>: Google 开发的高速压缩算法，优先考虑速度而非压缩率（纯JavaScript）</li>
            <li><strong>None</strong>: 仅进行Base64编码，不压缩（用于测试）</li>
        </ul>
        <h5>算法特性对比：</h5>
        <div class="comparison-table">
            <div class="table-row header">
                <div>算法</div>
                <div>压缩率</div>
                <div>速度</div>
                <div>使用场景</div>
            </div>
            <div class="table-row">
                <div>GZIP</div>
                <div>高</div>
                <div>中等</div>
                <div>Web传输、文件存储</div>
            </div>
            <div class="table-row">
                <div>Deflate</div>
                <div>中高</div>
                <div>快</div>
                <div>实时压缩</div>
            </div>
            <div class="table-row">
                <div>Brotli</div>
                <div>最高</div>
                <div>慢</div>
                <div>静态资源、文档压缩</div>
            </div>
            <div class="table-row">
                <div>ZSTD</div>
                <div>很高</div>
                <div>很快</div>
                <div>现代应用、数据库</div>
            </div>
            <div class="table-row">
                <div>Snappy</div>
                <div>中等</div>
                <div>极快</div>
                <div>大数据、实时处理</div>
            </div>
        </div>
        <h5>使用场景：</h5>
        <ul>
            <li>减少网络传输的数据量</li>
            <li>压缩存储在浏览器中的数据</li>
            <li>处理API响应的压缩数据</li>
            <li>优化大文本的存储和传输</li>
            <li>大数据处理和分析</li>
        </ul>
        <h5>技术实现：</h5>
        <ul>
            <li><strong>GZIP/Deflate</strong>: 使用浏览器原生 Compression Streams API</li>
            <li><strong>ZSTD</strong>: 使用 @oneidentity/zstd-js WebAssembly 库</li>
            <li><strong>Snappy</strong>: 使用 hysnappy WebAssembly 库（仅解压缩）</li>
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

.warning-section {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
}

.warning-section h4 {
    margin: 0 0 10px 0;
    color: #856404;
}

.warning-section p {
    margin: 0;
    color: #856404;
}

.wasm-status {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.wasm-status h4 {
    margin: 0 0 16px 0;
    color: #2c3e50;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wasm-status h4::before {
    content: "🔧";
    font-size: 20px;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    margin-top: 8px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: #fff;
    border: 2px solid #e9ecef;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-item.available {
    border-color: #28a745;
    background-color: #f8fff9;
}

.status-item.available:hover {
    border-color: #20c997;
    background-color: #f0fff4;
}

.status-item.loading {
    border-color: #ffc107;
    background-color: #fffbf0;
}

.status-item.loading .loading-text {
    font-size: 12px;
    color: #856404;
    margin-left: auto;
    font-style: italic;
}

.status-icon {
    font-size: 18px;
    flex-shrink: 0;
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

.algorithm-options {
    margin-bottom: 20px;
    text-align: center;
}

.select-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #495057;
}

.algorithm-select {
    padding: 6px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    font-size: 14px;
    cursor: pointer;
}

.algorithm-select:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.algorithm-select option:disabled {
    color: #999;
    font-style: italic;
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

.text-input:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
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

.clear-button:hover:not(:disabled) {
    background-color: #f78989;
}

.clear-button:disabled {
    background-color: #c0c4cc;
    cursor: not-allowed;
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

.result-title {
    display: flex;
    align-items: center;
    gap: 15px;
}

.result-title h3 {
    margin: 0;
    font-size: 16px;
    color: #606266;
}

.compression-ratio {
    background-color: #67c23a;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
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

.info-section h5 {
    margin: 15px 0 5px 0;
    color: #2c3e50;
}

.info-section p {
    margin: 0 0 10px 0;
    color: #606266;
    line-height: 1.5;
}

.info-section ul {
    margin: 0 0 10px 0;
    color: #606266;
}

.info-section li {
    margin-bottom: 5px;
}

.comparison-table {
    margin: 10px 0;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #e9ecef;
}

.table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1.5fr;
    gap: 1px;
}

.table-row.header {
    background-color: #409eff;
    color: white;
    font-weight: bold;
}

.table-row.header > div {
    padding: 8px 12px;
    background-color: #409eff;
}

.table-row:not(.header) > div {
    padding: 8px 12px;
    background-color: white;
    border-bottom: 1px solid #f1f1f1;
}

.table-row:not(.header):nth-child(even) > div {
    background-color: #f8f9fa;
}

/* 中等屏幕响应式设计 */
@media (max-width: 1024px) {
    .status-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
    }
    
    .status-item {
        padding: 10px 14px;
        font-size: 13px;
    }
    
    .wasm-status {
        padding: 18px;
    }
}

/* 小屏幕响应式设计 */
@media (max-width: 768px) {
    .converter-container {
        padding: 15px;
    }
    
    .operation-options {
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }
    
    .status-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .status-item {
        padding: 10px 14px;
        font-size: 13px;
    }
    
    .status-icon {
        font-size: 16px;
    }
    
    .wasm-status {
        padding: 16px;
        margin-bottom: 20px;
    }
    
    .wasm-status h4 {
        font-size: 16px;
        margin-bottom: 12px;
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
    
    .result-title {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }
    
    .table-row {
        grid-template-columns: 1fr;
        gap: 0;
    }
    
    .table-row > div {
        padding: 6px 8px;
        border-bottom: 1px solid #e9ecef;
    }
    
    .table-row.header > div:before {
        content: attr(data-label) ': ';
        font-weight: normal;
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

/* 错误提示样式 */
.error-text {
    color: #dc3545;
    font-size: 11px;
    font-style: italic;
}

.loading-text {
    color: #6c757d;
    font-size: 11px;
    font-style: italic;
}

.status-item.available {
    color: #28a745;
}

.status-item:not(.available) {
    color: #6c757d;
}

.status-item.loading {
    color: #ffc107;
}

.result-value::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
