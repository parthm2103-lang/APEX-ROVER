import { Header } from './components/Header';
import { CameraFeed } from './components/CameraFeed';
import { SensorReadout } from './components/SensorReadout';
import { SensorHistoryGraph } from './components/SensorHistoryGraph';
import { useSensorSocket } from './hooks/useSensorSocket';

const ESP32_HOST = import.meta.env.VITE_ESP32_HOST || '192.168.4.1';

// Thresholds
const TEMP_THRESH = 30;
const HUM_THRESH = 75;
const GAS_THRESH = 600;

function App() {
  const { data, history, status, lastReceived } = useSensorSocket(ESP32_HOST);

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <Header status={status} gas={data.gas} />
      
      <div className="main-grid">
        <CameraFeed />
        
        <div className="readouts-column panel">
          <SensorReadout 
            label="Temperature"
            sublabel="dht11"
            color="amber"
            value={data.temperature}
            unit="°C"
            isElevated={data.temperature !== null && data.temperature > TEMP_THRESH}
          />
          <div className="divider"></div>
          <SensorReadout 
            label="Humidity"
            sublabel="dht11"
            color="blue"
            value={data.humidity}
            unit="%"
            isElevated={data.humidity !== null && data.humidity > HUM_THRESH}
          />
          <div className="divider"></div>
          <SensorReadout 
            label="Gas level"
            sublabel="mq-4"
            color="olive"
            value={data.gas}
            unit="ppm"
            isElevated={data.gas !== null && data.gas > GAS_THRESH}
          />
        </div>
      </div>

      <SensorHistoryGraph history={history} />

      <footer className="footer mono">
        <div>target: esp32 @ {ESP32_HOST}</div>
        <div>last update: {formatTime(lastReceived)}</div>
      </footer>
    </>
  );
}

export default App;
