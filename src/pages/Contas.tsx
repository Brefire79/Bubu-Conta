import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { BillWithStatus, NewBill } from '../types'
import { CATEGORIA_MAP } from '../types'
import { copy } from '../copy'
import { formatValor, getCurrentMonth } from '../lib/dates'
import BillForm from '../components/BillForm'
import CategoryIcon from '../components/CategoryIcon'

export default function Contas() {
  const [bills, setBills] = useState<BillWithStatus[]>([])
  const [editingBill, setEditingBill] = useState<BillWithStatus | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')

  const loadBills = async () => {
    try {
      const data = await api.getBillsForMonth(getCurrentMonth())
      setBills([...data].sort((a, b) => a.vencimento - b.vencimento))
    } catch {
      setToast(copy.toast.erro)
    }
  }

  useEffect(() => { loadBills() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
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

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBill(id)
      showToast(copy.toast.apagado)
      loadBills()
    } catch {
      showToast(copy.toast.erro)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">{copy.contas.titulo}</h1>
          <p className="page-subtitle">{copy.contas.subtitulo}</p>
        </div>
        <button
          onClick={() => { setEditingBill(null); setShowForm(true) }}
          aria-label={copy.vazio.botao}
          className="w-11 h-11 rounded-xl bg-bubu-gold text-bubu-base flex items-center justify-center active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

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
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold text-white">{copy.vazio.titulo}</h3>
          <p className="text-sm text-bubu-secondary mt-1">{copy.vazio.texto}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            {copy.vazio.botao}
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {bills.map(bill => (
            <li key={bill.id} className="card flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-full bg-bubu-divider flex items-center justify-center flex-shrink-0">
                <CategoryIcon categoria={bill.categoria} className="w-5 h-5 text-bubu-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white uppercase truncate">{bill.nome}</h3>
                <p className="text-[13px] text-bubu-secondary">
                  {CATEGORIA_MAP.get(bill.categoria)?.label} · dia {bill.vencimento} · {copy.formulario.tipo[bill.tipo]}
                </p>
              </div>
              <span className="font-extrabold text-white">{formatValor(bill.valor)}</span>
              <div className="flex gap-1">
                <button onClick={() => setEditingBill(bill)} aria-label={copy.conta.editar} className="p-2 rounded-lg text-bubu-secondary hover:text-bubu-gold transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" /></svg>
                </button>
                <button onClick={() => handleDelete(bill.id)} aria-label={copy.conta.apagar} className="p-2 rounded-lg text-bubu-secondary hover:text-bubu-danger transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m1 0-1 14H8L7 6" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white text-bubu-base text-sm font-semibold rounded-xl px-5 py-3 shadow-xl animate-slide-up">
          {toast}
        </div>
      )}
    </>
  )
}
