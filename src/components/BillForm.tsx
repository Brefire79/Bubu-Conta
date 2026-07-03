import { useState } from 'react'
import { copy } from '../copy'
import type { Bill, Categoria, NewBill } from '../types'
import { CATEGORIAS } from '../types'

interface BillFormProps {
  editingBill?: Bill | null
  onSave: (data: NewBill) => void
  onCancel: () => void
}

export default function BillForm({ editingBill, onSave, onCancel }: BillFormProps) {
  const [nome, setNome] = useState(editingBill?.nome ?? '')
  const [valor, setValor] = useState(editingBill ? String(editingBill.valor) : '')
  const [categoria, setCategoria] = useState<Categoria>(editingBill?.categoria ?? 'outros')
  const [vencimento, setVencimento] = useState(editingBill ? String(editingBill.vencimento) : '')
  const [tipo, setTipo] = useState<'mensal' | 'anual' | 'parcelada'>(editingBill?.tipo ?? 'mensal')
  const [parcelas, setParcelas] = useState(editingBill?.parcelas ? String(editingBill.parcelas) : '')
  const [parcelaAtual, setParcelaAtual] = useState(editingBill?.parcela_atual ? String(editingBill.parcela_atual) : '1')
  const [erro, setErro] = useState('')

  const isValid = nome.trim() && valor.trim() && vencimento.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) { setErro(copy.formulario.faltaNome); return }
    const valorNum = parseFloat(valor.replace(/[^0-9,]/g, '').replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0) { setErro(copy.formulario.valorInvalido); return }
    const vencNum = parseInt(vencimento, 10)
    if (isNaN(vencNum) || vencNum < 1 || vencNum > 31) { setErro(copy.formulario.vencimentoInvalido); return }

    const parcelasNum = tipo === 'parcelada' ? parseInt(parcelas, 10) || 2 : undefined
    const parcelaAtualNum = tipo === 'parcelada' ? Math.max(1, parseInt(parcelaAtual, 10) || 1) : undefined
    if (parcelasNum && parcelaAtualNum && parcelaAtualNum > parcelasNum) {
      setErro(copy.formulario.parcelaAtualInvalida)
      return
    }

    onSave({
      nome: nome.trim(),
      valor: valorNum,
      categoria,
      vencimento: vencNum,
      tipo,
      parcelas: parcelasNum,
      parcela_atual: parcelaAtualNum,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{copy.formulario.nome.label}</label>
        <input
          className="input-field"
          placeholder={copy.formulario.nome.placeholder}
          value={nome}
          onChange={e => setNome(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        <label className="label">{copy.formulario.valor.label}</label>
        <input
          className="input-field"
          placeholder={copy.formulario.valor.placeholder}
          value={valor}
          onChange={e => setValor(e.target.value)}
          inputMode="decimal"
        />
      </div>

      <div>
        <label className="label">{copy.formulario.categoria.label}</label>
        <select className="input-field" value={categoria} onChange={e => setCategoria(e.target.value as Categoria)}>
          {CATEGORIAS.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{copy.formulario.vencimento.label}</label>
        <input
          className="input-field"
          placeholder={copy.formulario.vencimento.placeholder}
          value={vencimento}
          onChange={e => setVencimento(e.target.value.replace(/\D/g, '').slice(0, 2))}
          inputMode="numeric"
        />
      </div>

      <div>
        <label className="label">{copy.formulario.tipo.label}</label>
        <div className="flex gap-2">
          {(['mensal', 'anual', 'parcelada'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                tipo === t
                  ? 'bg-bubu-gold text-bubu-base'
                  : 'bg-bubu-base border border-bubu-divider text-gray-300'
              }`}
            >
              {copy.formulario.tipo[t]}
            </button>
          ))}
        </div>
      </div>

      {tipo === 'anual' && (
        <p className="text-xs text-bubu-secondary">{copy.formulario.anualAjuda}</p>
      )}

      {tipo === 'parcelada' && (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label">{copy.formulario.parcelaAtualLabel}</label>
              <input
                className="input-field"
                placeholder={copy.formulario.parcelaAtualPlaceholder}
                value={parcelaAtual}
                onChange={e => setParcelaAtual(e.target.value.replace(/\D/g, '').slice(0, 2))}
                inputMode="numeric"
              />
            </div>
            <div className="flex-1">
              <label className="label">{copy.formulario.parcelasLabel}</label>
              <input
                className="input-field"
                placeholder={copy.formulario.parcelasPlaceholder}
                value={parcelas}
                onChange={e => setParcelas(e.target.value.replace(/\D/g, '').slice(0, 2))}
                inputMode="numeric"
              />
            </div>
          </div>
          <p className="text-xs text-bubu-secondary">{copy.formulario.parcelaAjuda}</p>
        </>
      )}

      {erro && (
        <p className="text-sm text-bubu-danger bg-bubu-danger/10 rounded-xl px-4 py-2">{erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          {copy.formulario.cancelar}
        </button>
        <button type="submit" disabled={!isValid} className="btn-primary flex-1">
          {copy.formulario.salvar}
        </button>
      </div>
    </form>
  )
}
