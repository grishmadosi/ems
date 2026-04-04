import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getStats, getVoters, addVoter, deleteVoter,
  getElections, createElection, publishElection, endElection, getResults,
} from '../../services/api';
import Toast from '../../components/Toast';
import './Admin.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('voters');
  const [stats, setStats] = useState({ voters: 0, elections: 0, active_elections: 0, total_votes: 0 });
  const [toast, setToast] = useState(null);

  // -- Voters state
  const [voters, setVoters] = useState([]);
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [addingVoter, setAddingVoter] = useState(false);
  const [lastEmailPreview, setLastEmailPreview] = useState(null);

  // -- Elections state
  const [elections, setElections] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [elTitle, setElTitle] = useState('');
  const [elDesc, setElDesc] = useState('');
  const [elStart, setElStart] = useState('');
  const [elEnd, setElEnd] = useState('');
  const [elPositions, setElPositions] = useState([{ name: '', description: '' }]);
  const [creatingElection, setCreatingElection] = useState(false);

  // -- Results state
  const [resultsModal, setResultsModal] = useState(null); // { election, results }

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = useCallback(async () => {
    try {
      const [s, v, e] = await Promise.all([getStats(), getVoters(), getElections()]);
      setStats(s.data);
      setVoters(v.data);
      setElections(e.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Voters ──────────────────────────────────────────────────────────────────
  const handleAddVoter = async (e) => {
    e.preventDefault();
    if (!voterName.trim() || !voterEmail.trim()) return;
    setAddingVoter(true);
    try {
      const res = await addVoter(voterName, voterEmail);
      setLastEmailPreview(res.data.email_preview);
      setVoterName('');
      setVoterEmail('');
      showToast('Voter registered -- credentials emailed');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add voter', 'error');
    } finally {
      setAddingVoter(false);
    }
  };

  const handleDeleteVoter = async (id) => {
    try {
      await deleteVoter(id);
      showToast('Voter removed');
      fetchData();
    } catch (err) {
      showToast('Failed to remove voter', 'error');
    }
  };

  // ── Elections ───────────────────────────────────────────────────────────────
  const addPositionRow = () => {
    setElPositions([...elPositions, { name: '', description: '' }]);
  };

  const removePositionRow = (idx) => {
    if (elPositions.length <= 1) return;
    setElPositions(elPositions.filter((_, i) => i !== idx));
  };

  const updatePosition = (idx, field, value) => {
    const updated = [...elPositions];
    updated[idx][field] = value;
    setElPositions(updated);
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    const validPositions = elPositions.filter(p => p.name.trim());
    if (!elTitle.trim() || !elStart || !elEnd || validPositions.length === 0) {
      showToast('Fill all fields and add at least one position', 'error');
      return;
    }
    setCreatingElection(true);
    try {
      await createElection({
        title: elTitle,
        description: elDesc,
        start_time: elStart,
        end_time: elEnd,
        positions: validPositions,
      });
      showToast('Election created');
      setShowCreateModal(false);
      setElTitle(''); setElDesc(''); setElStart(''); setElEnd('');
      setElPositions([{ name: '', description: '' }]);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create election', 'error');
    } finally {
      setCreatingElection(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishElection(id);
      showToast('Election published');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to publish', 'error');
    }
  };

  const handleEnd = async (id) => {
    try {
      await endElection(id);
      showToast('Election ended');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to end election', 'error');
    }
  };

  const handleViewResults = async (electionId, electionTitle) => {
    try {
      const res = await getResults(electionId);
      setResultsModal({ title: electionTitle, results: res.data.results });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch results', 'error');
    }
  };

  const formatDate = (d) => {
    if (!d) return '--';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      <div className="page-shell">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <div className="page-subtitle">Welcome, {user?.full_name}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-label">Registered Voters</span>
            <span className="stat-value">{stats.voters}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Elections</span>
            <span className="stat-value">{stats.elections}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Elections</span>
            <span className="stat-value">{stats.active_elections}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Votes Cast</span>
            <span className="stat-value">{stats.total_votes}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'voters' ? 'active' : ''}`} onClick={() => setTab('voters')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: -2}}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Voter Management
          </button>
          <button className={`tab-btn ${tab === 'elections' ? 'active' : ''}`} onClick={() => setTab('elections')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: -2}}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Elections
          </button>
        </div>

        {/* ── VOTERS TAB ── */}
        {tab === 'voters' && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>Register New Voter</h3>
              <form onSubmit={handleAddVoter}>
                <div className="voter-form-row">
                  <div className="form-group">
                    <input
                      id="voter-name-input"
                      className="form-input"
                      placeholder="Full Name"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      id="voter-email-input"
                      className="form-input"
                      type="email"
                      placeholder="Email address"
                      value={voterEmail}
                      onChange={(e) => setVoterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button id="add-voter-btn" className="btn btn-primary" type="submit" disabled={addingVoter}>
                    {addingVoter ? 'Adding...' : 'Add Voter'}
                  </button>
                </div>
              </form>
              {lastEmailPreview && (
                <div style={{ marginTop: 12 }}>
                  <a href={lastEmailPreview} target="_blank" rel="noreferrer" className="email-preview-link">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    View sent email (Ethereal preview)
                  </a>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Registered Voters ({voters.length})</h3>
              {voters.length === 0 ? (
                <div className="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <p>No voters registered yet</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Registered</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters.map((v) => (
                        <tr key={v.id}>
                          <td>{v.full_name}</td>
                          <td><span className="mono">{v.email}</span></td>
                          <td>{formatDate(v.created_at)}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteVoter(v.id)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ELECTIONS TAB ── */}
        {tab === 'elections' && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button id="create-election-btn" className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Election
              </button>
            </div>

            {elections.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>No elections created yet</p>
                </div>
              </div>
            ) : (
              <div className="election-list">
                {elections.map((el) => (
                  <div className="election-item" key={el.id}>
                    <div className="election-item-info">
                      <div className="election-item-title">{el.title}</div>
                      <div className="election-item-meta">
                        <span className={`badge badge-${el.status}`}>{el.status}</span>
                        <span>{formatDate(el.start_time)} - {formatDate(el.end_time)}</span>
                      </div>
                    </div>
                    <div className="election-item-actions">
                      {el.status === 'draft' && (
                        <button className="btn btn-sm btn-success" onClick={() => handlePublish(el.id)}>
                          Publish
                        </button>
                      )}
                      {el.status === 'active' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleEnd(el.id)}>
                          End
                        </button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => handleViewResults(el.id, el.title)}>
                        Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE ELECTION MODAL ── */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Create Election</h2>
              <form className="election-form" onSubmit={handleCreateElection}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input id="election-title" className="form-input" placeholder="e.g. Student Council 2026" value={elTitle} onChange={e => setElTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Optional description" value={elDesc} onChange={e => setElDesc(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input className="form-input" type="datetime-local" value={elStart} onChange={e => setElStart(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input className="form-input" type="datetime-local" value={elEnd} onChange={e => setElEnd(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Positions</label>
                  <div className="positions-list">
                    {elPositions.map((p, i) => (
                      <div className="position-row" key={i}>
                        <input
                          className="form-input"
                          placeholder={`Position ${i + 1} (e.g. President)`}
                          value={p.name}
                          onChange={e => updatePosition(i, 'name', e.target.value)}
                          required
                        />
                        {elPositions.length > 1 && (
                          <button type="button" className="position-remove" onClick={() => removePositionRow(i)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addPositionRow} style={{ marginTop: 8 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Position
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn btn-primary" type="submit" disabled={creatingElection} style={{ flex: 1 }}>
                    {creatingElection ? 'Creating...' : 'Create Election'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── RESULTS MODAL ── */}
        {resultsModal && (
          <div className="modal-overlay" onClick={() => setResultsModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Results: {resultsModal.title}</h2>
              {resultsModal.results.length === 0 ? (
                <div className="empty-state">
                  <p>No votes recorded yet</p>
                </div>
              ) : (
                <div className="results-section">
                  {resultsModal.results.map((pos) => {
                    const maxVotes = Math.max(...pos.candidates.map(c => c.vote_count), 1);
                    return (
                      <div className="results-position" key={pos.position_id}>
                        <h3>{pos.position_name}</h3>
                        {pos.candidates.map((c) => (
                          <div className="results-candidate" key={c.candidate_id}>
                            <div className="results-candidate-info">
                              <div className="results-candidate-name">{c.candidate_name}</div>
                              {c.party_name && <div className="results-candidate-party">{c.party_name}</div>}
                              <div className="result-bar-wrap">
                                <div className="result-bar-bg">
                                  <div className="result-bar-fill" style={{ width: `${(c.vote_count / maxVotes) * 100}%` }} />
                                </div>
                                <div className="result-count">{c.vote_count} vote{c.vote_count !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <hr className="section-divider" />
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="btn btn-secondary" onClick={() => setResultsModal(null)} style={{ width: '100%', marginTop: 8 }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
