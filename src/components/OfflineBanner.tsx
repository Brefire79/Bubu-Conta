import { useState, useEffect } from 'react'
import { copy } from '../copy'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const [voltou, setVoltou] = useState(false)

  useEffect(() => {
    const handleOffline = () => setOffline(true)
    const handleOnline = () => {
      setOffline(false)
      setVoltou(true)
      setTimeout(() => setVoltou(false), 4000)
    }
    setOffline(!navigator.onLine)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (voltou) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 px-4 animate-slide-down">
        <div className="max-w-lg mx-auto bg-bubu-success text-white text-sm font-medium rounded-xl px-4 py-2.5 text-center shadow-lg">
          {copy.offline.voltou}
        </div>
      </div>
    )
  }

  if (offline) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 px-4 animate-slide-down">
        <div className="max-w-lg mx-auto bg-bubu-gold text-bubu-base text-sm font-medium rounded-xl px-4 py-2.5 text-center shadow-lg">
          {copy.offline.banner}
        </div>
      </div>
    )
  }

  return null
}
