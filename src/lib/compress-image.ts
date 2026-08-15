// src/lib/compress-image.ts
/**
 * Utilitário de compressão de imagem no front-end para otimização de upload no Cloudinary.
 * Reduz a resolução máxima para 1920px e comprime a qualidade em JPEG para manter o tamanho abaixo de ~300KB.
 */
export async function comprimirImagemFront(file: File, maxDimension = 1920, quality = 0.82): Promise<File> {
  // Se o arquivo for menor que 250KB e for imagem, não precisa comprimir
  if (file.size <= 250 * 1024 && file.type.startsWith("image/")) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    reader.onerror = (err) => reject(err)

    img.onload = () => {
      let width = img.width
      let height = img.height

      // Redimensionar proporcionalmente se exceder a dimensão máxima
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        return resolve(file)
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file)
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          )

          resolve(compressedFile)
        },
        "image/jpeg",
        quality
      )
    }

    img.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
