// src/app/api/upload/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { validarUploadImagem } from "@/lib/upload-validator"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

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

    // Garantir que a pasta public/uploads existe
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    // Gerar nome único e seguro para o arquivo
    const ext = file.name.split(".").pop() || "png"
    const fileName = `produto-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)
    const url = `/uploads/${fileName}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error("Erro no upload de imagem:", error)
    return NextResponse.json({ message: "Erro ao processar imagem." }, { status: 500 })
  }
}
