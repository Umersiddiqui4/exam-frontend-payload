import { useState, useEffect } from "react"

type PreviewResult = {
  previewUrl: string | null
  error: string | null
  validateAndSet: (file: File) => boolean
}

export function useFilePreview(): PreviewResult {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const validateAndSet = (file: File): boolean => {
    setError(null)

    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Invalid file format. Only PNG and JPG formats are supported.")
      return false
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size exceeds 2MB limit. Please choose a smaller file.")
      return false
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))

    return true
  }

  return { previewUrl, error, validateAndSet }
}
