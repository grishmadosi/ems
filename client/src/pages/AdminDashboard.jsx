import { useState, useEffect } from 'react'

// Ticker Bar Component
function TickerBar() {
  const [offset, setOffset] = useState(0)

  const items = [
    'SYSTEM ONLINE',
    '3 ELECTIONS ACTIVE',
    '9,472 VOTES RECORDED',
    'ALL NODES SECURE',
    'INTEGRITY CHECK: PASSED',
  ]

  const tickerText = items.join(' // ')
  const repeatedText = tickerText + ' // ' + tickerText

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        // Reset when offset exceeds the length of one full text cycle
        const containerWidth = repeatedText.length * 8 // approximate px per character
        return (prev - 1) % containerWidth
      })
    }, 20)

    return () => clearInterval(interval)
  }, [repeatedText])

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--ems-amber)',
        color: 'var(--ems-bg)',
        overflow: 'hidden',
        padding: '0.5rem 0',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          transform: `translateX(${offset}px)`,
          transition: 'none',
        }}
      >
        {repeatedText}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const tabs = ['Overview', 'Elections', 'Users']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Ticker Bar */}
      <TickerBar />

      {/* Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--ems-surface)',
          borderBottom: '1px solid var(--ems-border)',
          zIndex: 1000,
          padding: '1rem',
        }}
      >
        {/* Logo and Title Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          {/* Left: Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Amber Logo Square */}
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--ems-amber)',
                borderRadius: '4px',
              }}
            />
            {/* Title */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#f3f4f6',
                margin: 0,
              }}
            >
              EMS Control
            </h1>
          </div>

          {/* Right: Clock and Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Clock */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                color: 'var(--ems-muted)',
              }}
            >
              {formatTime(time)}
            </div>

            {/* Avatar Circle */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--ems-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--ems-bg)',
              }}
            >
              AD
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '2rem', borderBottom: 'none' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0',
                fontSize: '0.95rem',
                color: activeTab === tab ? 'var(--ems-amber)' : 'var(--ems-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--ems-amber)' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 500 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <h2>Welcome to {activeTab}</h2>
        <p>Select a tab to view different sections.</p>
      </main>
    </div>
  )
}

export default AdminDashboard
