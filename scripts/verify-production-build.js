#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 检查生产构建是否包含调试代码
function checkProductionBuild() {
    const distDir = path.join(__dirname, '../dist')

    if (!fs.existsSync(distDir)) {
        console.error('❌ dist 目录不存在，请先运行 npm run build')
        process.exit(1)
    }

    // 检查所有 JS 文件
    const jsFiles = fs.readdirSync(path.join(distDir, 'assets'))
        .filter(file => file.endsWith('.js'))

    let hasDebugCode = false
    const debugPatterns = [
        /console\.log.*调试/,
        /测试ZSTD/,
        /测试Snappy/,
        /强制重新加载/,
        /debug-section/,
        /WASM库调试/
    ]

    for (const file of jsFiles) {
        const filePath = path.join(distDir, 'assets', file)
        const content = fs.readFileSync(filePath, 'utf8')

        for (const pattern of debugPatterns) {
            if (pattern.test(content)) {
                console.warn(`⚠️  在 ${file} 中发现可能的调试代码: ${pattern}`)
                hasDebugCode = true
            }
        }
    }

    // 检查 HTML 文件中是否包含调试相关内容
    const htmlPath = path.join(distDir, 'index.html')
    if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8')
        if (htmlContent.includes('debug-section') || htmlContent.includes('开发环境')) {
            console.warn('⚠️  HTML 文件中发现调试相关内容')
            hasDebugCode = true
        }
    }

    if (hasDebugCode) {
        console.log('⚠️  生产构建中发现调试代码，请检查环境变量配置')
        console.log('📋 这可能是正常的，如果调试代码被正确的环境条件包围')
    } else {
        console.log('✅ 生产构建验证通过，未发现明显的调试代码')
    }

    // 显示构建文件信息
    console.log('\n📁 构建文件列表:')
    const allFiles = fs.readdirSync(distDir, { recursive: true })
    allFiles.forEach(file => {
        const filePath = path.join(distDir, file)
        const stats = fs.statSync(filePath)
        if (stats.isFile()) {
            const sizeKB = (stats.size / 1024).toFixed(2)
            console.log(`   ${file} (${sizeKB} KB)`)
        }
    })
}

checkProductionBuild()
