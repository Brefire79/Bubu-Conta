import { useState } from 'react'
import { copy } from '../copy'
import { api } from '../lib/api'

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setAviso('')
    setLoading(true)
    try {
      if (modo === 'criar') {
        const user = await api.signUp(email, senha, nome || 'Usuário')
        if (!user) {
          setAviso(copy.auth.confirmaEmail)
          setModo('entrar')
          return
        }
      } else {
        await api.signIn(email, senha)
      }
      onLogin()
    } catch {
      setErro(copy.auth.erroLogin)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bubu-base">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-bubu-gold flex items-center justify-center mb-4">
          <span className="text-bubu-base font-extrabold text-2xl">B</span>
        </div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">{copy.app.nomeHeader}</h1>
        <p className="text-sm text-bubu-secondary mb-8">{copy.app.tagline}</p>

        <div className="w-full max-w-sm">
          <div className="flex bg-bubu-card border border-bubu-divider rounded-xl p-1 mb-6">
            {(['entrar', 'criar'] as const).map(m => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  modo === m ? 'bg-bubu-gold text-bubu-base' : 'text-bubu-secondary'
                }`}
              >
                {m === 'entrar' ? copy.auth.entrar : copy.auth.criar}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'criar' && (
              <div>
                <label className="label">{copy.auth.nome.label}</label>
                <input
                  className="input-field"
                  placeholder={copy.auth.nome.placeholder}
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="label">{copy.auth.email.label}</label>
              <input
                className="input-field"
                type="email"
                placeholder={copy.auth.email.placeholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">{copy.auth.senha.label}</label>
              <input
                className="input-field"
                type="password"
                placeholder={copy.auth.senha.placeholder}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>

            {api.demo && (
              <p className="text-xs text-center text-bubu-muted">{copy.auth.demoAviso}</p>
            )}

            {aviso && (
              <p className="text-sm text-bubu-success bg-bubu-success/10 rounded-xl px-4 py-2">{aviso}</p>
            )}
            {erro && (
              <p className="text-sm text-bubu-danger bg-bubu-danger/10 rounded-xl px-4 py-2">{erro}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? copy.auth.entrando : (modo === 'entrar' ? copy.auth.entrar : copy.auth.criar)}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
