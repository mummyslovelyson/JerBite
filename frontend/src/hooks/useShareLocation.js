import { useEffect, useRef, useState } from 'react';
import api from '../api/client';

// Sends the rider's GPS position to the server every ~15 s while `active` is true.
// Returns: idle | sharing | denied | unsupported | error
export default function useShareLocation(active) {
  const [state, setState] = useState('idle');
  const last = useRef(0);
  useEffect(() => {
    if (!active) { setState('idle'); return; }
    if (!navigator.geolocation) { setState('unsupported'); return; }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (Date.now() - last.current < 15000) return;
        last.current = Date.now();
        api.post('/rider/location', { lat: pos.coords.latitude, lng: pos.coords.longitude })
          .then(() => setState('sharing')).catch(() => setState('error'));
      },
      (err) => setState(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [active]);
  return state;
}
