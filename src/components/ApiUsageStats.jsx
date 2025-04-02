import React, { useState, useEffect } from 'react';
import simpleWeatherService from '../services/simpleWeatherService';
import './ApiUsageStats.css';

const ApiUsageStats = () => {
  const [apiStats, setApiStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch API stats initially and set up interval
  useEffect(() => {
    if (showStats) {
      updateStats();
      const interval = setInterval(updateStats, 5000); // Update every 5 seconds when visible
      return () => clearInterval(interval);
    }
  }, [showStats]);

  const updateStats = () => {
    const stats = simpleWeatherService.getApiRequestCount();
    setApiStats(stats);
    setLastUpdated(new Date());
  };

  const resetStats = () => {
    simpleWeatherService.resetApiRequestCount();
    updateStats();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);

    if (diffHrs > 0) {
      return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="api-stats-container">
      <button 
        className="api-stats-toggle" 
        onClick={() => setShowStats(!showStats)}
        title="Toggle API Usage Statistics"
      >
        {showStats ? 'Hide API Stats' : 'Show API Stats'}
      </button>

      {showStats && apiStats && (
        <div className="api-stats-panel">
          <div className="api-stats-header">
            <h3>API Usage Statistics</h3>
            <button className="api-stats-refresh" onClick={updateStats} title="Refresh Stats">
              ↻
            </button>
            <button className="api-stats-reset" onClick={resetStats} title="Reset Stats">
              Reset
            </button>
          </div>

          <div className="api-stats-content">
            <div className="api-stat-item">
              <div className="stat-label">Total Requests:</div>
              <div className="stat-value">{apiStats.total}</div>
            </div>
            <div className="api-stat-item">
              <div className="stat-label">Current Weather:</div>
              <div className="stat-value">{apiStats.current}</div>
            </div>
            <div className="api-stat-item">
              <div className="stat-label">Forecast:</div>
              <div className="stat-value">{apiStats.forecast}</div>
            </div>
            <div className="api-stat-item">
              <div className="stat-label">Historical:</div>
              <div className="stat-value">{apiStats.historical}</div>
            </div>
          </div>

          <div className="api-stats-footer">
            <div className="api-stats-timestamp">
              <div>Reset: {formatTimeSince(apiStats.lastReset)}</div>
              <div>Updated: {lastUpdated ? formatTimeSince(lastUpdated.toISOString()) : 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiUsageStats;
