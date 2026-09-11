import { useState, useEffect } from 'react';

export function Header({ status, gas }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setClock(d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let dotColor = 'olive';
  let dotText = 'link ok';

  if (status === 'error') {
    dotColor = 'red';
    dotText = 'no signal';
  } else if (gas > 600) {
    dotColor = 'amber';
    dotText = 'gas elevated';
  }

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-title">Rover-01</span>
        <span className="header-subtitle mono">telemetry / control</span>
      </div>
      <div className="header-right">
        <div className={`status-dot ${dotColor} ${status !== 'error' ? 'pulse' : ''}`}></div>
        <span className="mono">{dotText}</span>
        <span className="mono">|</span>
        <span className="mono">{clock}</span>
      </div>
    </header>
  );
}
