// src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname
      const isAuthRoute = pathname.startsWith("/login") || 
                          pathname.startsWith("/registro") || 
                          pathname.startsWith("/verificar-email") || 
                          pathname.startsWith("/esqueci-senha") ||
                          pathname.startsWith("/redefinir-senha")

      const isPublicRoute = pathname === "/" || pathname.startsWith("/catalogo")

      if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
        return false // Redireciona para /login automaticamente
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
  providers: [], // Provedores pesados (Prisma/Credentials) ficam no auth.ts
} satisfies NextAuthConfig
