// src/lib/integrations/brasilapi.ts

export async function buscarCnpj(cnpj: string) {
  const cleanCnpj = cnpj.replace(/\D/g, "")
  if (cleanCnpj.length !== 14) return null
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      razaoSocial: data.razao_social || "",
      nomeFantasia: data.nome_fantasia || data.razao_social || "",
      telefone: data.ddd_telefone_1 || "",
      logradouro: `${data.logradouro || ""}, ${data.numero || "S/N"}`.trim(),
      bairro: data.bairro || "",
      cidade: data.municipio || "",
      uf: data.uf || "",
      enderecoCompleto: [
        `${data.logradouro || ""}, ${data.numero || "S/N"}`.trim(),
        data.bairro,
        data.municipio,
        data.uf,
      ]
        .filter(Boolean)
        .join(", "),
    }
  } catch {
    return null
  }
}
