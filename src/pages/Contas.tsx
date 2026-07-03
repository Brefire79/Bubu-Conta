import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Bill, NewBill } from '../types'
import { CATEGORIA_MAP } from '../types'
import { copy } from '../copy'
import { formatValor, getCurrentMonth } from '../lib/dates'
import { parcelaNoMes } from '../lib/parcelas'
import BillForm from '../components/BillForm'
import CategoryIcon from '../components/CategoryIcon'

export default function Contas() {
  const [bills, setBills] = useState<Bill[]>([])
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')

  const loadBills = async () => {
    try {
      setBills(await api.getBills())
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

  const handleReativar = async (id: string) => {
    try {
      await api.updateBill(id, { cancelada_em: null })
      showToast(copy.cancelada.reativada)
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
            <li key={bill.id} className={`card flex items-start gap-3 p-4 ${bill.cancelada_em ? 'opacity-60' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-bubu-divider flex items-center justify-center flex-shrink-0">
                <CategoryIcon categoria={bill.categoria} className="w-5 h-5 text-bubu-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white uppercase truncate text-[15px]">
                  {bill.nome}
                  {bill.cancelada_em && (
                    <span className="ml-2 text-[10px] font-bold text-bubu-danger border border-bubu-danger rounded-full px-2 py-0.5 align-middle normal-case">
                      {copy.cancelada.pill}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-bubu-secondary truncate">
                  {CATEGORIA_MAP.get(bill.categoria)?.label ?? bill.categoria} · dia {bill.vencimento} · {bill.tipo === 'parcelada' && bill.parcelas
                    ? (() => {
                        const p = parcelaNoMes(bill, getCurrentMonth())
                        return p
                          ? copy.contas.parcelaInfo.replace('{atual}', String(p)).replace('{total}', String(bill.parcelas))
                          : copy.contas.encerrada
                      })()
                    : copy.formulario.tipo[bill.tipo]}
                </p>
                <p className="font-extrabold text-white mt-1">{formatValor(bill.valor)}</p>
                {bill.cancelada_em && (
                  <button onClick={() => handleReativar(bill.id)} className="text-xs font-semibold text-bubu-gold underline mt-1">
                    {copy.cancelada.reativar}
                  </button>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditingBill(bill)} aria-label={copy.conta.editar} className="p-2.5 rounded-lg text-bubu-secondary hover:text-bubu-gold transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" /></svg>
                </button>
                <button onClick={() => handleDelete(bill.id)} aria-label={copy.conta.apagar} className="p-2.5 rounded-lg text-bubu-secondary hover:text-bubu-danger transition-colors">
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
