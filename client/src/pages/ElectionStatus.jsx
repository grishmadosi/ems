import React, { useState, useEffect } from "react";
import "../electionStatus.css";

const ElectionStatus = () => {
  const [electionId, setElectionId] = useState(null);
  const [status, setStatus] = useState("Upcoming");
  const [currentTime, setCurrentTime] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New States for Hosting
  const [isHosting, setIsHosting] = useState(false);
  const [formData, setFormData] = useState({ title: '', startTime: '', endTime: '' });

  // Precise clock for the industrial tech aesthetic
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
    const interval = setInterval(updateTime, 47); // Updates rapidly off typical 60fps locking
    return () => clearInterval(interval);
  }, []);

  // Fetch initial election state from backend
  useEffect(() => {
    const fetchElection = async () => {
      try {
         // Because of proxy config in vite, /api gets forwarded to localhost:5000
        const res = await fetch("/api/elections");
        if (res.ok) {
          const data = await res.json();
          setElectionId(data.id || data._id);
          setStatus(data.status || 'Upcoming');
        } else {
          // No election found in DB
          setStatus("None");
        }
      } catch (err) {
        setErrorMsg("NETWORK FAILURE // CANNOT CONNECT TO HOST");
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, []);

  const updateStatus = async (newStatus) => {
    if (!electionId) {
      setErrorMsg("PROTOCOL ERROR // NO ACTIVE ELECTION ID BOUND");
      return;
    }
    
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/elections/${electionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Status failed due to time constraint or server error
        setErrorMsg(`CONSTRAINT OVERRIDE FAILED // ${data.message.toUpperCase()}`);
        return;
      }
      
      setStatus(data.election.status);
    } catch (err) {
       setErrorMsg("NETWORK FAILURE // CANNOT EXECUTE PROTOCOL");
    }
  };

  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(`CREATION FAILED // ${data.message ? data.message.toUpperCase() : 'UNKNOWN ERROR'}`);
        return;
      }
      setElectionId(data.id || data._id);
      setStatus(data.status);
      setIsHosting(false);
      setFormData({ title: '', startTime: '', endTime: '' });
    } catch(err) {
      setErrorMsg("NETWORK FAILURE // CANNOT CREATE ELECTION");
    }
  };

  const handleActivate = () => updateStatus("Active");
  const handleClose = () => updateStatus("Closed");

  // Bold text states to match the architectural banner sizes
  const getStatusText = () => {
    if (loading) return "INITIALIZING";
    if (isHosting) return "DEPLOYING NEW PROTOCOL";
    switch(status) {
      case "None": return "SYSTEM INACTIVE";
      case "Upcoming": return "AWAITING DEPLOYMENT";
      case "Active": return "SYSTEM LIVE";
      case "Closed": return "TERMINATED";
      default: return "UNKNOWN STATE";
    }
  };

  return (
    <div className="es-wrapper">
      <div className={`es-container status-${status === 'None' || isHosting ? 'Upcoming' : status}`}>
        
        {/* Header Region */}
        <div className="es-header">
          <div className="es-header-left">
            <p>Module 04 // Governance</p>
            <h1>Election Protocol</h1>
          </div>
          <div className="es-header-right">
            <div className="es-time">{currentTime}</div>
          </div>
        </div>

        {/* High Impact Banner (Stark contrasting colors based on state) */}
        <div className="es-status-banner">
          <div className="es-status-text">
            {getStatusText()}
          </div>
        </div>
        
        {/* Error/Constraint Message Banner */}
        {errorMsg && (
          <div style={{
            background: 'var(--accent-closed)',
            color: '#fff',
            padding: '1.25rem 3rem',
            fontFamily: "'Epilogue', sans-serif",
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '2px solid var(--border-color)',
            animation: 'deco-fade-in 0.4s forwards'
          }}>
            [!!] {errorMsg}
          </div>
        )}

        {/* Form rendering when hosting */}
        {isHosting && (
          <form className="es-form" onSubmit={handleHostSubmit}>
            <div className="es-form-group">
              <label className="es-label">Protocol Title</label>
              <input 
                className="es-input" 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required 
                placeholder="e.g., General Governance Election"
              />
            </div>
            <div className="es-form-group">
              <label className="es-label">Activation Timestamp</label>
              <input 
                className="es-input" 
                type="datetime-local" 
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                required 
              />
            </div>
            <div className="es-form-group">
              <label className="es-label">Termination Timestamp</label>
              <input 
                className="es-input" 
                type="datetime-local" 
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                required 
              />
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className="es-btn es-btn-activate">
                [ Deploy Protocol ]
              </button>
              <button type="button" className="es-btn" onClick={() => setIsHosting(false)}>
                [ Cancel ]
              </button>
            </div>
          </form>
        )}

        {/* Data readout grid with staggered reveals (animation-delay in CSS) */}
        {!isHosting && (
        <div className="es-data-grid">
          <div className="es-data-cell">
            <div className="es-data-label">Protocol State</div>
            <div className="es-data-value">{loading ? "SYNCING..." : status.toUpperCase()}</div>
          </div>
          <div className="es-data-cell">
            <div className="es-data-label">Consensus Protocol</div>
            <div className="es-data-value">BFT // SHA-256</div>
          </div>
          <div className="es-data-cell">
            <div className="es-data-label">Network Sync</div>
            <div className="es-data-value" style={{ color: status === 'Active' ? 'var(--accent-active)' : 'inherit' }}>
              {loading ? "---" : (status === "Active" ? "14.2ms" : "OFFLINE")}
            </div>
          </div>
        </div>
        )}

        {/* Controller Footer */}
        {!isHosting && (
        <div className="es-footer">
          {(status === "None" || status === "Closed") && (
             <button 
                className={`es-btn es-btn-activate ${loading ? 'es-btn-disabled' : ''}`} 
                disabled={loading} 
                onClick={() => setIsHosting(true)}
             >
              [ Host New Election ]
            </button>
          )}

          {status === "Upcoming" && (
             <button 
                className={`es-btn es-btn-activate ${loading ? 'es-btn-disabled' : ''}`} 
                disabled={loading} 
                onClick={handleActivate}
             >
              [ Initialize Election ]
            </button>
          )}

          {status === "Active" && (
            <button className="es-btn es-btn-close" onClick={handleClose}>
              [ Halt Operations ]
            </button>
          )}
        </div>
        )}

      </div>
    </div>
  );
};

export default ElectionStatus;