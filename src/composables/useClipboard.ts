import { ref } from 'vue'

const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useClipboard() {
  async function copyToClipboard(text: string, label: string = '密钥') {
    try {
      await navigator.clipboard.writeText(text)
      showToast(`${label} 已复制到剪贴板`)
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast(`${label} 已复制到剪贴板`)
    }
  }

  function showToast(message: string) {
    if (toastTimer) clearTimeout(toastTimer)
    toastMessage.value = message
    toastVisible.value = true
    toastTimer = setTimeout(() => {
      toastVisible.value = false
    }, 2000)
  }

  return { copyToClipboard, toastMessage, toastVisible }
}
