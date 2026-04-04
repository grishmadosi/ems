import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getElections } from '../../services/api';
import './Voter.css';

export default function ElectionList() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getElections()
      .then(res => setElections(res.data))
      .catch(err => console.error('Fetch elections error:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return '--';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const activeElections = elections.filter(e => e.status === 'active');
  const completedElections = elections.filter(e => e.status === 'completed');

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="voter-page">
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Elections</h1>
            <div className="page-subtitle">View active elections and cast your vote</div>
          </div>
        </div>

        {activeElections.length > 0 && (
          <>
            <h2 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Active Elections</h2>
            <div className="election-cards" style={{ marginBottom: 32 }}>
              {activeElections.map(el => (
                <div className="election-card" key={el.id} onClick={() => navigate(`/elections/${el.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="election-card-title">{el.title}</span>
                    <span className="badge badge-active">Active</span>
                  </div>
                  {el.description && <div className="election-card-desc">{el.description}</div>}
                  <div className="election-card-footer">
                    <span className="election-card-time">{formatDate(el.start_time)}</span>
                    <span className="election-card-time">{formatDate(el.end_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {completedElections.length > 0 && (
          <>
            <h2 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Completed Elections</h2>
            <div className="election-cards">
              {completedElections.map(el => (
                <div className="election-card" key={el.id} onClick={() => navigate(`/elections/${el.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="election-card-title">{el.title}</span>
                    <span className="badge badge-completed">Completed</span>
                  </div>
                  {el.description && <div className="election-card-desc">{el.description}</div>}
                  <div className="election-card-footer">
                    <span className="election-card-time">{formatDate(el.start_time)}</span>
                    <span className="election-card-time">{formatDate(el.end_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {elections.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>No elections available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
