// scratch/seed_dono_fake_data.ts
import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function seedFakeDataDono() {
  console.log("🚀 Iniciando povoamento de dados reais/demonstrativos para a Conta do Dono...")

  // 1. Garantir que a empresa do Dono exista
  let empresa = await prisma.empresa.findFirst({
    where: { nomeFantasia: "Assistência Técnica Evo Etec (Dono)" },
  })

  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        nomeFantasia: "Assistência Técnica Evo Etec (Dono)",
        razaoSocial: "Evo Etec Gestão & Tecnologia LTDA",
        cnpj: "00.000.000/0001-99",
        telefone: "(11) 99999-9999",
        endereco: "Av. Paulista, 1000 - São Paulo, SP",
        statusAssinatura: "ATIVO",
      },
    })
  }

  // 2. Garantir o Usuário Dono com Avatar Pixel Art
  const senhaHash = await bcrypt.hash("dono123456", 10)
  const dono = await prisma.usuario.upsert({
    where: { email: "dono@evoetec.com.br" },
    update: {
      nome: "Lucas Mendes (Técnico Master)",
      senha: senhaHash,
      role: "ADMIN",
      emailVerificado: true,
      avatarId: 1,
      empresaId: empresa.id,
    },
    create: {
      nome: "Lucas Mendes (Técnico Master)",
      email: "dono@evoetec.com.br",
      senha: senhaHash,
      role: "ADMIN",
      emailVerificado: true,
      avatarId: 1,
      empresaId: empresa.id,
    },
  })

  const empresaId = empresa.id
  const tecnicoId = dono.id

  // 3. Povoar Categorias (se ainda não existirem)
  const catPecas = await prisma.categoria.findFirst({ where: { empresaId, nome: "Peças de Reparo" } }) ||
    await prisma.categoria.create({ data: { nome: "Peças de Reparo", ordem: 1, empresaId } })

  const catAcessorios = await prisma.categoria.findFirst({ where: { empresaId, nome: "Acessórios & Cabos" } }) ||
    await prisma.categoria.create({ data: { nome: "Acessórios & Cabos", ordem: 2, empresaId } })

  const catFerramentas = await prisma.categoria.findFirst({ where: { empresaId, nome: "Ferramentas de Bancada" } }) ||
    await prisma.categoria.create({ data: { nome: "Ferramentas de Bancada", ordem: 3, empresaId } })

  const catCapas = await prisma.categoria.findFirst({ where: { empresaId, nome: "Capas & Películas" } }) ||
    await prisma.categoria.create({ data: { nome: "Capas & Películas", ordem: 4, empresaId } })

  console.log("✔ Categorias confirmadas!")

  // 4. Povoar Fornecedores (se ainda não existirem)
  const forn1 = await prisma.fornecedor.findFirst({ where: { empresaId, nome: "Atacadão das Peças SP" } }) ||
    await prisma.fornecedor.create({
      data: {
        nome: "Atacadão das Peças SP",
        cpfCnpj: "12.345.678/0001-90",
        telefone: "(11) 98888-7777",
        email: "vendas@atacadaodepecas.com.br",
        endereco: "Rua Santa Ifigênia, 250 - São Paulo, SP",
        empresaId,
      },
    })

  const forn2 = await prisma.fornecedor.findFirst({ where: { empresaId, nome: "Distribuidora Importadora Mobile" } }) ||
    await prisma.fornecedor.create({
      data: {
        nome: "Distribuidora Importadora Mobile",
        cpfCnpj: "98.765.432/0001-10",
        telefone: "(11) 97777-6666",
        email: "contato@mobileimport.com.br",
        endereco: "Av. Celso Garcia, 1500 - São Paulo, SP",
        empresaId,
      },
    })

  console.log("✔ Fornecedores confirmados!")

  // 5. Povoar Produtos & Peças (Com estoque e preços reais)
  const p3 = await prisma.produto.findFirst({ where: { empresaId, codigoBarras: "78910003" } }) ||
    await prisma.produto.create({
      data: {
        nome: "Película 3D Privacidade Vidro Temperado",
        descricao: "Película com filtro anti-espião e acabamento oleofóbico premium.",
        codigoBarras: "78910003",
        precoCompra: 5.50,
        precoVenda: 35.00,
        quantidadeEstoque: 45,
        estoqueMinimo: 10,
        categoriaId: catCapas.id,
        empresaId,
      },
    })

  const p4 = await prisma.produto.findFirst({ where: { empresaId, codigoBarras: "78910004" } }) ||
    await prisma.produto.create({
      data: {
        nome: "Carregador Turbo Power 30W USB-C Anker",
        descricao: "Carregador rápido homologado para iPhone e Android com tecnologia GaN.",
        codigoBarras: "78910004",
        precoCompra: 45.00,
        precoVenda: 120.00,
        quantidadeEstoque: 15,
        estoqueMinimo: 4,
        categoriaId: catAcessorios.id,
        empresaId,
      },
    })

  console.log("✔ Produtos & Peças confirmados!")

  // 6. Povoar Clientes (se não existirem)
  const cli1 = await prisma.cliente.findFirst({ where: { empresaId, cpfCnpj: "345.678.901-22" } }) ||
    await prisma.cliente.create({
      data: {
        nome: "Carlos Eduardo Silva",
        cpfCnpj: "345.678.901-22",
        telefone: "(11) 99123-4567",
        email: "carlos.silva@gmail.com",
        endereco: "Rua Augusta, 450 - Consolação, SP",
        empresaId,
      },
    })

  console.log("✔ Clientes confirmados!")

  // 7. Povoar Vendas no Balcão (PDV)
  const venda1 = await prisma.venda.create({
    data: {
      numero: "VENDA-2001",
      subtotal: 155.00,
      desconto: 10.00,
      valorTotal: 145.00,
      status: "CONCLUIDA",
      clienteId: cli1.id,
      vendedorId: tecnicoId,
      empresaId,
    },
  })

  await prisma.vendaItem.create({
    data: {
      vendaId: venda1.id,
      produtoId: p4.id,
      quantidade: 1,
      valorUnitario: 120.00,
      desconto: 0.00,
      valorTotal: 120.00,
    },
  })

  await prisma.vendaItem.create({
    data: {
      vendaId: venda1.id,
      produtoId: p3.id,
      quantidade: 1,
      valorUnitario: 35.00,
      desconto: 10.00,
      valorTotal: 25.00,
    },
  })

  console.log("✔ Venda no Balcão PDV registrada!")

  // 8. Povoar Lançamentos Financeiros (DRE / Fluxo de Caixa)
  await prisma.contaFinanceira.create({
    data: {
      descricao: "Recebimento OS-1047 (Troca de Bateria S23 Ultra)",
      tipo: "RECEITA",
      categoria: "SERVICO",
      valor: 430.00,
      status: "PAGO",
      dataVencimento: new Date(),
      dataPagamento: new Date(),
      empresaId,
    },
  })

  await prisma.contaFinanceira.create({
    data: {
      descricao: "Venda Balcão VENDA-2001 (Carregador + Película)",
      tipo: "RECEITA",
      categoria: "VENDA",
      valor: 145.00,
      status: "PAGO",
      dataVencimento: new Date(),
      dataPagamento: new Date(),
      empresaId,
    },
  })

  await prisma.contaFinanceira.create({
    data: {
      descricao: "Compra de Peças - Atacadão das Peças SP",
      tipo: "DESPESA",
      categoria: "FORNECEDOR",
      valor: 570.00,
      status: "PAGO",
      dataVencimento: new Date(),
      dataPagamento: new Date(),
      fornecedorId: forn1.id,
      empresaId,
    },
  })

  console.log("--------------------------------------------------")
  console.log("✨ SISTEMA ALIMENTADO COM SUCESSO PARA O SEU VÍDEO!")
  console.log("Dono: dono@evoetec.com.br")
  console.log("Empresa: Assistência Técnica Evo Etec (Dono)")
  console.log("--------------------------------------------------")
}

seedFakeDataDono()
  .catch((e) => {
    console.error("Erro no povoamento:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
