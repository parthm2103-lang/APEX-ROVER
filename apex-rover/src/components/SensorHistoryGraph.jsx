import { useRef, useEffect, useState } from 'react';

export function SensorHistoryGraph({ history }) {
  const canvasRef = useRef(null);
  const [showTemp, setShowTemp] = useState(true);
  const [showHum, setShowHum] = useState(true);
  const [showGas, setShowGas] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Setup for responsive rendering
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const w = canvas.width;
    const h = canvas.height;

    // Clear and draw grid
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#2c2a26';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i <= 3; i++) {
      const y = (h / 4) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    if (history.length < 2) return;

    // Calculate ranges
    const maxTemp = 50; // max expected temp
    const maxHum = 100;
    const maxGas = 2000;

    const drawLine = (dataFn, maxVal, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < history.length; i++) {
        const val = dataFn(history[i]);
        if (val === null) continue;
        
        const x = (i / 59) * w;
        // Map val to height, inverted since y=0 is top
        const y = h - ((val / maxVal) * h);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    if (showTemp) drawLine(d => d.temperature, maxTemp, '#c17a3d');
    if (showHum) drawLine(d => d.humidity, maxHum, '#5f7e8c');
    if (showGas) drawLine(d => d.gas, maxGas, '#7c8752');

  }, [history, showTemp, showHum, showGas]);

  return (
    <div className="graph-panel panel">
      <div className="graph-header">
        <span className="graph-title">sensor history — last 60s</span>
        <div className="graph-toggles">
          <button 
            className={`graph-toggle ${!showTemp ? 'inactive' : ''}`}
            onClick={() => setShowTemp(!showTemp)}
          >
            <div className="toggle-swatch" style={{ backgroundColor: 'var(--amber)' }}></div>
            temp
          </button>
          <button 
            className={`graph-toggle ${!showHum ? 'inactive' : ''}`}
            onClick={() => setShowHum(!showHum)}
          >
            <div className="toggle-swatch" style={{ backgroundColor: 'var(--blue)' }}></div>
            humidity
          </button>
          <button 
            className={`graph-toggle ${!showGas ? 'inactive' : ''}`}
            onClick={() => setShowGas(!showGas)}
          >
            <div className="toggle-swatch" style={{ backgroundColor: 'var(--olive)' }}></div>
            gas
          </button>
        </div>
      </div>
      <div className="graph-body">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
