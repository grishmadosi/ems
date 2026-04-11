import { useState, useEffect } from 'react'

// Status Badge Component
function StatusBadge({ status }) {
  const statusColors = {
    ACTIVE: '#3ddc84',
    UPCOMING: 'var(--ems-amber)',
    ENDED: '#9c7db5',
    PENDING: '#9c7db5',
    COMPLETED: '#7b9fff',
    CANCELLED: '#ff6b6b',
  }

  return (
    <div
      style={{
        display: 'inline-block',
        backgroundColor: statusColors[status] || '#5a5a7a',
        color: 'var(--ems-bg)',
        padding: '0.35rem 0.75rem',
        borderRadius: '3px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {status}
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--ems-surface)',
        border: `3px solid ${accent}`,
        borderTop: `3px solid ${accent}`,
        borderRight: '1px solid var(--ems-border)',
        borderBottom: '1px solid var(--ems-border)',
        borderLeft: '1px solid var(--ems-border)',
        padding: '1.5rem',
        borderRadius: '4px',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          textTransform: 'uppercase',
          color: 'var(--ems-muted)',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '38px',
          fontWeight: 700,
          color: '#f3f4f6',
          lineHeight: '1.1',
        }}
      >
        {value}
      </div>

      {/* Sub */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--ems-muted)',
          marginTop: 'auto',
        }}
      >
        {sub}
      </div>
    </div>
  )
}

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
  const [showCreateElection, setShowCreateElection] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@ems.gov',
      role: 'ADMIN',
      joined: '2024-01-15',
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@ems.gov',
      role: 'VOTER',
      joined: '2024-02-20',
    },
    {
      id: 3,
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol.williams@ems.gov',
      role: 'ADMIN',
      joined: '2024-01-10',
    },
    {
      id: 4,
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@ems.gov',
      role: 'VOTER',
      joined: '2024-03-05',
    },
    {
      id: 5,
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@ems.gov',
      role: 'VOTER',
      joined: '2024-02-28',
    },
    {
      id: 6,
      firstName: 'Frank',
      lastName: 'Miller',
      email: 'frank.miller@ems.gov',
      role: 'ADMIN',
      joined: '2024-01-20',
    },
  ])

  const handleRemoveUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  // Mock Elections Data
  const mockElections = [
    {
      id: 1,
      name: 'Presidential Election 2024',
      positions: 5,
      endDate: '2024-11-15',
      votes: 3420,
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Board Member Selection',
      positions: 3,
      endDate: '2024-10-20',
      votes: 1820,
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Referendum 2024',
      positions: 2,
      endDate: '2024-12-01',
      votes: 2232,
      status: 'ACTIVE',
    },
    {
      id: 4,
      name: 'City Council Vote',
      positions: 7,
      endDate: '2024-09-30',
      votes: 1970,
      status: 'ENDED',
    },
    {
      id: 5,
      name: 'School Board Election',
      positions: 4,
      endDate: '2024-11-30',
      votes: 892,
      status: 'UPCOMING',
    },
    {
      id: 6,
      name: 'State Proposition Vote',
      positions: 1,
      endDate: '2025-01-10',
      votes: 0,
      status: 'UPCOMING',
    },
    {
      id: 7,
      name: 'Mayor Election 2023',
      positions: 1,
      endDate: '2023-08-15',
      votes: 5420,
      status: 'ENDED',
    },
  ]

  const activeElections = mockElections.filter((e) => e.status === 'ACTIVE')

  // Filter elections based on selected filter
  const filteredElections =
    filterStatus === 'ALL'
      ? mockElections
      : mockElections.filter((e) => e.status === filterStatus)

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
        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '2rem',
            width: '100%',
          }}
        >
          <StatCard
            label="Registered Users"
            value="1284"
            sub="↑ 24 this week"
            accent="var(--ems-amber)"
          />
          <StatCard
            label="Active Elections"
            value="3"
            sub="3 in progress"
            accent="#3ddc84"
          />
          <StatCard
            label="Votes Cast"
            value="9472"
            sub="All time"
            accent="#7b9fff"
          />
          <StatCard
            label="Pending Elections"
            value="2"
            sub="Not yet started"
            accent="#9c7db5"
          />
        </div>

        {/* Elections List - Only show in Overview tab */}
        {activeTab === 'Overview' && (
          <>
            <div style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  color: '#f3f4f6',
                  marginBottom: '1rem',
                }}
              >
                Active Elections
              </h3>

              {/* Elections Table */}
              <div
                style={{
                  backgroundColor: 'var(--ems-surface)',
                  border: '1px solid var(--ems-border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderBottom: '1px solid var(--ems-border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--ems-muted)',
                    fontWeight: 600,
                  }}
                >
                  <div>Election Name</div>
                  <div>Positions</div>
                  <div>End Date</div>
                  <div>Votes</div>
                  <div>Status</div>
                </div>

                {/* Table Rows */}
                {activeElections.map((election, idx) => (
                  <div
                    key={election.id}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      gap: '1rem',
                      padding: '1rem',
                      borderBottom:
                        idx < activeElections.length - 1
                          ? '1px solid var(--ems-border)'
                          : 'none',
                      backgroundColor:
                        hoveredRow === idx
                          ? 'rgba(245, 197, 66, 0.05)'
                          : 'transparent',
                      transition: 'background-color 0.2s ease',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ color: '#f3f4f6', fontSize: '0.95rem' }}>
                      {election.name}
                    </div>
                    <div style={{ color: 'var(--ems-muted)', fontSize: '0.95rem' }}>
                      {election.positions}
                    </div>
                    <div
                      style={{
                        color: 'var(--ems-muted)',
                        fontSize: '0.95rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {new Date(election.endDate).toLocaleDateString()}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--ems-amber)',
                      }}
                    >
                      {election.votes.toLocaleString()}
                    </div>
                    <div>
                      <StatusBadge status={election.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem',
              }}
            >
              {/* Primary Button - Create Election */}
              <button
                onClick={() => setShowCreateElection(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--ems-amber)',
                  color: 'var(--ems-bg)',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                Create Election
              </button>

              {/* Ghost Button - Add User */}
              <button
                onClick={() => setShowAddUser(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--ems-amber)',
                  border: '1px solid var(--ems-amber)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(245, 197, 66, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
              >
                Add User
              </button>

              {/* Ghost Button - View Results */}
              <button
                onClick={() => setActiveTab('Elections')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--ems-amber)',
                  border: '1px solid var(--ems-amber)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(245, 197, 66, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
              >
                View Results
              </button>
            </div>

            {/* Modal Indicators */}
            {showCreateElection && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--ems-surface)',
                  border: '1px solid var(--ems-border)',
                  padding: '2rem',
                  borderRadius: '4px',
                  zIndex: 2000,
                  textAlign: 'center',
                }}
              >
                <h2 style={{ color: '#f3f4f6', marginBottom: '1rem' }}>
                  Create Election Modal
                </h2>
                <p style={{ color: 'var(--ems-muted)', marginBottom: '1rem' }}>
                  This modal would open here.
                </p>
                <button
                  onClick={() => setShowCreateElection(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--ems-amber)',
                    color: 'var(--ems-bg)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            )}

            {showAddUser && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--ems-surface)',
                  border: '1px solid var(--ems-border)',
                  padding: '2rem',
                  borderRadius: '4px',
                  zIndex: 2000,
                  textAlign: 'center',
                }}
              >
                <h2 style={{ color: '#f3f4f6', marginBottom: '1rem' }}>
                  Add User Modal
                </h2>
                <p style={{ color: 'var(--ems-muted)', marginBottom: '1rem' }}>
                  This modal would open here.
                </p>
                <button
                  onClick={() => setShowAddUser(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--ems-amber)',
                    color: 'var(--ems-bg)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}

        {/* Elections Tab Content */}
        {activeTab === 'Elections' && (
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: '#f3f4f6',
                marginBottom: '1.5rem',
              }}
            >
              All Elections
            </h3>

            {/* Filter Pills */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '2rem',
              }}
            >
              {['ALL', 'ACTIVE', 'UPCOMING', 'ENDED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor:
                      filterStatus === filter ? 'var(--ems-amber)' : 'transparent',
                    color:
                      filterStatus === filter
                        ? 'var(--ems-bg)'
                        : 'var(--ems-amber)',
                    border:
                      filterStatus === filter
                        ? 'none'
                        : '1px solid var(--ems-amber)',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (filterStatus !== filter) {
                      e.target.style.backgroundColor = 'rgba(245, 197, 66, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus !== filter) {
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Elections Table */}
            <div
              style={{
                backgroundColor: 'var(--ems-surface)',
                border: '1px solid var(--ems-border)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderBottom: '1px solid var(--ems-border)',
                    }}
                  >
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Election Name
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Positions
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Votes
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      End Date
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredElections.map((election, idx) => (
                    <tr
                      key={election.id}
                      style={{
                        backgroundColor:
                          idx % 2 === 0
                            ? 'var(--ems-bg)'
                            : 'var(--ems-surface)',
                        borderBottom: '1px solid var(--ems-border)',
                      }}
                    >
                      <td
                        style={{
                          padding: '1rem',
                          color: '#f3f4f6',
                          fontSize: '0.95rem',
                        }}
                      >
                        {election.name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <StatusBadge status={election.status} />
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: 'var(--ems-muted)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {election.positions}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontFamily: 'var(--font-display)',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--ems-amber)',
                        }}
                      >
                        {election.votes.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: 'var(--ems-muted)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {new Date(election.endDate).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Results Button */}
                        <button
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: 'transparent',
                            color: '#7b9fff',
                            border: '1px solid #7b9fff',
                            borderRadius: '3px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(123, 159, 255, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent'
                          }}
                        >
                          Results
                        </button>

                        {/* Edit Button */}
                        <button
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: 'transparent',
                            color: '#9c7db5',
                            border: '1px solid #9c7db5',
                            borderRadius: '3px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(156, 125, 181, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent'
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'Users' && (
          <div>
            {/* Header with User Count and Add User Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: '#f3f4f6',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  System Users
                </h3>
                <p
                  style={{
                    color: 'var(--ems-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    margin: 0,
                  }}
                >
                  Total Users: {users.length}
                </p>
              </div>

              {/* Add User Button */}
              <button
                onClick={() => setShowAddUser(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--ems-amber)',
                  color: 'var(--ems-bg)',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                + Add User
              </button>
            </div>

            {/* Users Table */}
            <div
              style={{
                backgroundColor: 'var(--ems-surface)',
                border: '1px solid var(--ems-border)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderBottom: '1px solid var(--ems-border)',
                    }}
                  >
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Joined
                    </th>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ems-muted)',
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    return (
                      <tr
                        key={user.id}
                        style={{
                          backgroundColor:
                            idx % 2 === 0
                              ? 'var(--ems-bg)'
                              : 'var(--ems-surface)',
                          borderBottom: '1px solid var(--ems-border)',
                        }}
                      >
                        {/* User with Avatar */}
                        <td
                          style={{
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          {/* Avatar Circle */}
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--ems-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#7b9fff',
                              border: '1px solid var(--ems-border)',
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ color: '#f3f4f6' }}>
                            {user.firstName} {user.lastName}
                          </div>
                        </td>

                        {/* Email */}
                        <td
                          style={{
                            padding: '1rem',
                            color: 'var(--ems-muted)',
                            fontSize: '0.9rem',
                          }}
                        >
                          {user.email}
                        </td>

                        {/* Role Badge */}
                        <td style={{ padding: '1rem' }}>
                          <div
                            style={{
                              display: 'inline-block',
                              backgroundColor:
                                user.role === 'ADMIN'
                                  ? 'rgba(156, 125, 181, 0.2)'
                                  : 'rgba(61, 220, 132, 0.2)',
                              color:
                                user.role === 'ADMIN'
                                  ? '#9c7db5'
                                  : '#3ddc84',
                              border:
                                user.role === 'ADMIN'
                                  ? '1px solid #9c7db5'
                                  : '1px solid #3ddc84',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '3px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            {user.role}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td
                          style={{
                            padding: '1rem',
                            color: 'var(--ems-muted)',
                            fontSize: '0.9rem',
                          }}
                        >
                          {new Date(user.joined).toLocaleDateString()}
                        </td>

                        {/* Remove Button */}
                        <td
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                          }}
                        >
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: 'transparent',
                              color: '#ff6b6b',
                              border: '1px solid #ff6b6b',
                              borderRadius: '3px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
