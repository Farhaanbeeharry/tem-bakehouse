import { useEffect, useRef, useState } from 'react';
import type { Order } from '../lib/store';

export const NEW_ORDER_SETTING = 'New order request';

export type OrderAlert = { ref: string; name: string };

const chime = () => {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.45);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* audio unavailable or blocked until the page is clicked */
  }
};

export const desktopAlertsSupported = () => typeof Notification !== 'undefined';

/** Alerts the back office when an order request arrives while it is open (orders sync live from Supabase). */
export const useOrderAlerts = (orders: Order[], ready: boolean, enabled: boolean) => {
  const seen = useRef<Set<string> | null>(null);
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (!seen.current) {
      seen.current = new Set(orders.map((o) => o.ref));
      return;
    }
    const fresh = orders.filter((o) => !seen.current!.has(o.ref));
    fresh.forEach((o) => seen.current!.add(o.ref));
    const incoming = fresh.filter((o) => o.status === 'pending_review');
    if (!enabled || incoming.length === 0) return;

    const next = incoming.map((o) => ({ ref: o.ref, name: o.contactName || 'A customer' }));
    setAlerts((a) => [...next, ...a].slice(0, 5));
    chime();
    if (desktopAlertsSupported() && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      next.forEach((a) => new Notification('New order request', { body: `${a.ref} from ${a.name}`, tag: a.ref }));
    }
  }, [orders, ready, enabled]);

  return { alerts, dismiss: (ref: string) => setAlerts((a) => a.filter((x) => x.ref !== ref)) };
};
