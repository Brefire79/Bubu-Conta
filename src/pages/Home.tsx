import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { BillWithStatus, NewBill } from '../types'
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
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<BillWithStatus | null>(null)
  const [editingBill, setEditingBill] = useState<BillWithStatus | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')

  const loadBills = useCallback(async () => {
    try {
      setBills(await api.getBillsForMonth(mesReferencia))
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
  const totalPago = bills.filter(b => b.status_enum === 'pago').reduce((s, b) => s + b.valor, 0)
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
          {tudoPago && (
            <p className="text-sm text-bubu-success font-medium text-center">{copy.home.tudoPago}</p>
          )}
          {bills.map(bill => (
            <BillCard key={bill.id} bill={bill} mesReferencia={mesReferencia} onOpen={setSelected} />
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
          bill={selected}
          mesReferencia={mesReferencia}
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
