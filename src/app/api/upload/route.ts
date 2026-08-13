// src/app/api/upload/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { validarUploadImagem } from "@/lib/upload-validator"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "Nenhum arquivo enviado." }, { status: 400 })
    }

    // Validação OWASP de Mídia e Tamanho (max 5MB)
    const validacao = validarUploadImagem(file)
    if (!validacao.valid) {
      return NextResponse.json({ message: validacao.error }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload para Cloudinary (retorna URL pública permanente)
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "evoetec/produtos",
            resource_type: "image",
            transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
          },
          (error, result) => {
            if (error || !result) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({ url: result.secure_url }, { status: 201 })
  } catch (error) {
    console.error("Erro no upload de imagem:", error)
    return NextResponse.json({ message: "Erro ao processar imagem." }, { status: 500 })
  }
}
