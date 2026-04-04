import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getElection, applyAsCandidate, requestOtp, castVote,
} from '../../services/api';
import Toast from '../../components/Toast';
import './Voter.css';

export default function VotingBooth() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // OTP state
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpEmailPreview, setOtpEmailPreview] = useState(null);
  const otpRefs = useRef([]);

  // Voting state
  const [selectedCandidates, setSelectedCandidates] = useState({}); // positionId -> candidateId
  const [votingPosition, setVotingPosition] = useState(null);
  const [castingVote, setCastingVote] = useState(false);

  // Apply state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyPositionId, setApplyPositionId] = useState('');
  const [applyParty, setApplyParty] = useState('');
  const [applyBio, setApplyBio] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Receipt state
  const [receipt, setReceipt] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const fetchElection = () => {
    getElection(id)
      .then(res => setElection(res.data))
      .catch(() => showToast('Failed to load election', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchElection(); }, [id]);

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleRequestOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await requestOtp(parseInt(id));
      setOtpRequested(true);
      setOtpEmailPreview(res.data.email_preview);
      showToast('OTP sent to your email');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCastVote = async (positionId) => {
    const candidateId = selectedCandidates[positionId];
    if (!candidateId) {
      showToast('Select a candidate first', 'error');
      return;
    }
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showToast('Enter the complete 6-digit OTP', 'error');
      return;
    }

    setCastingVote(true);
    setVotingPosition(positionId);
    try {
      const res = await castVote({
        election_id: parseInt(id),
        position_id: positionId,
        candidate_id: candidateId,
        otp: otpString,
      });
      setReceipt(res.data.receipt);
      showToast('Vote cast successfully!');
      // Refresh election data to update voted_positions
      fetchElection();
      // Reset OTP for next vote
      setOtp(['', '', '', '', '', '']);
      setOtpRequested(false);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to cast vote', 'error');
    } finally {
      setCastingVote(false);
      setVotingPosition(null);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyPositionId) {
      showToast('Select a position', 'error');
      return;
    }
    setApplyLoading(true);
    try {
      await applyAsCandidate(id, {
        position_id: parseInt(applyPositionId),
        party_name: applyParty,
        bio: applyBio,
      });
      showToast('Candidacy submitted!');
      setShowApplyModal(false);
      setApplyPositionId(''); setApplyParty(''); setApplyBio('');
      fetchElection();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to apply', 'error');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  if (!election) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <p>Election not found</p>
          <Link to="/elections" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Elections</Link>
        </div>
      </div>
    );
  }

  const isActive = election.status === 'active';
  const now = new Date();
  const withinTime = now >= new Date(election.start_time) && now <= new Date(election.end_time);
  const canVote = isActive && withinTime;

  return (
    <div className="voter-page">
      <div className="page-shell">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <Link to="/elections" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Elections
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">{election.title}</h1>
            {election.description && <div className="page-subtitle">{election.description}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge badge-${election.status}`}>{election.status}</span>
            {isActive && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowApplyModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Apply as Candidate
              </button>
            )}
          </div>
        </div>

        {/* OTP Section (only show for active within-time elections) */}
        {canVote && (
          <div className="otp-section">
            {!otpRequested ? (
              <>
                <p>To cast your vote, first request a one-time verification code.</p>
                <button className="btn btn-primary" onClick={handleRequestOtp} disabled={otpLoading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {otpLoading ? 'Sending...' : 'Request OTP'}
                </button>
              </>
            ) : (
              <>
                <p>Enter the 6-digit code sent to your email</p>
                <div className="otp-input-group">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {otpEmailPreview && (
                  <a href={otpEmailPreview} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--info)' }}>
                    View OTP email (dev preview)
                  </a>
                )}
                <button className="btn btn-sm btn-secondary" onClick={handleRequestOtp} disabled={otpLoading}>
                  Resend OTP
                </button>
              </>
            )}
          </div>
        )}

        {!canVote && isActive && (
          <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 20 }}>
            <p style={{ color: 'var(--warning)' }}>
              Voting is only allowed between {new Date(election.start_time).toLocaleString()} and {new Date(election.end_time).toLocaleString()}
            </p>
          </div>
        )}

        {/* Positions & Candidates */}
        {election.positions?.map(pos => {
          const hasVoted = election.voted_positions?.includes(pos.id);
          return (
            <div className="booth-section" key={pos.id}>
              <div className="booth-position-title">
                {pos.position_name}
                {hasVoted && (
                  <span className="booth-voted-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Voted
                  </span>
                )}
              </div>

              {pos.candidates?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  No candidates have applied for this position yet.
                </p>
              ) : (
                <div className="booth-candidates">
                  {pos.candidates.map(c => (
                    <div
                      key={c.id}
                      className={`candidate-option ${selectedCandidates[pos.id] === c.id ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!hasVoted && canVote) {
                          setSelectedCandidates({ ...selectedCandidates, [pos.id]: c.id });
                        }
                      }}
                      style={hasVoted ? { opacity: 0.6, cursor: 'default' } : {}}
                    >
                      <div className="radio-dot" />
                      <div className="candidate-info">
                        <div className="candidate-name">{c.candidate_name}</div>
                        {c.party_name && <div className="candidate-party">{c.party_name}</div>}
                        {c.bio && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.bio}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canVote && !hasVoted && pos.candidates?.length > 0 && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCastVote(pos.id)}
                  disabled={!selectedCandidates[pos.id] || !otpRequested || castingVote}
                >
                  {castingVote && votingPosition === pos.id ? 'Casting...' : 'Cast Vote for ' + pos.position_name}
                </button>
              )}

              <hr className="section-divider" />
            </div>
          );
        })}

        {/* Receipt Display */}
        {receipt && (
          <div className="receipt-card" style={{ marginTop: 24 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 style={{ marginTop: 12 }}>Vote Recorded</h3>
            <div className="receipt-code">{receipt.receipt_code}</div>
            <div style={{ textAlign: 'left', marginTop: 16 }}>
              <div className="receipt-detail-row">
                <span className="label">Election</span>
                <span className="value">{receipt.election_title}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="label">Position</span>
                <span className="value">{receipt.position_name}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="label">Candidate</span>
                <span className="value">{receipt.candidate_name}</span>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Keep this receipt code for your records. A confirmation email has been sent.
            </p>
          </div>
        )}

        {/* Apply as Candidate Modal */}
        {showApplyModal && (
          <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Apply as Candidate</h2>
              <form className="apply-form" onSubmit={handleApply}>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <select className="form-select" value={applyPositionId} onChange={e => setApplyPositionId(e.target.value)} required>
                    <option value="">Select a position</option>
                    {election.positions?.map(p => (
                      <option key={p.id} value={p.id}>{p.position_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Party / Affiliation (optional)</label>
                  <input className="form-input" placeholder="e.g. Independent" value={applyParty} onChange={e => setApplyParty(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio (optional)</label>
                  <textarea className="form-textarea" placeholder="Brief about yourself" value={applyBio} onChange={e => setApplyBio(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" type="submit" disabled={applyLoading}>
                    {applyLoading ? 'Submitting...' : 'Submit Candidacy'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
