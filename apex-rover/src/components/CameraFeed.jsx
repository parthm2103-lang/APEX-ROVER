import { useRef, useState, useEffect } from 'react';

export function CameraFeed() {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [resolution, setResolution] = useState('');
  const [clock, setClock] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setClock(d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();
            setResolution(`${settings.width}x${settings.height} @ ${settings.frameRate || 30}fps`);
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError(true);
      }
    }
    startCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="camera-panel panel">
      <div className="camera-header">
        <span>camera / laptop webcam</span>
        {!error && (
          <div className="live-tag">
            <div className="live-dot"></div>
            <span>live</span>
          </div>
        )}
      </div>
      
      {error ? (
        <div className="camera-placeholder">
          camera feed unavailable
        </div>
      ) : (
        <>
          <video 
            ref={videoRef}
            className="camera-feed"
            autoPlay 
            playsInline 
            muted 
          />
          <div className="viewfinder-bracket bracket-tl"></div>
          <div className="viewfinder-bracket bracket-tr"></div>
          <div className="viewfinder-bracket bracket-bl"></div>
          <div className="viewfinder-bracket bracket-br"></div>
          
          <div className="camera-footer">
            <span className="mono">{resolution || 'loading...'}</span>
            <span className="mono">{clock}</span>
          </div>
        </>
      )}
    </div>
  );
}
