// middleware.ts
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

export default NextAuth(authConfig).auth

// Exclui imagens estáticas (png, jpg, jpeg, gif, webp, svg, ico) do matcher.
// Assim a logo pode ser carregada mesmo quando o usuário ainda não está autenticado.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|webp|svg|ico)$).*)"
  ]
}
