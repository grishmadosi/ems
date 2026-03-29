import React, { useState, useEffect } from "react";
import "../electionStatus.css";

const ElectionStatus = () => {
  const [electionId, setElectionId] = useState(null);
  const [status, setStatus] = useState("Upcoming");
  const [currentTime, setCurrentTime] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

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
          // E.g., No election found in DB
          setErrorMsg("SYSTEM ALERT // NO ELECTION RECORD DETECTED ON SERVER");
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

  const handleActivate = () => updateStatus("Active");
  const handleClose = () => updateStatus("Closed");

  // Bold text states to match the architectural banner sizes
  const getStatusText = () => {
    if (loading) return "INITIALIZING";
    switch(status) {
      case "Upcoming": return "AWAITING DEPLOYMENT";
      case "Active": return "SYSTEM LIVE";
      case "Closed": return "TERMINATED";
      default: return "";
    }
  };

  return (
    <div className="es-wrapper">
      <div className={`es-container status-${status}`}>
        
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
            padding: '1rem 2.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border-color)',
            animation: 'es-fade-in 0.3s forwards'
          }}>
            [!!] {errorMsg}
          </div>
        )}

        {/* Data readout grid with staggered reveals (animation-delay in CSS) */}
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

        {/* Controller Footer */}
        <div className="es-footer">
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

          {status === "Closed" && (
            <button className="es-btn es-btn-disabled" disabled>
              [ Protocol Archived ]
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ElectionStatus;