export type BillType = 'mensal' | 'anual' | 'parcelada'
export type BillStatusEnum = 'pago' | 'pendente' | 'atrasado'

export interface Profile {
  id: string
  name: string
  avatar_url?: string
  house_id?: string
}

export interface House {
  id: string
  invite_code: string
  owner_id?: string
  members: Profile[]
}

export interface Bill {
  id: string
  house_id: string
  nome: string
  valor: number
  categoria: Categoria
  vencimento: number
  tipo: BillType
  parcelas: number | null
  parcela_atual: number | null
  created_by: string
  ativo: boolean
  cancelada_em?: string | null
  created_at: string
  updated_at: string
}

export interface BillStatus {
  id: string
  bill_id: string
  mes_referencia: string
  pago: boolean
  pago_por?: string
  pago_em?: string
  transferida: boolean
  nota?: string
  valor_pago?: number | null
}

export interface BillWithStatus extends Bill {
  status?: BillStatus
  status_enum: BillStatusEnum
}

export interface Divida extends BillWithStatus {
  mes_divida: string
}

export interface NewBill {
  nome: string
  valor: number
  categoria: Categoria
  vencimento: number
  tipo: BillType
  parcelas?: number
  parcela_atual?: number
}

export interface HistoryEntry {
  mes_referencia: string
  total_contas: number
  total_pago: number
  total_pendente: number
  contas: BillWithStatus[]
}

export interface MonthSummary {
  mes: string
  nome: string
  total: number
  pago: number
  pendente: number
  contas: BillWithStatus[]
}

export interface Receipt {
  id: string
  bill_id: string
  mes_referencia: string
  file_path: string
  file_url?: string
  uploaded_by?: string
  created_at: string
}

export type Categoria = string

export const CATEGORIAS: { value: Categoria; label: string; icon: string }[] = [
  { value: 'agua', label: 'Água', icon: '💧' },
  { value: 'luz', label: 'Luz', icon: '⚡' },
  { value: 'aluguel', label: 'Aluguel', icon: '🏠' },
  { value: 'internet', label: 'Internet', icon: '🌐' },
  { value: 'telefone', label: 'Telefone', icon: '📞' },
  { value: 'condominio', label: 'Condomínio', icon: '🏢' },
  { value: 'iptu', label: 'IPTU', icon: '🏛️' },
  { value: 'ipva', label: 'IPVA', icon: '🚗' },
  { value: 'seguros', label: 'Seguros', icon: '🛡️' },
  { value: 'streaming', label: 'Streaming', icon: '📺' },
  { value: 'assinaturas', label: 'Assinaturas', icon: '📋' },
  { value: 'supermercado', label: 'Supermercado', icon: '🛒' },
  { value: 'transporte', label: 'Transporte', icon: '🚌' },
  { value: 'educacao', label: 'Educação', icon: '📚' },
  { value: 'saude', label: 'Saúde', icon: '❤️' },
  { value: 'lazer', label: 'Lazer', icon: '🎮' },
  { value: 'outros', label: 'Outros', icon: '📦' },
]

export const CATEGORIA_MAP = new Map(CATEGORIAS.map(c => [c.value, c]))
