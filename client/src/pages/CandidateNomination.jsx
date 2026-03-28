import { useState, useRef, useEffect } from 'react'
import './CandidateNomination.css'

const POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Joint Secretary',
  'Cultural Secretary',
  'Sports Secretary',
]

const INITIAL_FORM = {
  name: '',
  party: '',
  position: '',
  description: '',
  photoUrl: '',
}

function Toast({ message, onClose }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onClose, 250)
    }, 2800)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast success ${exiting ? 'exiting' : ''}`}>
      <span className="toast-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
      <span>{message}</span>
    </div>
  )
}

export default function CandidateNomination() {
  const [candidates, setCandidates] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const nameInputRef = useRef(null)

  // Load existing nominations from the database on mount
  useEffect(() => {
    const fetchNominations = async () => {
      try {
        const res = await fetch('/api/nominations')
        if (!res.ok) throw new Error('Failed to load nominations')
        const data = await res.json()
        setCandidates(data)
      } catch (err) {
        console.error('Error loading nominations:', err)
        setToast('Failed to load nominations from server')
      }
    }
    fetchNominations()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Candidate name is required'
    if (!form.party.trim()) errs.party = 'Party or affiliation is required'
    if (!form.position) errs.position = 'Select a position'
    if (form.photoUrl.trim() && !isValidUrl(form.photoUrl.trim())) {
      errs.photoUrl = 'Enter a valid URL'
    }
    return errs
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: form.name.trim(),
          party_name: form.party.trim(),
          position: form.position,
          description: form.description.trim() || null,
          photo_url: form.photoUrl.trim() || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Server error')
      }

      const saved = await res.json()
      setCandidates((prev) => [saved, ...prev])
      setForm(INITIAL_FORM)
      setErrors({})
      setToast(`${saved.candidate_name} nominated successfully`)
      nameInputRef.current?.focus()
    } catch (err) {
      console.error('Nomination error:', err)
      setToast(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/nominations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setCandidates((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
      setToast('Candidate removed')
    } catch (err) {
      console.error('Delete error:', err)
      setToast('Error: Could not remove candidate')
    }
  }

  const filteredCandidates = candidates.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.candidate_name.toLowerCase().includes(q) ||
      c.party_name.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q)
    )
  })

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="nomination-page">
      {/* Toast */}
      <div className="toast-container">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>

      {/* Header */}
      <header className="nomination-header">
        <div className="badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> Nomination Portal
        </div>
        <h1>Candidate Nomination</h1>
        <p>
          Register candidates for upcoming elections. Fill in the details below
          to add a nominee to the ballot.
        </p>
      </header>

      {/* Content */}
      <div className="nomination-content">
        {/* Form */}
        <form className="form-panel" onSubmit={handleSubmit} noValidate>
          <h2 className="form-panel-title">New Nomination</h2>
          <p className="form-panel-subtitle">
            Fields marked with * are required
          </p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.name && (
                <div className="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="party">
                Party / Affiliation <span className="required">*</span>
              </label>
              <input
                type="text"
                id="party"
                name="party"
                className={`form-input ${errors.party ? 'error' : ''}`}
                placeholder="e.g. Student Alliance"
                value={form.party}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.party && (
                <div className="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> {errors.party}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="position">
              Position <span className="required">*</span>
            </label>
            <select
              id="position"
              name="position"
              className={`form-select ${errors.position ? 'error' : ''}`}
              value={form.position}
              onChange={handleChange}
            >
              <option value="">-- Select a position --</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            {errors.position && (
              <div className="field-error">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> {errors.position}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Brief background, qualifications, or campaign message..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="photoUrl">Photo URL</label>
            <div className="photo-preview-row">
              <input
                type="url"
                id="photoUrl"
                name="photoUrl"
                className={`form-input ${errors.photoUrl ? 'error' : ''}`}
                placeholder="https://example.com/photo.jpg"
                value={form.photoUrl}
                onChange={handleChange}
              />
              {form.photoUrl && isValidUrl(form.photoUrl) && (
                <img
                  src={form.photoUrl}
                  alt="Preview"
                  className="photo-preview"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              )}
            </div>
            {errors.photoUrl && (
              <div className="field-error">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> {errors.photoUrl}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <div className="spinner" />
                Nominating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Nominate Candidate
              </>
            )}
          </button>
        </form>

        {/* Candidate List */}
        <div className="list-panel">
          <div className="list-panel-header">
            <h2>
              Nominated Candidates
              {candidates.length > 0 && (
                <span className="candidate-count">{candidates.length}</span>
              )}
            </h2>
          </div>

          {candidates.length > 0 && (
            <div className="search-wrapper">
              <span className="search-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, party, or position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></div>
              <h3>No Candidates Yet</h3>
              <p>
                Use the form on the left to nominate your first candidate.
              </p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg></div>
              <h3>No Matches Found</h3>
              <p>Try a different search term.</p>
            </div>
          ) : (
            <div className="candidate-grid">
              {filteredCandidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="candidate-card"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  {candidate.photo_url ? (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.candidate_name}
                      className="candidate-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling &&
                          (e.target.nextSibling.style.display = 'flex')
                      }}
                    />
                  ) : null}
                  {!candidate.photo_url && (
                    <div className="candidate-avatar-placeholder">
                      {getInitials(candidate.candidate_name)}
                    </div>
                  )}

                  <div className="candidate-info">
                    <div className="candidate-name">{candidate.candidate_name}</div>
                    <div className="candidate-meta">
                      <span className="candidate-tag party">
                        {candidate.party_name}
                      </span>
                      <span className="candidate-tag position">
                        {candidate.position}
                      </span>
                    </div>
                    {candidate.description && (
                      <div className="candidate-desc">
                        {candidate.description}
                      </div>
                    )}
                  </div>

                  <div className="candidate-actions">
                    {deleteConfirm === candidate.id ? (
                      <div className="delete-confirm">
                        <button
                          className="delete-confirm-btn yes"
                          onClick={() => handleDelete(candidate.id)}
                        >
                          Yes
                        </button>
                        <button
                          className="delete-confirm-btn no"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="delete-btn"
                        title="Remove candidate"
                        onClick={() => setDeleteConfirm(candidate.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
