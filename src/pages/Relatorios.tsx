import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { MonthSummary } from '../types'
import { CATEGORIA_MAP } from '../types'
import { copy } from '../copy'
import { formatValor } from '../lib/dates'
import { valorEfetivo } from '../lib/valores'

export default function Relatorios() {
  const [history, setHistory] = useState<MonthSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [openMonth, setOpenMonth] = useState<string | null>(null)

  useEffect(() => {
    api.getHistory()
      .then(h => {
        setHistory(h)
        if (h.length > 0) setOpenMonth(h[0].mes)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="mb-4">
        <h1 className="page-title">{copy.relatorios.titulo}</h1>
        <p className="page-subtitle">{copy.relatorios.subtitulo}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-bubu-card animate-pulse" />)}
        </div>
      ) : history.length === 0 ? (
        <p className="text-sm text-bubu-secondary text-center py-16">{copy.relatorios.vazio}</p>
      ) : (
        <div className="space-y-3">
          {history.map(m => {
            const aberto = openMonth === m.mes
            const porCategoria = [...m.contas.reduce((map, c) => {
              map.set(c.categoria, (map.get(c.categoria) ?? 0) + valorEfetivo(c))
              return map
            }, new Map<string, number>())].sort((a, b) => b[1] - a[1])

            return (
              <section key={m.mes} className="card p-0 overflow-hidden">
                <button
                  onClick={() => setOpenMonth(aberto ? null : m.mes)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <h2 className="font-bold text-white uppercase">{m.nome}</h2>
                  <span className="font-extrabold text-white">{formatValor(m.total)}</span>
                </button>

                <div className="px-5 pb-4">
                  <div className="h-2 rounded-full bg-bubu-divider overflow-hidden">
                    <div
                      className="h-full bg-bubu-success transition-all duration-500"
                      style={{ width: m.total > 0 ? `${(m.pago / m.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[13px]">
                    <span className="text-bubu-success font-semibold">{copy.relatorios.pago}: {formatValor(m.pago)}</span>
                    <span className="text-bubu-danger font-semibold">{copy.relatorios.pendente}: {formatValor(m.pendente)}</span>
                  </div>
                </div>

                {aberto && porCategoria.length > 0 && (
                  <div className="border-t border-bubu-divider px-5 py-4">
                    <p className="eyebrow mb-3">{copy.relatorios.porCategoria}</p>
                    <ul className="space-y-2">
                      {porCategoria.map(([cat, valor]) => (
                        <li key={cat} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {CATEGORIA_MAP.get(cat as never)?.label ?? cat}
                          </span>
                          <span className="font-semibold text-white">{formatValor(valor)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
