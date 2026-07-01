import { useEffect, useRef, useState } from 'react'
import type { BillWithStatus, Receipt } from '../types'
import { CATEGORIA_MAP } from '../types'
import { copy } from '../copy'
import { api } from '../lib/api'
import { formatDueDate, formatValor } from '../lib/dates'
import CategoryIcon from './CategoryIcon'

interface BillDetailProps {
  bill: BillWithStatus
  mesReferencia: string
  onClose: () => void
  onChanged: (toast: string) => void
  onEdit: (bill: BillWithStatus) => void
}

export default function BillDetail({ bill, mesReferencia, onClose, onChanged, onEdit }: BillDetailProps) {
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const isPaid = bill.status_enum === 'pago'
  const isOverdue = bill.status_enum === 'atrasado'
  const categoria = CATEGORIA_MAP.get(bill.categoria)

  useEffect(() => {
    if (!api.demo) {
      api.getReceipts(bill.id, mesReferencia).then(setReceipts).catch(() => {})
    }
  }, [bill.id, mesReferencia])

  const run = async (fn: () => Promise<void>, toast: string) => {
    setBusy(true)
    setErro('')
    try {
      await fn()
      onChanged(toast)
      onClose()
    } catch {
      setErro(copy.toast.erro)
      setBusy(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setErro('')
    try {
      const receipt = await api.uploadReceipt(bill.id, mesReferencia, file)
      setReceipts(r => [receipt, ...r])
      onChanged(copy.comprovante.enviado)
    } catch {
      setErro(copy.comprovante.erro)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-bubu-card border-t sm:border border-bubu-divider rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[85dvh] overflow-y-auto safe-bottom">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-bubu-success' : 'bg-bubu-danger'}`}>
            <CategoryIcon categoria={bill.categoria} className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white uppercase truncate">{bill.nome}</h2>
            <p className="text-sm text-bubu-secondary">{categoria?.label}</p>
          </div>
          <button onClick={onClose} aria-label={copy.conta.fechar} className="p-2 rounded-xl text-bubu-secondary hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className={`text-2xl font-extrabold ${isPaid ? 'text-bubu-success' : 'text-bubu-danger'}`}>{formatValor(bill.valor)}</p>
            <p className={`text-sm ${isPaid ? 'text-bubu-success' : 'text-bubu-danger'}`}>
              {copy.billCard.vence.replace('{data}', formatDueDate(bill.vencimento, mesReferencia))}
            </p>
          </div>
          {isPaid ? (
            <span className="pill-success">{copy.billCard.statusPago}</span>
          ) : isOverdue ? (
            <span className="pill-overdue">{copy.billCard.statusAtrasado}</span>
          ) : (
            <span className="pill-danger">{copy.billCard.statusAPagar}</span>
          )}
        </div>

        <div className="space-y-3">
          {isPaid ? (
            <button disabled={busy} onClick={() => run(() => api.markUnpaid(bill.id, mesReferencia), copy.toast.editado)} className="btn-secondary w-full">
              {copy.conta.desfazer}
            </button>
          ) : (
            <button disabled={busy} onClick={() => run(() => api.markPaid(bill.id, mesReferencia), copy.toast.pago)} className="btn-success w-full">
              {copy.conta.marcarPago}
            </button>
          )}

          {isOverdue && (
            <button disabled={busy} onClick={() => run(() => api.transferToNextMonth(bill.id, mesReferencia), copy.toast.transferido)} className="btn-secondary w-full">
              {copy.conta.transferir}
            </button>
          )}

          <div className="border-t border-bubu-divider pt-3">
            <p className="eyebrow mb-2">{copy.comprovante.titulo}</p>
            {api.demo ? (
              <p className="text-sm text-bubu-muted">{copy.comprovante.somenteOnline}</p>
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                    e.target.value = ''
                  }}
                />
                <button disabled={uploading} onClick={() => fileRef.current?.click()} className="btn-secondary w-full">
                  {uploading ? copy.comprovante.enviando : copy.comprovante.enviar}
                </button>
                {receipts.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {receipts.map(r => (
                      <li key={r.id}>
                        <a href={r.file_url} target="_blank" rel="noreferrer" className="text-sm text-bubu-info underline">
                          {copy.comprovante.ver} — {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 border-t border-bubu-divider pt-3">
            <button disabled={busy} onClick={() => { onClose(); onEdit(bill) }} className="btn-secondary flex-1">
              {copy.conta.editar}
            </button>
            {confirmDelete ? (
              <button disabled={busy} onClick={() => run(() => api.deleteBill(bill.id), copy.toast.apagado)} className="btn-danger flex-1">
                {copy.excluir.confirmar}
              </button>
            ) : (
              <button disabled={busy} onClick={() => setConfirmDelete(true)} className="btn-secondary flex-1 text-bubu-danger">
                {copy.conta.apagar}
              </button>
            )}
          </div>
          {confirmDelete && (
            <p className="text-xs text-bubu-danger text-center">{copy.excluir.titulo} {copy.excluir.texto}</p>
          )}

          {erro && (
            <p className="text-sm text-bubu-danger bg-bubu-danger/10 rounded-xl px-4 py-2">{erro}</p>
          )}
        </div>
      </div>
    </div>
  )
}
