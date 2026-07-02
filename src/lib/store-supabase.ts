import { supabase } from './supabase'
import type { Bill, BillStatus, BillWithStatus, House, NewBill, Profile, Receipt } from '../types'
import { getCurrentMonth, isCurrentOrPastMonth, isOverdue, nextMonth } from './dates'

function sb() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

let cachedProfile: Profile | null = null

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await sb().from('profiles').select('*').eq('id', userId).maybeSingle()
  return data as Profile | null
}

async function ensureProfile(): Promise<Profile> {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) throw new Error('Sem sessão')

  let profile = await fetchProfile(user.id)
  if (!profile) {
    const { data: house, error: houseError } = await sb()
      .from('houses')
      .insert({ invite_code: generateInviteCode(), owner_id: user.id })
      .select()
      .single()
    if (houseError) throw houseError

    const nome = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Usuário'
    const { data: created, error: profileError } = await sb()
      .from('profiles')
      .insert({ id: user.id, name: nome, house_id: house.id })
      .select()
      .single()
    if (profileError) throw profileError
    profile = created as Profile
  }
  cachedProfile = profile
  return profile
}

export const supabaseStore = {
  async getSessionUser(): Promise<Profile | null> {
    const { data: { session } } = await sb().auth.getSession()
    if (!session) return null
    try {
      return await ensureProfile()
    } catch {
      return null
    }
  },

  async signIn(email: string, senha: string): Promise<Profile> {
    const { error } = await sb().auth.signInWithPassword({ email, password: senha })
    if (error) throw error
    return ensureProfile()
  },

  async signUp(email: string, senha: string, nome: string): Promise<Profile | null> {
    const { data, error } = await sb().auth.signUp({
      email,
      password: senha,
      options: { data: { name: nome } },
    })
    if (error) throw error
    if (!data.session) return null
    return ensureProfile()
  },

  async signOut() {
    cachedProfile = null
    await sb().auth.signOut()
  },

  async getBillsForMonth(mesReferencia: string): Promise<BillWithStatus[]> {
    const { data: bills, error } = await sb()
      .from('bills')
      .select('*')
      .eq('ativo', true)
    if (error) throw error

    const ids = (bills ?? []).map(b => b.id)
    let statuses: BillStatus[] = []
    if (ids.length > 0) {
      const { data } = await sb()
        .from('bill_status')
        .select('*')
        .eq('mes_referencia', mesReferencia)
        .in('bill_id', ids)
      statuses = (data ?? []) as BillStatus[]
    }

    return (bills as Bill[])
      .map(bill => {
        const st = statuses.find(s => s.bill_id === bill.id)
        const pago = st?.pago ?? false
        const atrasado = !pago && isCurrentOrPastMonth(mesReferencia) && isOverdue(bill.vencimento, mesReferencia)
        return {
          ...bill,
          status: st,
          status_enum: pago ? 'pago' : atrasado ? 'atrasado' : 'pendente',
        } as BillWithStatus
      })
      .sort((a, b) => {
        if (a.status_enum === 'atrasado' && b.status_enum !== 'atrasado') return -1
        if (a.status_enum !== 'atrasado' && b.status_enum === 'atrasado') return 1
        if (a.status_enum === 'pago' && b.status_enum !== 'pago') return 1
        if (a.status_enum !== 'pago' && b.status_enum === 'pago') return -1
        return a.vencimento - b.vencimento
      })
  },

  async createBill(data: NewBill) {
    const profile = cachedProfile ?? await ensureProfile()
    const { error } = await sb().from('bills').insert({
      house_id: profile.house_id,
      nome: data.nome,
      valor: data.valor,
      categoria: data.categoria,
      vencimento: data.vencimento,
      tipo: data.tipo,
      parcelas: data.parcelas ?? null,
      parcela_atual: data.tipo === 'parcelada' ? 1 : null,
      created_by: profile.id,
    })
    if (error) throw error
  },

  async updateBill(id: string, data: Partial<Bill>) {
    const { error } = await sb()
      .from('bills')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async deleteBill(id: string) {
    const { error } = await sb().from('bills').update({ ativo: false }).eq('id', id)
    if (error) throw error
  },

  async markPaid(id: string, mesReferencia: string) {
    const profile = cachedProfile ?? await ensureProfile()
    const { error } = await sb().from('bill_status').upsert({
      bill_id: id,
      mes_referencia: mesReferencia,
      pago: true,
      pago_por: profile.id,
      pago_em: new Date().toISOString(),
      transferida: false,
    }, { onConflict: 'bill_id,mes_referencia' })
    if (error) throw error
  },

  async markUnpaid(id: string, mesReferencia: string) {
    const { error } = await sb().from('bill_status').upsert({
      bill_id: id,
      mes_referencia: mesReferencia,
      pago: false,
      pago_por: null,
      pago_em: null,
    }, { onConflict: 'bill_id,mes_referencia' })
    if (error) throw error
  },

  async transferToNextMonth(id: string, mesReferencia: string) {
    await sb().from('bill_status').upsert({
      bill_id: id,
      mes_referencia: mesReferencia,
      pago: false,
      transferida: true,
    }, { onConflict: 'bill_id,mes_referencia' })
    await sb().from('bill_status').upsert({
      bill_id: id,
      mes_referencia: nextMonth(mesReferencia),
      pago: false,
      transferida: false,
    }, { onConflict: 'bill_id,mes_referencia', ignoreDuplicates: true })
  },

  async getMonths(): Promise<string[]> {
    const { data } = await sb().from('bill_status').select('mes_referencia')
    const meses = new Set<string>((data ?? []).map(r => r.mes_referencia as string))
    meses.add(getCurrentMonth())
    return [...meses].sort()
  },

  async getHouse(): Promise<House> {
    const profile = cachedProfile ?? await ensureProfile()
    const { data: house, error } = await sb()
      .from('houses')
      .select('*')
      .eq('id', profile.house_id)
      .single()
    if (error) throw error
    const { data: members } = await sb()
      .from('profiles')
      .select('*')
      .eq('house_id', profile.house_id)
    return { ...house, members: (members ?? []) as Profile[] } as House
  },

  async removeMember(memberId: string) {
    const { error } = await sb().rpc('remove_member', { member_id: memberId })
    if (error) throw error
  },

  async joinHouse(code: string) {
    const { error } = await sb().rpc('join_house', { code: code.trim().toUpperCase() })
    if (error) throw error
    cachedProfile = null
    await ensureProfile()
  },

  async uploadReceipt(billId: string, mesReferencia: string, file: File): Promise<Receipt> {
    const profile = cachedProfile ?? await ensureProfile()
    const ext = file.name.split('.').pop() || 'bin'
    const path = `${profile.house_id}/${billId}/${mesReferencia}-${Date.now()}.${ext}`
    const { error: uploadError } = await sb().storage.from('comprovantes').upload(path, file)
    if (uploadError) throw uploadError
    const { data, error } = await sb()
      .from('receipts')
      .insert({
        bill_id: billId,
        mes_referencia: mesReferencia,
        file_path: path,
        uploaded_by: profile.id,
      })
      .select()
      .single()
    if (error) throw error
    return data as Receipt
  },

  async getReceipts(billId: string, mesReferencia: string): Promise<Receipt[]> {
    const { data } = await sb()
      .from('receipts')
      .select('*')
      .eq('bill_id', billId)
      .eq('mes_referencia', mesReferencia)
      .order('created_at', { ascending: false })
    const receipts = (data ?? []) as Receipt[]
    return Promise.all(receipts.map(async r => {
      const { data: signed } = await sb().storage.from('comprovantes').createSignedUrl(r.file_path, 3600)
      return { ...r, file_url: signed?.signedUrl }
    }))
  },
}
