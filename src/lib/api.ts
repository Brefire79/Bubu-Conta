import { USE_DEMO } from './supabase'
import { supabaseStore } from './store-supabase'
import { store } from './store-demo'
import type { Bill, BillWithStatus, House, MonthSummary, NewBill, Profile, Receipt } from '../types'
import { getMonthName } from './dates'

async function demoHistory(): Promise<MonthSummary[]> {
  return store.getHistory()
}

async function supabaseHistory(): Promise<MonthSummary[]> {
  const meses = await supabaseStore.getMonths()
  const summaries = await Promise.all(meses.map(async mes => {
    const contas = await supabaseStore.getBillsForMonth(mes)
    const pago = contas.filter(c => c.status_enum === 'pago').reduce((s, c) => s + c.valor, 0)
    const pendente = contas.filter(c => c.status_enum !== 'pago').reduce((s, c) => s + c.valor, 0)
    return { mes, nome: getMonthName(mes), total: pago + pendente, pago, pendente, contas }
  }))
  return summaries.reverse()
}

export const api = {
  demo: USE_DEMO,

  async getSessionUser(): Promise<Profile | null> {
    return USE_DEMO ? store.getUser() : supabaseStore.getSessionUser()
  },

  async signIn(email: string, senha: string): Promise<Profile> {
    return USE_DEMO ? store.signIn(email, senha) : supabaseStore.signIn(email, senha)
  },

  async signUp(email: string, senha: string, nome: string): Promise<Profile | null> {
    return USE_DEMO ? store.signUp(email, senha, nome) : supabaseStore.signUp(email, senha, nome)
  },

  async signOut() {
    return USE_DEMO ? store.signOut() : supabaseStore.signOut()
  },

  async getBillsForMonth(mes: string): Promise<BillWithStatus[]> {
    return USE_DEMO ? store.getBillsForMonth(mes) : supabaseStore.getBillsForMonth(mes)
  },

  async createBill(data: NewBill) {
    if (USE_DEMO) { store.createBill(data); return }
    await supabaseStore.createBill(data)
  },

  async updateBill(id: string, data: Partial<Bill>) {
    if (USE_DEMO) { store.updateBill(id, data); return }
    await supabaseStore.updateBill(id, data)
  },

  async deleteBill(id: string) {
    if (USE_DEMO) { store.deleteBill(id); return }
    await supabaseStore.deleteBill(id)
  },

  async markPaid(id: string, mes: string) {
    if (USE_DEMO) { store.markPaid(id, mes); return }
    await supabaseStore.markPaid(id, mes)
  },

  async markUnpaid(id: string, mes: string) {
    if (USE_DEMO) { store.markUnpaid(id, mes); return }
    await supabaseStore.markUnpaid(id, mes)
  },

  async transferToNextMonth(id: string, mes: string) {
    if (USE_DEMO) { store.transferToNextMonth(id, mes); return }
    await supabaseStore.transferToNextMonth(id, mes)
  },

  async getHistory(): Promise<MonthSummary[]> {
    return USE_DEMO ? demoHistory() : supabaseHistory()
  },

  async getHouse(): Promise<House> {
    return USE_DEMO ? store.getHouse() : supabaseStore.getHouse()
  },

  async joinHouse(code: string) {
    if (USE_DEMO) throw new Error('Indisponível no modo demo')
    await supabaseStore.joinHouse(code)
  },

  async uploadReceipt(billId: string, mes: string, file: File): Promise<Receipt> {
    if (USE_DEMO) throw new Error('Indisponível no modo demo')
    return supabaseStore.uploadReceipt(billId, mes, file)
  },

  async getReceipts(billId: string, mes: string): Promise<Receipt[]> {
    if (USE_DEMO) return []
    return supabaseStore.getReceipts(billId, mes)
  },
}
