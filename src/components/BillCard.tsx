import type { BillWithStatus } from '../types'
import { copy } from '../copy'
import { formatDueDate, formatValor } from '../lib/dates'
import { parcelaNoMes } from '../lib/parcelas'
import CategoryIcon from './CategoryIcon'

interface BillCardProps {
  bill: BillWithStatus
  mesReferencia: string
  onOpen: (bill: BillWithStatus) => void
}

export default function BillCard({ bill, mesReferencia, onOpen }: BillCardProps) {
  const isPaid = bill.status_enum === 'pago'
  const isOverdue = bill.status_enum === 'atrasado'
  const statusColor = isPaid ? 'text-bubu-success' : 'text-bubu-danger'

  const parcela = parcelaNoMes(bill, mesReferencia)
  const infoParcela = parcela && bill.parcelas
    ? ' · ' + copy.billCard.parcela.replace('{atual}', String(parcela)).replace('{total}', String(bill.parcelas))
    : ''

  return (
    <button
      onClick={() => onOpen(bill)}
      className={`bill-card ${isPaid ? 'bill-card-success' : 'bill-card-danger'} animate-slide-up`}
    >
      <div className={`w-10 h-10 min-[400px]:w-11 min-[400px]:h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-bubu-success' : 'bg-bubu-danger'}`}>
        <CategoryIcon categoria={bill.categoria} className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-[15px] min-[400px]:text-base uppercase truncate">{bill.nome}</h3>
        <p className={`text-xs whitespace-nowrap ${statusColor}`}>
          {copy.billCard.vence.replace('{data}', formatDueDate(bill.vencimento, mesReferencia))}{infoParcela}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`font-extrabold text-base min-[400px]:text-lg leading-tight ${statusColor}`}>{formatValor(bill.valor)}</span>
        {isPaid ? (
          <span className="pill-success">{copy.billCard.statusPago}</span>
        ) : isOverdue ? (
          <span className="pill-overdue">{copy.billCard.statusAtrasado}</span>
        ) : (
          <span className="pill-danger">{copy.billCard.statusAPagar}</span>
        )}
      </div>

      <svg className="w-5 h-5 text-bubu-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  )
}
