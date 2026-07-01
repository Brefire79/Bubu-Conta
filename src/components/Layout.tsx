import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { copy } from '../copy'

const TABS = [
  { to: '/home', label: copy.nav.inicio, icon: HomeIcon },
  { to: '/contas', label: copy.nav.contas, icon: ListIcon },
  { to: '/relatorios', label: copy.nav.relatorios, icon: ChartIcon },
  { to: '/config', label: copy.nav.configuracoes, icon: GearIcon },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-dvh bg-bubu-base">
      <header className="sticky top-0 z-30 bg-bubu-base/90 backdrop-blur-lg border-b border-bubu-divider safe-top">
        <div className="grid grid-cols-3 items-center px-5 py-3 max-w-lg mx-auto w-full">
          <div className="w-9 h-9 rounded-xl bg-bubu-gold flex items-center justify-center">
            <span className="text-bubu-base font-extrabold text-base">B</span>
          </div>
          <span className="font-bold text-[22px] text-white text-center">{copy.app.nomeHeader}</span>
          <span />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-bubu-base border-t border-bubu-divider safe-bottom">
        <div className="flex max-w-lg mx-auto pt-2 pb-1">
          {TABS.map(tab => {
            const isActive = location.pathname.startsWith(tab.to)
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors ${
                  isActive ? 'text-bubu-gold' : 'text-bubu-muted hover:text-bubu-secondary'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2 w-8 h-[3px] rounded-full bg-bubu-gold" />
                )}
                <tab.icon />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{tab.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function svgProps(className = 'w-6 h-6') {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
}

function HomeIcon() {
  return <svg {...svgProps()}><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /></svg>
}
function ListIcon() {
  return <svg {...svgProps()}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>
}
function ChartIcon() {
  return <svg {...svgProps()}><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
}
function GearIcon() {
  return (
    <svg {...svgProps()}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.06-.4.1-.8.1-1.2Z" />
    </svg>
  )
}
