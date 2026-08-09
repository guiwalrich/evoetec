// src/lib/upload-validator.ts

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validarUploadImagem(file: { type: string; size: number }): ValidationResult {
  if (!file) {
    return { valid: false, error: "Nenhum arquivo enviado." }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Formato de arquivo inválido (${file.type}). Tipos permitidos: JPG, PNG, WEBP.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `O arquivo excede o limite máximo permitido de 5MB. Tamanho do arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    }
  }

  return { valid: true }
}
