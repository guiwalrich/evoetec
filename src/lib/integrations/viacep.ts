// src/lib/integrations/viacep.ts

export async function buscarCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, "")
  if (cleanCep.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      uf: data.uf || "",
      enderecoCompleto: [data.logradouro, data.bairro, data.localidade, data.uf]
        .filter(Boolean)
        .join(", "),
    }
  } catch {
    return null
  }
}
