/** 將 File 轉為 pdfmake 可用的 data URL base64 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('讀取檔案失敗'))
    reader.readAsDataURL(file)
  })
}

/** 將圖片置中裁切為 9:16（直向），輸出 JPEG data URL（供網站／PDF 一致顯示） */
export async function fileTo9x16DataUrl(
  file: File,
  outputHeight = 1280
): Promise<string> {
  const source = await fileToDataUrl(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const targetRatio = 9 / 16
      let sx = 0
      let sy = 0
      let sw = img.width
      let sh = img.height
      const srcRatio = img.width / img.height

      if (srcRatio > targetRatio) {
        sw = img.height * targetRatio
        sx = (img.width - sw) / 2
      } else if (srcRatio < targetRatio) {
        sh = img.width / targetRatio
        sy = (img.height - sh) / 2
      }

      const outputWidth = Math.round((outputHeight * 9) / 16)
      const canvas = document.createElement('canvas')
      canvas.width = outputWidth
      canvas.height = outputHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('無法建立 canvas'))
        return
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.onerror = () => reject(new Error('載入圖片失敗'))
    img.src = source
  })
}

/** 將 ArrayBuffer 轉為 base64（分塊避免堆疊溢出） */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}
