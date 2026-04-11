import React, { useState, useEffect, useCallback } from "react";
import "../electionStatus.css";

const ElectionStatus = () => {
  const [elections, setElections] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [positions, setPositions] = useState(['']);

  // Precise clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour12: false }) +
        '.' +
        now.getMilliseconds().toString().padStart(3, '0')
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 47);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss errors
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Fetch ALL elections from backend
  const fetchElections = useCallback(async () => {
    try {
      const res = await fetch("/api/elections");
      if (res.ok) {
        const data = await res.json();
        setElections(data);
      } else {
        setElections([]);
      }
    } catch (err) {
      setErrorMsg("NETWORK FAILURE // CANNOT CONNECT TO HOST");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  // Update status for a specific election
  const updateStatus = async (electionId, newStatus) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/elections/${electionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(`CONSTRAINT OVERRIDE FAILED // ${(data.message || 'UNKNOWN ERROR').toUpperCase()}`);
        return;
      }

      // Update local state
      setElections(prev =>
        prev.map(el =>
          (el.id || el._id) === electionId
            ? { ...el, status: data.election.status }
            : el
        )
      );
    } catch (err) {
      setErrorMsg("NETWORK FAILURE // CANNOT EXECUTE PROTOCOL");
    }
  };

  // Positions management
  const addPosition = () => setPositions(prev => [...prev, '']);
  const removePosition = (index) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };
  const updatePosition = (index, value) => {
    setPositions(prev => prev.map((p, i) => i === index ? value : p));
  };

  // Form submit -- host new election
  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Combine date + time into ISO strings
    const startISO = `${formData.startDate}T${formData.startTime}`;
    const endISO = `${formData.endDate}T${formData.endTime}`;

    // Filter out empty position strings
    const cleanPositions = positions.map(p => p.trim()).filter(Boolean);

    if (cleanPositions.length === 0) {
      setErrorMsg("VALIDATION FAILED // AT LEAST ONE POSITION REQUIRED");
      return;
    }

    try {
      const res = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          startTime: startISO,
          endTime: endISO,
          positions: cleanPositions
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(`CREATION FAILED // ${data.message ? data.message.toUpperCase() : 'UNKNOWN ERROR'}`);
        return;
      }

      // Add new election to list and close modal
      setElections(prev => [data, ...prev]);
      setShowModal(false);
      setFormData({ title: '', startDate: '', startTime: '', endDate: '', endTime: '' });
      setPositions(['']);
    } catch (err) {
      setErrorMsg("NETWORK FAILURE // CANNOT CREATE ELECTION");
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="es-wrapper">
      {/* Page Header */}
      <div className="es-top-header">
        <div className="es-top-header-left">
          <p>Module 04 // Governance</p>
          <h1>Election Protocol</h1>
        </div>
        <div className="es-top-header-right">
          <div className="es-time">{currentTime}</div>
          <button
            className="es-btn es-btn-host"
            onClick={() => setShowModal(true)}
          >
            [ Host New Election ]
          </button>
        </div>
      </div>

      {/* Election Cards Grid */}
      {loading ? (
        <div className="es-empty-state">
          <span>Synchronizing</span>
          Loading election protocols...
        </div>
      ) : elections.length === 0 ? (
        <div className="es-empty-state">
          <span>No Protocols Found</span>
          Deploy a new election to begin
        </div>
      ) : (
        <div className="es-grid">
          {elections.map((election) => {
            const id = election.id || election._id;
            const status = election.status || 'Upcoming';
            const elPositions = election.positions || [];

            return (
              <div className="es-card" key={id}>
                <div className={`es-card-status-bar bar-${status}`} />
                <div className="es-card-header">
                  <h3 className="es-card-title">{election.title}</h3>
                  <span className={`es-card-badge badge-${status}`}>
                    {status}
                  </span>
                </div>
                <div className="es-card-body">
                  <div className="es-card-meta">
                    <div className="es-card-meta-item">
                      <span className="es-card-meta-label">Activation</span>
                      <span className="es-card-meta-value">
                        {formatDate(election.startTime)} {formatTime(election.startTime)}
                      </span>
                    </div>
                    <div className="es-card-meta-item">
                      <span className="es-card-meta-label">Termination</span>
                      <span className="es-card-meta-value">
                        {formatDate(election.endTime)} {formatTime(election.endTime)}
                      </span>
                    </div>
                  </div>

                  {elPositions.length > 0 && (
                    <div className="es-card-positions">
                      <div className="es-card-positions-label">Positions</div>
                      <div className="es-card-positions-list">
                        {elPositions.map((pos, i) => (
                          <span className="es-position-pill" key={i}>{pos}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="es-card-footer">
                  {status === "Upcoming" && (
                    <button
                      className="es-btn es-btn-activate"
                      onClick={() => updateStatus(id, "Active")}
                    >
                      [ Activate ]
                    </button>
                  )}
                  {status === "Active" && (
                    <button
                      className="es-btn es-btn-close"
                      onClick={() => updateStatus(id, "Closed")}
                    >
                      [ Halt ]
                    </button>
                  )}
                  {status === "Closed" && (
                    <span className="es-card-badge badge-Closed" style={{ margin: 'auto 0' }}>
                      Terminated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Host New Election Modal */}
      {showModal && (
        <div className="es-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="es-modal" onClick={(e) => e.stopPropagation()}>
            <div className="es-modal-header">
              <p>New Protocol Deployment</p>
              <h2>Host Election</h2>
            </div>
            <form className="es-form" onSubmit={handleHostSubmit}>
              {/* Title */}
              <div className="es-form-group">
                <label className="es-label">Protocol Title</label>
                <input
                  className="es-input"
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., General Governance Election"
                />
              </div>

              {/* Start Date + Time */}
              <div className="es-form-group">
                <label className="es-label">Activation Date & Time</label>
                <div className="es-datetime-row">
                  <input
                    className="es-input"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  <input
                    className="es-input"
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* End Date + Time */}
              <div className="es-form-group">
                <label className="es-label">Termination Date & Time</label>
                <div className="es-datetime-row">
                  <input
                    className="es-input"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                  <input
                    className="es-input"
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Positions */}
              <div className="es-form-group">
                <label className="es-label">Positions</label>
                <div className="es-positions-list">
                  {positions.map((pos, index) => (
                    <div className="es-position-row" key={index}>
                      <input
                        className="es-input"
                        type="text"
                        value={pos}
                        onChange={e => updatePosition(index, e.target.value)}
                        placeholder={`Position ${index + 1}, e.g. President`}
                        required
                      />
                      {positions.length > 1 && (
                        <button
                          type="button"
                          className="es-position-remove-btn"
                          onClick={() => removePosition(index)}
                          title="Remove position"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="es-position-add-btn"
                  onClick={addPosition}
                >
                  + Add Position
                </button>
              </div>

              {/* Actions */}
              <div className="es-form-actions">
                <button type="button" className="es-btn" onClick={() => setShowModal(false)}>
                  [ Cancel ]
                </button>
                <button type="submit" className="es-btn es-btn-activate">
                  [ Deploy Protocol ]
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="es-error-banner">
          [!!] {errorMsg}
        </div>
      )}
    </div>
  );
};

export default ElectionStatus;