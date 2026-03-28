import { useEffect, useState } from 'react'
import UserForm from './components/UserForm'
import UserTable from './components/UserTable'
import { createUser, deleteUser, getUsers } from './services/userService'
import './App.css'

function normalizeRole(value) {
  const role = String(value || '').toUpperCase()
  return role === 'ADMIN' ? 'ADMIN' : 'VOTER'
}

function parseStoredJson(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getRoleFromToken(token) {
  if (!token || !token.includes('.')) return null

  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const decoded = JSON.parse(atob(padded))
    return decoded?.role || decoded?.userRole || null
  } catch {
    return null
  }
}

function getLoggedInRole() {
  const directRole =
    localStorage.getItem('role') ||
    sessionStorage.getItem('role') ||
    parseStoredJson('user')?.role ||
    parseStoredJson('currentUser')?.role ||
    parseStoredJson('authUser')?.role ||
    parseStoredJson('emsUser')?.role

  if (directRole) return normalizeRole(directRole)

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('token')

  const tokenRole = getRoleFromToken(token)
  return normalizeRole(tokenRole)
}

function App() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentRole] = useState(() => getLoggedInRole())

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage(error.message || 'Failed to load users')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreateUser = async (payload) => {
    if (currentRole !== 'ADMIN') {
      setMessage('Only admins can add users.')
      return
    }

    setIsLoading(true)
    setMessage('')
    try {
      await createUser(payload, currentRole)
      await loadUsers()
      setMessage('User added successfully.')
    } catch (error) {
      setMessage(error.message || 'Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!id) return

    try {
      await deleteUser(id)
      await loadUsers()
      setMessage('User deleted successfully.')
    } catch (error) {
      setMessage(error.message || 'Failed to delete user')
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="logo">EMS</div>
        <ul className="nav-links">
          <li>
            <a href="#services">Services</a>
          </li>
          <li>
            <a href="#manage">Manage</a>
          </li>
          <li>
            <a href="#users">Users</a>
          </li>
        </ul>
        <a className="nav-btn" href="#manage">
          Get Started
        </a>
      </nav>

      <main className="services-section" id="services">
        <div className="container">
          <h1 className="section-title">Election Management Services</h1>
          <p className="section-subtitle">
            Manage election users with a clean dashboard. Add users, monitor the list, and keep
            your platform organized.
          </p>

          <div className="role-switch" aria-live="polite">
            <span className="role-label">Current User Role:</span>
            <span
              className={`role-badge ${currentRole === 'ADMIN' ? 'role-admin' : 'role-voter'}`}
            >
              {currentRole}
            </span>
          </div>

          {message && <p className="message">{message}</p>}

          <div className="services-grid">
            <section className="service-card" id="manage">
              <div className="card-top sky">
                <span className="icon">+</span>
              </div>
              <div className="card-body">
                <h3>Add User</h3>
                <p>Create a new voter or admin account.</p>
                {currentRole === 'ADMIN' ? (
                  <UserForm onSubmit={handleCreateUser} isLoading={isLoading} />
                ) : (
                  <p className="access-note">Admin access required to add users.</p>
                )}
              </div>
            </section>

            <section className="service-card" id="users">
              <div className="card-top blue">
                <span className="icon">U</span>
              </div>
              <div className="card-body">
                <h3>Users</h3>
                <p>View and remove users directly from the table.</p>
                <UserTable users={users} onDelete={handleDeleteUser} />
              </div>
            </section>

            <section className="service-card">
              <div className="card-top amber">
                <span className="icon">#</span>
              </div>
              <div className="card-body">
                <h3>Total Users</h3>
                <p>Current registered users in the system.</p>
                <p className="stats-count">{users.length}</p>
              </div>
            </section>
          </div>

          <a className="main-btn" href="#manage">
            Manage Users
          </a>
        </div>
      </main>
    </>
  )
}

export default App
