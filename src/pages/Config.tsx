import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { House } from '../types'
import { copy } from '../copy'

export default function Config({ onSignOut }: { onSignOut: () => void }) {
  const [house, setHouse] = useState<House | null>(null)
  const [codigo, setCodigo] = useState('')
  const [feedback, setFeedback] = useState('')
  const [erro, setErro] = useState('')

  const loadHouse = () => {
    api.getHouse().then(setHouse).catch(() => {})
  }

  useEffect(() => { loadHouse() }, [])

  const handleCopy = async () => {
    if (!house) return
    await navigator.clipboard.writeText(house.invite_code)
    setFeedback(copy.config.copiado)
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleJoin = async () => {
    setErro('')
    try {
      await api.joinHouse(codigo)
      setCodigo('')
      loadHouse()
    } catch {
      setErro(copy.config.codigoInvalido)
    }
  }

  const handleSignOut = async () => {
    await api.signOut()
    onSignOut()
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="page-title">{copy.config.titulo}</h1>
        <p className="page-subtitle">
          {api.demo ? copy.config.modoDemo : copy.config.modoOnline}
        </p>
      </div>

      <div className="space-y-4">
        <section className="card">
          <h2 className="font-bold text-white mb-1">{copy.config.casaTitulo}</h2>
          <p className="text-sm text-bubu-secondary mb-4">{copy.config.convidarTexto}</p>
          <div className="flex items-center gap-3">
            <span className="flex-1 rounded-xl bg-bubu-base border border-bubu-gold px-4 py-3 font-mono font-bold text-bubu-gold text-lg tracking-[0.2em] text-center">
              {house?.invite_code ?? '—'}
            </span>
            <button onClick={handleCopy} className="btn-primary">
              {feedback || copy.config.copiar}
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="font-bold text-white mb-3">{copy.config.membros}</h2>
          <ul className="space-y-2">
            {(house?.members ?? []).map(m => (
              <li key={m.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-bubu-divider flex items-center justify-center font-bold text-bubu-gold">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-200">{m.name}</span>
              </li>
            ))}
          </ul>
        </section>

        {!api.demo && (
          <section className="card">
            <h2 className="font-bold text-white mb-1">{copy.config.entrarTitulo}</h2>
            <p className="text-sm text-bubu-secondary mb-4">{copy.config.entrarTexto}</p>
            <div className="flex gap-3">
              <input
                className="input-field flex-1 uppercase"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                maxLength={7}
              />
              <button onClick={handleJoin} disabled={codigo.length < 7} className="btn-secondary">
                {copy.config.entrarBotao}
              </button>
            </div>
            {erro && <p className="text-sm text-bubu-danger mt-2">{erro}</p>}
          </section>
        )}

        <button onClick={handleSignOut} className="btn-danger w-full">
          {copy.config.sair}
        </button>
      </div>
    </>
  )
}
