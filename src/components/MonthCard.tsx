import { copy } from '../copy'
import { formatValor, getMonthName, nextMonth, prevMonth } from '../lib/dates'

interface MonthCardProps {
  mesReferencia: string
  totalAPagar: number
  totalPago: number
  onChange: (mes: string) => void
}

export default function MonthCard({ mesReferencia, totalAPagar, totalPago, onChange }: MonthCardProps) {
  return (
    <section className="card-month mb-5 animate-slide-down">
      <div className="relative flex items-center justify-center px-4 pt-5 pb-4">
        <button
          onClick={() => onChange(prevMonth(mesReferencia))}
          aria-label={copy.home.mesAnterior}
          className="absolute left-4 w-11 h-11 rounded-full border border-bubu-divider flex items-center justify-center text-bubu-secondary hover:text-white hover:border-bubu-muted transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        <div className="text-center">
          <p className="eyebrow mb-1">{copy.home.mesReferenciaLabel}</p>
          <h2 className="text-[28px] leading-tight font-extrabold uppercase text-bubu-gold tracking-wide">
            {getMonthName(mesReferencia)}
          </h2>
        </div>

        <button
          onClick={() => onChange(nextMonth(mesReferencia))}
          aria-label={copy.home.proximoMes}
          className="absolute right-4 w-11 h-11 rounded-full border border-bubu-divider flex items-center justify-center text-bubu-secondary hover:text-white hover:border-bubu-muted transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </div>

      <div className="border-t border-bubu-divider grid grid-cols-3">
        <SummaryCol
          circleClass="bg-bubu-danger"
          valueClass="text-bubu-danger"
          label={copy.home.totalAPagar}
          value={formatValor(totalAPagar)}
          icon={
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z" /><path d="M10 8h4M10 12h4" /></svg>
          }
        />
        <SummaryCol
          circleClass="bg-bubu-success"
          valueClass="text-bubu-success"
          label={copy.home.pagos}
          value={formatValor(totalPago)}
          divider
          icon={
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
          }
        />
        <SummaryCol
          circleClass="bg-bubu-info"
          valueClass="text-white"
          label={copy.home.total}
          value={formatValor(totalAPagar + totalPago)}
          divider
          icon={
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 6.5c0-1.5-2-2.5-5-2.5S7 5 7 7s2 2.5 5 3 5 1.5 5 3.5-2.5 3-5 3-5-1-5-2.5" /></svg>
          }
        />
      </div>
    </section>
  )
}

function SummaryCol({ circleClass, valueClass, label, value, icon, divider }: {
  circleClass: string
  valueClass: string
  label: string
  value: string
  icon: React.ReactNode
  divider?: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 px-2 py-4 ${divider ? 'border-l border-bubu-divider' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circleClass}`}>
        {icon}
      </div>
      <span className="eyebrow text-center">{label}</span>
      <span className={`text-sm sm:text-base font-extrabold ${valueClass}`}>{value}</span>
    </div>
  )
}
