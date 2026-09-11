export function SensorReadout({ label, sublabel, color, value, unit, isElevated }) {
  const displayValue = value === null ? '—' : value.toFixed ? value.toFixed(1) : value;
  
  return (
    <div className="readout-block panel">
      <div className="readout-header">
        <span className="readout-label">{label}</span>
        <span className="readout-sublabel mono">{sublabel}</span>
      </div>
      <div className={`accent-bar ${color}`}></div>
      <div className="readout-value-row">
        <div>
          <span className="readout-value mono">{displayValue}</span>
          <span className="readout-unit mono">{unit}</span>
        </div>
        <div className={`status-chip ${isElevated ? 'elevated' : 'normal'} mono`}>
          {isElevated ? 'elevated' : 'normal'}
        </div>
      </div>
    </div>
  );
}
