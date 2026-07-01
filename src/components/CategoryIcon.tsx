import type { Categoria } from '../types'

const PATHS: Record<string, string> = {
  casa: 'M3 9.5 12 3l9 6.5M5 10v10h14V10',
  luz: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3Z',
  agua: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  wifi: 'M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M12 19h.01',
  cartao: 'M3 6h18v12H3zM3 10h18',
  educacao: 'M2 9 12 4l10 5-10 5L2 9ZM6 11.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-4.5',
  carro: 'M5 16v2H3v-6l2-5h14l2 5v6h-2v-2M5 16h14M5 16H3m16 0h2M7 12h.01M17 12h.01',
  carrinho: 'M4 5h2l2 11h10l2-8H7M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  coracao: 'M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9Z',
  tv: 'M3 7h18v11H3zM8 21h8M12 7 8 3m4 4 4-4',
  telefone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  caixa: 'M3 8l9-5 9 5v8l-9 5-9-5V8Zm0 0 9 5m0 0 9-5m-9 5v8',
}

const CATEGORIA_ICONE: Record<Categoria, string> = {
  agua: 'agua',
  luz: 'luz',
  aluguel: 'casa',
  internet: 'wifi',
  telefone: 'telefone',
  condominio: 'casa',
  iptu: 'casa',
  ipva: 'carro',
  seguros: 'coracao',
  streaming: 'tv',
  assinaturas: 'cartao',
  supermercado: 'carrinho',
  transporte: 'carro',
  educacao: 'educacao',
  saude: 'coracao',
  lazer: 'tv',
  outros: 'caixa',
}

export default function CategoryIcon({ categoria, className }: { categoria: Categoria; className?: string }) {
  const path = PATHS[CATEGORIA_ICONE[categoria] ?? 'caixa']
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}
