import { useState, useEffect, useRef } from 'react';

export function useSensorSocket(host) {
  const [data, setData] = useState({ temperature: null, humidity: null, gas: null, ts: null });
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('connecting'); // 'connecting', 'connected', 'polling', 'error'
  const [lastReceived, setLastReceived] = useState(0);

  const wsRef = useRef(null);
  const pollTimerRef = useRef(null);
  const connectTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const connectWs = () => {
      // Connect to port 81 based on our firmware implementation
      const wsUrl = host.includes(':') ? `ws://${host}/` : `ws://${host}:81/`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) {
          setStatus('connected');
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(event.data);
          handleNewData(parsed);
        } catch (e) {
          console.error("Invalid JSON from WS", e);
        }
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        if (!isMounted) return;
        wsRef.current = null;
        startPolling();
        connectTimeoutRef.current = setTimeout(connectWs, 5000);
      };
    };

    const handleNewData = (parsed) => {
      setLastReceived(Date.now());
      setData(parsed);
      setHistory(prev => {
        const newHist = [...prev, parsed];
        if (newHist.length > 60) newHist.shift();
        return newHist;
      });
    };

    const startPolling = () => {
      if (pollTimerRef.current) return;
      setStatus('polling');
      
      const poll = async () => {
        try {
          const res = await fetch(`http://${host}/sensors`);
          if (res.ok) {
            const parsed = await res.json();
            if (isMounted) handleNewData(parsed);
          }
        } catch (e) {
          // ignore
        }
      };
      
      pollTimerRef.current = setInterval(poll, 1500);
      poll(); // Immediate first poll
    };

    if (host) {
      connectWs();
    }

    return () => {
      isMounted = false;
      if (wsRef.current) wsRef.current.close();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    };
  }, [host]);

  const isStale = lastReceived === 0 ? true : (Date.now() - lastReceived > 5000);
  
  return { data, history, status: isStale ? 'error' : status, lastReceived };
}
