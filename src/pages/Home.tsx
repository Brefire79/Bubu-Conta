import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { BillWithStatus, Divida, NewBill } from '../types'
import { copy } from '../copy'
import { getCurrentMonth } from '../lib/dates'
import BillCard from '../components/BillCard'
import BillDetail from '../components/BillDetail'
import BillForm from '../components/BillForm'
import MonthCard from '../components/MonthCard'
import OfflineBanner from '../components/OfflineBanner'

export default function Home() {
  const [mesReferencia, setMesReferencia] = useState(getCurrentMonth())
  const [bills, setBills] = useState<BillWithStatus[]>([])
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<{ bill: BillWithStatus; mes: string } | null>(null)
  const [editingBill, setEditingBill] = useState<BillWithStatus | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')

  const isCurrentMonth = mesReferencia === getCurrentMonth()

  const loadBills = useCallback(async () => {
    try {
      setBills(await api.getBillsForMonth(mesReferencia))
      if (mesReferencia === getCurrentMonth()) {
        setDividas(await api.getDividasAnteriores())
      } else {
        setDividas([])
      }
    } catch {
      setToast(copy.toast.erro)
    } finally {
      setLoading(false)
    }
  }, [mesReferencia])

  useEffect(() => {
    setLoading(true)
    loadBills()
  }, [loadBills])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleChanged = (msg: string) => {
    showToast(msg)
    loadBills()
  }

  const handleSave = async (data: NewBill) => {
    try {
      if (editingBill) {
        await api.updateBill(editingBill.id, data)
        showToast(copy.toast.editado)
      } else {
        await api.createBill(data)
        showToast(copy.toast.salvo)
      }
      setEditingBill(null)
      setShowForm(false)
      loadBills()
    } catch {
      showToast(copy.toast.erro)
    }
  }

  const totalAPagar = bills.filter(b => b.status_enum !== 'pago').reduce((s, b) => s + b.valor, 0)
  const totalPago = bills.filter(b => b.status_enum === 'pago').reduce((s, b) => s + (b.status?.valor_pago ?? b.valor), 0)
  const tudoPago = bills.length > 0 && totalAPagar === 0

  return (
    <>
      <OfflineBanner />

      <MonthCard
        mesReferencia={mesReferencia}
        totalAPagar={totalAPagar}
        totalPago={totalPago}
        onChange={setMesReferencia}
      />

      {showForm || editingBill ? (
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">
            {editingBill ? copy.formulario.editarTitulo : copy.formulario.novoTitulo}
          </h2>
          <BillForm
            editingBill={editingBill ?? undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingBill(null) }}
          />
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-[14px] bg-bubu-card animate-pulse" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold text-white">{copy.vazio.titulo}</h3>
          <p className="text-sm text-bubu-secondary mt-1">{copy.vazio.texto}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            {copy.vazio.botao}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {isCurrentMonth && dividas.length > 0 && (
            <div className="space-y-3 mb-2">
              <div>
                <p className="eyebrow text-bubu-danger">{copy.dividas.titulo}</p>
                <p className="text-xs text-bubu-secondary">{copy.dividas.subtitulo}</p>
              </div>
              {dividas.map(d => (
                <BillCard
                  key={`${d.id}-${d.mes_divida}`}
                  bill={d}
                  mesReferencia={d.mes_divida}
                  onOpen={b => setSelected({ bill: b, mes: d.mes_divida })}
                />
              ))}
              <div className="border-t border-bubu-divider" />
            </div>
          )}
          {tudoPago && dividas.length === 0 && (
            <p className="text-sm text-bubu-success font-medium text-center">{copy.home.tudoPago}</p>
          )}
          {bills.map(bill => (
            <BillCard key={bill.id} bill={bill} mesReferencia={mesReferencia} onOpen={b => setSelected({ bill: b, mes: mesReferencia })} />
          ))}
          <button
            onClick={() => { setEditingBill(null); setShowForm(true) }}
            className="w-full rounded-[14px] border border-dashed border-bubu-muted py-4 text-bubu-secondary font-semibold hover:border-bubu-gold hover:text-bubu-gold transition-colors"
          >
            + {copy.vazio.botao}
          </button>
        </div>
      )}

      {selected && (
        <BillDetail
          key={`${selected.bill.id}-${selected.mes}`}
          bill={selected.bill}
          mesReferencia={selected.mes}
          onClose={() => setSelected(null)}
          onChanged={handleChanged}
          onEdit={b => setEditingBill(b)}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white text-bubu-base text-sm font-semibold rounded-xl px-5 py-3 shadow-xl animate-slide-up">
          {toast}
        </div>
      )}
    </>
  )
}
