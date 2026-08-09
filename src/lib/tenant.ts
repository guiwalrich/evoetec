// src/lib/tenant.ts
import { prisma } from "@/lib/prisma"

/**
 * Utilitário para garantir isolamento Multi-Tenant em consultas Prisma
 */
export function withTenant(empresaId: string) {
  if (!empresaId) {
    throw new Error("Multi-Tenant Error: empresaId é obrigatório para realizar operações no banco de dados.")
  }

  return {
    /**
     * Adiciona o filtro de empresaId e ignora registros com soft delete (deletedAt)
     */
    whereTenant<T extends Record<string, any>>(whereClause?: T) {
      return {
        ...whereClause,
        empresaId,
        deletedAt: null,
      }
    },

    /**
     * Injeta automaticamente empresaId na criação de registros
     */
    dataTenant<T extends Record<string, any>>(data: T) {
      return {
        ...data,
        empresaId,
      }
    },
  }
}
