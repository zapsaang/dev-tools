// 构建配置
export const BUILD_CONFIG = {
    // 在构建时这个值会被替换
    DEBUG_ENABLED: import.meta.env.DEV,
    PRODUCTION: import.meta.env.PROD
}
