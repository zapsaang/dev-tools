export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        const buttons = document.querySelectorAll('.copy-button')
        buttons.forEach(button => {
            const originalColor = button.style.borderColor
            button.style.borderColor = '#67c23a'
            setTimeout(() => {
                button.style.borderColor = originalColor
            }, 1000)
        })
    } catch (err) {
        console.error('Failed to copy text:', err)
    }
}