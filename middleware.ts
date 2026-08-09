// middleware.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthRoute = pathname.startsWith("/login") || 
                      pathname.startsWith("/registro") || 
                      pathname.startsWith("/esqueci-senha") ||
                      pathname.startsWith("/redefinir-senha")

  const isPublicRoute = pathname === "/" || pathname.startsWith("/catalogo")

  // Se não estiver logado e tentar acessar rota protegida
  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Se já estiver logado e tentar acessar tela de login/registro
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
