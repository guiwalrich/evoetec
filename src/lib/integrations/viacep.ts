// src/lib/integrations/viacep.ts

export interface EnderecoCepResult {
  logradouro: string
  bairro: string
  cidade: string
  uf: string
  enderecoCompleto: string
}

export function mascararCep(valor: string): string {
  const limpo = valor.replace(/\D/g, "")
  if (limpo.length <= 5) return limpo
  return `${limpo.slice(0, 5)}-${limpo.slice(5, 8)}`
}

export async function buscarCep(cep: string): Promise<EnderecoCepResult | null> {
  const cleanCep = cep.replace(/\D/g, "")
  if (cleanCep.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await res.json()
    if (!data || data.erro) return null

    const logradouro = data.logradouro || ""
    const bairro = data.bairro || ""
    const cidade = data.localidade || ""
    const uf = data.uf || ""

    const partes = [logradouro, bairro, cidade ? `${cidade} - ${uf}` : uf].filter(Boolean)

    return {
      logradouro,
      bairro,
      cidade,
      uf,
      enderecoCompleto: partes.join(", "),
    }
  } catch {
    return null
  }
}
