import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { House, Profile } from '../types'
import { copy } from '../copy'

export default function Config({ onSignOut }: { onSignOut: () => void }) {
  const [house, setHouse] = useState<House | null>(null)
  const [user, setUser] = useState<Profile | null>(null)
  const [codigo, setCodigo] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [toast, setToast] = useState('')
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  const loadHouse = () => {
    api.getHouse().then(setHouse).catch(() => {})
  }

  useEffect(() => {
    loadHouse()
    api.getSessionUser().then(setUser).catch(() => {})
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const isOwner = !house?.owner_id || house.owner_id === user?.id

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

  const handleAdd = async () => {
    if (!novoNome.trim()) return
    setBusy(true)
    try {
      await api.addMember(novoNome)
      setNovoNome('')
      showToast(copy.config.addFeito)
      loadHouse()
    } catch {
      showToast(copy.toast.erro)
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (id: string) => {
    setBusy(true)
    try {
      await api.removeMember(id)
      showToast(copy.config.removido)
      loadHouse()
    } catch {
      showToast(copy.config.removerErro)
    } finally {
      setConfirmRemove(null)
      setBusy(false)
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
            {(house?.members ?? []).map(m => {
              const isMe = m.id === user?.id
              const isHouseOwner = m.id === house?.owner_id
              return (
                <li key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-bubu-divider flex items-center justify-center font-bold text-bubu-gold flex-shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-200">{m.name}</span>
                    {(isMe || isHouseOwner) && (
                      <span className="ml-2 text-xs text-bubu-muted">
                        {[isMe ? copy.config.voce : null, isHouseOwner ? copy.config.dono : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>
                  {isOwner && !isMe && (
                    confirmRemove === m.id ? (
                      <button
                        disabled={busy}
                        onClick={() => handleRemove(m.id)}
                        className="rounded-lg bg-bubu-danger px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {copy.config.removerConfirma}
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(m.id)}
                        aria-label={copy.config.remover.replace('{nome}', m.name)}
                        className="p-2 rounded-lg text-bubu-secondary hover:text-bubu-danger transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m1 0-1 14H8L7 6" /></svg>
                      </button>
                    )
                  )}
                </li>
              )
            })}
          </ul>

          <div className="border-t border-bubu-divider mt-4 pt-4">
            <p className="eyebrow mb-2">{copy.config.addTitulo}</p>
            {api.demo ? (
              <div className="flex gap-3">
                <input
                  className="input-field flex-1"
                  placeholder={copy.config.addNomePlaceholder}
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                />
                <button onClick={handleAdd} disabled={busy || !novoNome.trim()} className="btn-primary">
                  {copy.config.addBotao}
                </button>
              </div>
            ) : (
              <p className="text-sm text-bubu-secondary">{copy.config.addAjudaOnline}</p>
            )}
          </div>
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

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white text-bubu-base text-sm font-semibold rounded-xl px-5 py-3 shadow-xl animate-slide-up">
          {toast}
        </div>
      )}
    </>
  )
}
