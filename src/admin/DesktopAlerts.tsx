import { useState } from 'react';
import { desktopAlertsSupported } from './useOrderAlerts';

/** Desktop notifications are allowed per browser, so each device opts in here. */
export const DesktopAlerts = () => {
  const [perm, setPerm] = useState(() => (desktopAlertsSupported() ? Notification.permission : 'denied'));
  if (!desktopAlertsSupported()) return null;
  if (perm === 'granted') return <span className="adm-small">Desktop alerts are on for this device.</span>;
  if (perm === 'denied') return <span className="adm-small">Desktop alerts are blocked in this browser. Allow notifications for this site in the browser settings to turn them on.</span>;
  return (
    <button type="button" className="adm-btn soft sm" style={{ alignSelf: 'flex-start' }} onClick={() => void Notification.requestPermission().then(setPerm)}>
      Allow desktop alerts on this device
    </button>
  );
};
