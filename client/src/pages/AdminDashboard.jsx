import { useState, useEffect } from 'react'
import axios from 'axios'

// API Base URL - adjust if needed
const API_BASE_URL = 'http://localhost:3000/api' // Change to your backend URL

// Axios instance with JWT token
const createAxiosInstance = () => {
  const token = localStorage.getItem('ems_token')
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  })
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--ems-border)',
          borderTop: '3px solid var(--ems-amber)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Error Banner Component
function ErrorBanner({ message, onClose }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
        border: '1px solid #ff6b6b',
        borderRadius: '4px',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ color: '#ff6b6b', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#ff6b6b',
          cursor: 'pointer',
          fontSize: '1.2rem',
        }}
      >
        ×
      </button>
    </div>
  )
}


// Reusable Modal Component
function Modal({ title, onClose, children }) {
  return (
    <>
      {/* Overlay - click outside closes modal */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1999,
        }}
      />

      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()} // Don't close when clicking inside modal
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--ems-surface)',
          borderTop: '3px solid var(--ems-amber)',
          border: '1px solid var(--ems-border)',
          borderTop: '3px solid var(--ems-amber)',
          borderRadius: '4px',
          zIndex: 2000,
          minWidth: '500px',
          maxWidth: '600px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: '1px solid var(--ems-border)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#f3f4f6',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--ems-muted)',
              cursor: 'pointer',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--ems-amber)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--ems-muted)')}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </>
  )
}

// Add User Modal
function AddUserModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'VOTER',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required'
    if (!formData.email.trim()) newErrors.email = 'Email required'
    if (!formData.password.trim()) newErrors.password = 'Password required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'VOTER' })
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <Modal title="Add New User" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* First Name */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.firstName ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
            placeholder="John"
          />
          {errors.firstName && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.firstName}
            </span>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.lastName ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
            placeholder="Doe"
          />
          {errors.lastName && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.lastName}
            </span>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.email ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
            placeholder="john@example.com"
          />
          {errors.email && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.password ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
            placeholder="••••••••"
          />
          {errors.password && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.password}
            </span>
          )}
        </div>

        {/* Role Select */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
          >
            <option value="VOTER">Voter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
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
            Create
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
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
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Create Election Modal
function CreateElectionModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Election name required'
    if (!formData.description.trim()) newErrors.description = 'Description required'
    if (!formData.startTime) newErrors.startTime = 'Start time required'
    if (!formData.endTime) newErrors.endTime = 'End time required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
    setFormData({ name: '', description: '', startTime: '', endTime: '' })
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <Modal title="Create New Election" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Election Name */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Election Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.name ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
            placeholder="Presidential Election 2025"
          />
          {errors.name && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.description ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              minHeight: '100px',
              resize: 'vertical',
            }}
            placeholder="Election details and description..."
          />
          {errors.description && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.description}
            </span>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.startTime ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
          />
          {errors.startTime && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.startTime}
            </span>
          )}
        </div>

        {/* End Time */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--ems-muted)',
              display: 'block',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ems-bg)',
              border: errors.endTime ? '1px solid #ff6b6b' : '1px solid var(--ems-border)',
              borderRadius: '3px',
              color: '#f3f4f6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
          />
          {errors.endTime && (
            <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.endTime}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
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
            Create
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
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
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])
  const [elections, setElections] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeElections: 0,
    totalVotesCast: 0,
  })

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      const api = createAxiosInstance()

      try {
        // Fetch users
        const usersResponse = await api.get('/admin/users')
        const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.data || []
        setUsers(usersData)

        // Fetch elections/polls
        const electionsResponse = await api.get('/polls')
        const electionsData = Array.isArray(electionsResponse.data)
          ? electionsResponse.data
          : electionsResponse.data.data || []
        setElections(electionsData)

        // Fetch stats
        const statsResponse = await api.get('/admin/stats')
        setStats(
          statsResponse.data.data || {
            totalUsers: usersData.length,
            activeElections: electionsData.filter((e) => e.status === 'ACTIVE').length,
            totalVotesCast: 0,
          }
        )
      } catch (err) {
        console.error('API Error:', err)
        setError(
          err.response?.data?.message || 'Failed to load data. Using mock data.'
        )
        // Fallback to mock data if API fails
        setUsers([
          {
            id: 1,
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@ems.gov',
            role: 'ADMIN',
            joined: '2024-01-15',
          },
          {
            id: 2,
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob@ems.gov',
            role: 'VOTER',
            joined: '2024-02-20',
          },
        ])
        setElections([
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
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Time update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRemoveUser = async (userId) => {
    try {
      const api = createAxiosInstance()
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter((user) => user.id !== userId))
    } catch (err) {
      setError('Failed to remove user: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleAddUser = async (formData) => {
    try {
      const api = createAxiosInstance()
      const response = await api.post('/admin/users', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      const newUser = response.data.data || response.data
      setUsers([...users, newUser])
      setShowAddUser(false)
    } catch (err) {
      setError('Failed to add user: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleCreateElection = async (formData) => {
    try {
      const api = createAxiosInstance()
      const response = await api.post('/polls', {
        poll_name: formData.name,
        description: formData.description,
        start_time: formData.startTime,
        end_time: formData.endTime,
      })
      const newElection = response.data.data || response.data
      setElections([...elections, newElection])
      setShowCreateElection(false)
    } catch (err) {
      setError(
        'Failed to create election: ' + (err.response?.data?.message || err.message)
      )
    }
  }

  const activeElections = elections.filter((e) => e.status === 'ACTIVE')
  const filteredElections =
    filterStatus === 'ALL'
      ? elections
      : elections.filter((e) => e.status === filterStatus)

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
        {/* Error Banner */}
        {error && (
          <ErrorBanner message={error} onClose={() => setError(null)} />
        )}

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
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
                value={stats.totalUsers || users.length}
                sub="↑ 24 this week"
                accent="var(--ems-amber)"
              />
              <StatCard
                label="Active Elections"
                value={stats.activeElections || activeElections.length}
                sub="3 in progress"
                accent="#3ddc84"
              />
              <StatCard
                label="Votes Cast"
                value={stats.totalVotesCast || 0}
                sub="All time"
                accent="#7b9fff"
              />
              <StatCard
                label="Pending Elections"
                value={elections.filter((e) => e.status === 'UPCOMING').length}
                sub="Not yet started"
                accent="#9c7db5"
              />
            </div>

            <div
              key={activeTab}
              style={{
                animation: 'fadeIn 0.3s ease',
              }}
            >

            {/* Elections List - Only show in Overview tab */}
            {activeTab === 'Overview' && (
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
            </div>
            </>
        )}

        {/* Modal Components */}
        <CreateElectionModal
          isOpen={showCreateElection}
          onClose={() => setShowCreateElection(false)}
          onSubmit={handleCreateElection}
        />

        <AddUserModal
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          onSubmit={handleAddUser}
        />
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--ems-border)',
          backgroundColor: 'var(--ems-surface)',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--ems-muted)',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          EMS v1.0.0 · ELECTION MANAGEMENT SYSTEM
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#3ddc84',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3ddc84',
              animation: 'pulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 0 0 rgba(61, 220, 132, 0.5)',
            }}
          />
          ALL SYSTEMS OPERATIONAL
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(61, 220, 132, 0.45); }
          70% { box-shadow: 0 0 0 8px rgba(61, 220, 132, 0); }
          100% { box-shadow: 0 0 0 0 rgba(61, 220, 132, 0); }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard
