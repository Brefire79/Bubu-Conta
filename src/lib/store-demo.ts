import type { Bill, BillStatus, BillWithStatus, Profile, NewBill, Categoria, House } from '../types'
import { CATEGORIA_MAP } from '../types'

const DEMO_USER: Profile = {
  id: 'demo-user-001',
  name: 'Breno',
  house_id: 'demo-house-001',
}

const DEMO_MEMBERS: Profile[] = [
  DEMO_USER,
  { id: 'demo-user-002', name: 'Luana', house_id: 'demo-house-001' },
]

const DEMO_HOUSE: House = {
  id: 'demo-house-001',
  invite_code: 'BUBU123',
  owner_id: DEMO_USER.id,
  members: DEMO_MEMBERS,
}

function generateId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthName(ym: string) {
  const nomes = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ]
  const [ano, mes] = ym.split('-').map(Number)
  return `${nomes[mes - 1]} de ${ano}`
}

function parseYM(ym: string) {
  const [ano, mes] = ym.split('-').map(Number)
  return { ano, mes }
}

function formatYM(ano: number, mes: number) {
  return `${ano}-${String(mes).padStart(2, '0')}`
}

function getVencimentoDay(bill: Bill, mesReferencia: string) {
  const { ano, mes } = parseYM(mesReferencia)
  const ultimoDia = new Date(ano, mes, 0).getDate()
  return Math.min(bill.vencimento, ultimoDia)
}

function isOverdue(vencimento: number, mesReferencia: string) {
  const hoje = new Date()
  const { ano, mes } = parseYM(mesReferencia)
  const ultimoDia = new Date(ano, mes, 0).getDate()
  const dataVenc = new Date(ano, mes - 1, Math.min(vencimento, ultimoDia))
  const hojeInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return dataVenc < hojeInicio
}

function isCurrentOrPastMonth(ym: string) {
  return ym <= getCurrentMonth()
}

class DemoStore {
  private bills: Bill[] = []
  private billStatuses: BillStatus[] = []
  private members: Profile[] = [...DEMO_MEMBERS]
  private currentUser: Profile = DEMO_USER

  constructor() {
    this.load()
  }

  private load() {
    try {
      const raw = localStorage.getItem('bubu-demo')
      if (raw) {
        const data = JSON.parse(raw)
        this.bills = data.bills ?? []
        this.billStatuses = data.billStatuses ?? []
        this.members = data.members ?? [...DEMO_MEMBERS]
      }
    } catch { /* ignore */ }

    if (this.bills.length === 0) {
      this.seed()
    }
  }

  private save() {
    localStorage.setItem('bubu-demo', JSON.stringify({
      bills: this.bills,
      billStatuses: this.billStatuses,
      members: this.members,
    }))
  }

  private seed() {
    const agora = new Date()
    const mesAtual = getCurrentMonth()
    const [ano, mes] = mesAtual.split('-').map(Number)
    const mesAnterior = formatYM(ano - (mes === 1 ? 1 : 0), mes === 1 ? 12 : mes - 1)

    const billsData: [string, number, number, Categoria, 'mensal' | 'anual' | 'parcelada', number | null, number | null][] = [
      ['Aluguel', 1500, 5, 'aluguel', 'mensal', null, null],
      ['Luz', 187.50, 10, 'luz', 'mensal', null, null],
      ['Internet', 119.90, 15, 'internet', 'mensal', null, null],
      ['Água', 98.30, 8, 'agua', 'mensal', null, null],
      ['Streaming', 45.90, 20, 'streaming', 'mensal', null, null],
      ['Condomínio', 450, 5, 'condominio', 'mensal', null, null],
      ['Curso Online', 299.90, 10, 'educacao', 'parcelada', 6, 3],
      ['IPTU', 1800, 10, 'iptu', 'anual', null, null],
    ]

    const createdBills: Bill[] = billsData.map(([nome, valor, vencimento, categoria, tipo, parcelas, parcelaAtual]) => ({
      id: generateId(),
      house_id: DEMO_HOUSE.id,
      nome,
      valor,
      categoria,
      vencimento,
      tipo,
      parcelas,
      parcela_atual: parcelaAtual,
      created_by: DEMO_USER.id,
      ativo: true,
      created_at: agora.toISOString(),
      updated_at: agora.toISOString(),
    }))

    const statuses: BillStatus[] = []

    createdBills.forEach((bill, i) => {
      statuses.push({
        id: generateId(),
        bill_id: bill.id,
        mes_referencia: mesAnterior,
        pago: i < 4,
        pago_por: i < 2 ? DEMO_USER.id : 'demo-user-002',
        pago_em: i < 4 ? new Date(agora.getTime() - 15 * 86400000).toISOString() : undefined,
        transferida: false,
      })
      statuses.push({
        id: generateId(),
        bill_id: bill.id,
        mes_referencia: mesAtual,
        pago: i === 0 || i === 2,
        pago_por: i === 0 ? DEMO_USER.id : (i === 2 ? 'demo-user-002' : undefined),
        pago_em: i === 0 || i === 2 ? new Date(agora.getTime() - 2 * 86400000).toISOString() : undefined,
        transferida: false,
      })
    })

    this.bills = createdBills
    this.billStatuses = statuses
    this.save()
  }

