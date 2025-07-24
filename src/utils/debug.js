// 开发环境专用的调试工具
export const createDebugFunctions = (zstdLib, snappyLib, zstdLoading, snappyLoading, initWasmLibs) => {
    const debugZstd = async () => {
        console.log('=== ZSTD 调试开始 ===')
        console.log('zstdLib.value:', zstdLib.value)
        console.log('zstdLoading.value:', zstdLoading.value)

        if (zstdLib.value) {
            try {
                const testData = new TextEncoder().encode('Hello ZSTD!')
                console.log('测试数据:', testData)

                if (typeof zstdLib.value.compress === 'function') {
                    const compressed = zstdLib.value.compress(testData, 10)
                    console.log('压缩成功:', compressed)

                    if (typeof zstdLib.value.decompress === 'function') {
                        const decompressed = zstdLib.value.decompress(compressed)
                        const result = new TextDecoder().decode(decompressed)
                        console.log('解压成功:', result)
                        alert(`ZSTD测试成功！原文: "Hello ZSTD!" -> 压缩后: ${compressed.length} bytes -> 解压后: "${result}"`)
                    } else {
                        console.error('ZSTD decompress 方法不存在')
                        alert('ZSTD decompress 方法不存在')
                    }
                } else {
                    console.error('ZSTD compress 方法不存在')
                    alert('ZSTD compress 方法不存在')
                }
            } catch (e) {
                console.error('ZSTD测试失败:', e)
                alert('ZSTD测试失败: ' + e.message)
            }
        } else {
            alert('ZSTD库未加载')
        }
        console.log('=== ZSTD 调试结束 ===')
    }

    const debugSnappy = async () => {
        console.log('=== Snappy 调试开始 ===')
        console.log('snappyLib.value:', snappyLib.value)
        console.log('snappyLoading.value:', snappyLoading.value)

        if (snappyLib.value) {
            try {
                const testData = 'Hello Snappy!'
                console.log('测试数据:', testData)

                if (typeof snappyLib.value.compress === 'function') {
                    const compressed = snappyLib.value.compress(testData)
                    console.log('压缩成功:', compressed)

                    if (typeof snappyLib.value.uncompress === 'function') {
                        const decompressed = snappyLib.value.uncompress(compressed, 'text')
                        console.log('解压成功:', decompressed)
                        alert(`Snappy测试成功！原文: "${testData}" -> 压缩后: ${compressed.length} bytes -> 解压后: "${decompressed}"`)
                    } else {
                        console.error('Snappy uncompress 方法不存在')
                        alert('Snappy uncompress 方法不存在')
                    }
                } else {
                    console.error('Snappy compress 方法不存在')
                    alert('Snappy compress 方法不存在')
                }
            } catch (e) {
                console.error('Snappy测试失败:', e)
                alert('Snappy测试失败: ' + e.message)
            }
        } else {
            alert('Snappy库未加载')
        }
        console.log('=== Snappy 调试结束 ===')
    }

    const forceReload = async () => {
        console.log('=== 强制重新加载 ===')
        zstdLib.value = null
        snappyLib.value = null
        zstdLoading.value = true
        snappyLoading.value = true

        await initWasmLibs()
    }

    return { debugZstd, debugSnappy, forceReload }
}

// 开发环境调试组件数据
export const debugSectionConfig = {
    title: 'WASM库调试',
    buttons: [
        { text: '测试ZSTD', action: 'debugZstd', style: 'margin-right: 10px; padding: 5px 10px; background: #007acc; color: white; border: none; border-radius: 3px;' },
        { text: '测试Snappy', action: 'debugSnappy', style: 'margin-right: 10px; padding: 5px 10px; background: #007acc; color: white; border: none; border-radius: 3px;' },
        { text: '强制重新加载', action: 'forceReload', style: 'padding: 5px 10px; background: #ff6b35; color: white; border: none; border-radius: 3px;' }
    ]
}
