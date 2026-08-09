// middleware.ts
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

export default NextAuth(authConfig).auth

export const config = {
  // Ignora api, static, image, favicon e TODAS as extensões de imagem/mídia (.webp, .png, .jpg, .svg, etc.)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