  getBillsForMonth(mesReferencia: string): BillWithStatus[] {
    return this.bills
      .filter(b => b.ativo)
      .map(bill => {
        let st = this.billStatuses.find(
          s => s.bill_id === bill.id && s.mes_referencia === mesReferencia
        )
        if (!st && isCurrentOrPastMonth(mesReferencia)) {
          st = {
            id: generateId(),
            bill_id: bill.id,
            mes_referencia: mesReferencia,
            pago: false,
            transferida: false,
          }
          this.billStatuses.push(st)
          this.save()
        }
        const pago = st?.pago ?? false
        const vencDia = getVencimentoDay(bill, mesReferencia)
        const atrasado = !pago && isOverdue(vencDia, mesReferencia) && isCurrentOrPastMonth(mesReferencia)
        return {
          ...bill,
          status: st,
          status_enum: (pago ? 'pago' : (atrasado ? 'atrasado' : 'pendente')) as BillWithStatus['status_enum'],
        } as BillWithStatus
      })
      .sort((a, b) => {
        if (a.status_enum === 'atrasado' && b.status_enum !== 'atrasado') return -1
        if (a.status_enum !== 'atrasado' && b.status_enum === 'atrasado') return 1
        if (a.status_enum === 'pago' && b.status_enum !== 'pago') return 1
        if (a.status_enum !== 'pago' && b.status_enum === 'pago') return -1
        return a.vencimento - b.vencimento
      })
  }

  getPendingBills(): BillWithStatus[] {
    const mesAtual = getCurrentMonth()
    return this.getBillsForMonth(mesAtual).filter(b => b.status_enum !== 'pago')
  }

  createBill(data: NewBill): Bill {
    const bill: Bill = {
      id: generateId(),
      house_id: DEMO_HOUSE.id,
      nome: data.nome,
      valor: data.valor,
      categoria: data.categoria,
      vencimento: data.vencimento,
      tipo: data.tipo,
      parcelas: data.parcelas ?? null,
      parcela_atual: data.tipo === 'parcelada' ? 1 : null,
      created_by: this.currentUser.id,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.bills.push(bill)

    const mesAtual = getCurrentMonth()
    this.billStatuses.push({
      id: generateId(),
      bill_id: bill.id,
      mes_referencia: mesAtual,
      pago: false,
      transferida: false,
    })
    this.save()
    return bill
  }

  updateBill(id: string, data: Partial<Bill>): Bill {
    const idx = this.bills.findIndex(b => b.id === id)
    if (idx === -1) throw new Error('Conta não encontrada')
    this.bills[idx] = { ...this.bills[idx], ...data, updated_at: new Date().toISOString() }
    this.save()
    return this.bills[idx]
  }

  deleteBill(id: string) {
    const idx = this.bills.findIndex(b => b.id === id)
    if (idx > -1) {
      this.bills[idx].ativo = false
      this.save()
    }
  }

  markPaid(id: string, mesReferencia: string) {
    let st = this.billStatuses.find(s => s.bill_id === id && s.mes_referencia === mesReferencia)
    if (!st) {
      st = {
        id: generateId(),
        bill_id: id,
        mes_referencia: mesReferencia,
        pago: false,
        transferida: false,
      }
      this.billStatuses.push(st)
    }
    st.pago = true
    st.pago_por = this.currentUser.id
    st.pago_em = new Date().toISOString()
    st.transferida = false
    this.save()
  }

  markUnpaid(id: string, mesReferencia: string) {
    const st = this.billStatuses.find(s => s.bill_id === id && s.mes_referencia === mesReferencia)
    if (st) {
      st.pago = false
      st.pago_por = undefined
      st.pago_em = undefined
      this.save()
    }
  }

  transferToNextMonth(id: string, mesReferencia: string) {
    const st = this.billStatuses.find(s => s.bill_id === id && s.mes_referencia === mesReferencia)
    if (st) {
      st.transferida = true
    }
    const { ano, mes } = parseYM(mesReferencia)
    const proxMes = mes === 12 ? formatYM(ano + 1, 1) : formatYM(ano, mes + 1)
    const nextSt = this.billStatuses.find(s => s.bill_id === id && s.mes_referencia === proxMes)
    if (!nextSt) {
      this.billStatuses.push({
        id: generateId(),
        bill_id: id,
        mes_referencia: proxMes,
        pago: false,
        transferida: false,
      })
    }
    this.save()
  }

  getHistory(): { mes: string; nome: string; total: number; pago: number; pendente: number; contas: BillWithStatus[] }[] {
    const meses = [...new Set(this.billStatuses.map(s => s.mes_referencia))].sort()
    return meses.map(m => {
      const contas = this.getBillsForMonth(m)
      const pago = contas.filter(c => c.status_enum === 'pago').reduce((s, c) => s + c.valor, 0)
      const pendente = contas.filter(c => c.status_enum !== 'pago').reduce((s, c) => s + c.valor, 0)
      return {
        mes: m,
        nome: getMonthName(m),
        total: pago + pendente,
        pago,
        pendente,
        contas,
      }
    }).reverse()
  }

  getHouse(): House {
    return { ...DEMO_HOUSE, members: this.members }
  }
  getMembers() { return this.members }

  addMember(nome: string): Profile {
    const member: Profile = {
      id: generateId(),
      name: nome.trim(),
      house_id: DEMO_HOUSE.id,
    }
    this.members.push(member)
    this.save()
    return member
  }

  removeMember(id: string) {
    if (id === this.currentUser.id) throw new Error('Não dá pra remover você mesmo')
    this.members = this.members.filter(m => m.id !== id)
    this.save()
  }

  getUser() { return this.currentUser }
  async signIn(_email: string, _password: string) {
    return this.currentUser
  }
  async signUp(_email: string, _password: string, name: string) {
    this.currentUser = { ...this.currentUser, name }
    return this.currentUser
  }
  signOut() { this.currentUser = DEMO_USER }
}

export const store = new DemoStore()
