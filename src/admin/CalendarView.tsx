import { useState } from 'react';
import { useStore } from '../lib/store';
import { isoDay, niceDate, toIso } from '../lib/format';
import { customerOf, isLive, patchSettings } from './adminData';
import { DraftInput } from './DraftInput';
import { StatusBadge } from './StatusBadge';
import { useOrderDrawer } from './useOrderDrawer';

const WD_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WD_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const CalendarView = () => {
  const { orders, settings: st } = useStore();
  const { open } = useOrderDrawer();
  const [monthOffset, setMonthOffset] = useState(0);
  const [sel, setSel] = useState<string | null>(null);

  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const y = base.getFullYear();
  const m = base.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = isoDay(0);
  const live = orders.filter(isLive);

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(y, m, i + 1);
    const iso = toIso(date);
    const n = live.filter((o) => o.date === iso).length;
    const closed = st.closedWeekdays.includes(date.getDay());
    const blocked = st.holidays.includes(iso);
    return { iso, d: i + 1, n, closed, blocked };
  });

  const selOrders = sel ? live.filter((o) => o.date === sel).sort((a, b) => a.slot.localeCompare(b.slot)) : [];
  const selBlocked = !!sel && st.holidays.includes(sel);

  const toggleBlock = () => {
    if (!sel) return;
    patchSettings({ holidays: selBlocked ? st.holidays.filter((h) => h !== sel) : [...st.holidays, sel] });
  };

  const toggleWeekday = (wd: number) =>
    patchSettings({
      closedWeekdays: st.closedWeekdays.includes(wd) ? st.closedWeekdays.filter((x) => x !== wd) : [...st.closedWeekdays, wd],
    });

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))', gap: 14, alignItems: 'start' }}
    >
      <section className="adm-panel tight">
        <div className="adm-cal-head">
          <button type="button" className="adm-sq" aria-label="Previous month" onClick={() => setMonthOffset(monthOffset - 1)}>
            ←
          </button>
          <strong className="adm-cal-month">{base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
          <button type="button" className="adm-sq" aria-label="Next month" onClick={() => setMonthOffset(monthOffset + 1)}>
            →
          </button>
        </div>
        <div className="adm-cal-dow" aria-hidden="true">
          {WD_ORDER.map((i) => (
            <span key={i}>{WD_NAMES[i]}</span>
          ))}
        </div>
        <div className="adm-cal-grid">
          {Array.from({ length: lead }, (_, i) => (
            <span key={'pad' + i} />
          ))}
          {days.map((d) => {
            const off = d.closed || d.blocked;
            const note = d.blocked ? 'Blocked' : d.closed ? 'Closed' : d.n ? `${d.n} order${d.n > 1 ? 's' : ''}` : '';
            const cls = ['adm-cal-day', off && 'closed', d.iso === today && 'today', sel === d.iso && 'sel'].filter(Boolean).join(' ');
            return (
              <button
                key={d.iso}
                type="button"
                className={cls}
                aria-pressed={sel === d.iso}
                aria-label={`${niceDate(d.iso)}${note ? ', ' + note : ''}`}
                onClick={() => setSel(d.iso)}
              >
                <span className="adm-cal-num">{d.d}</span>
                <span className="adm-cal-note">{note}</span>
                <span className="adm-cal-load">
                  <span
                    style={{
                      width: `${Math.min(100, (d.n / st.dailyCapacity) * 100)}%`,
                      background: d.n >= st.dailyCapacity ? 'var(--a-danger)' : 'var(--a-burgundy)',
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }} className="adm-small">
          <span>Bar = orders vs daily capacity</span>
          <span>Hatched = closed / blocked</span>
        </div>
      </section>

      <section className="adm-panel tight" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="adm-h2">{sel ? niceDate(sel) : 'Select a day'}</h2>
        {sel && (
          <>
            <button type="button" className="adm-btn" style={{ minHeight: 42 }} onClick={toggleBlock}>
              {selBlocked ? 'Unblock this day' : 'Block this day (holiday / closure)'}
            </button>
            {selOrders.map((o) => (
              <button key={o.ref} type="button" className="adm-row" onClick={() => open(o.ref)}>
                <span>
                  <strong>{o.slot}</strong> · {o.ref} · {customerOf(o).name}{o.location ? ' · ' + o.location : ''}
                </span>
                <StatusBadge status={o.status} />
              </button>
            ))}
            {selOrders.length === 0 && <span className="adm-small">No orders on this day.</span>}
          </>
        )}
        <div style={{ borderTop: '1px solid var(--a-sand)', paddingTop: 12 }} className="adm-two">
          <label className="adm-label">
            Minimum notice (days)
            <DraftInput
              className="adm-input"
              type="number"
              min={0}
              value={String(st.leadDays)}
              onCommit={(v) => patchSettings({ leadDays: Math.max(0, Math.round(Number(v) || 0)) })}
            />
          </label>
          <label className="adm-label">
            Daily order capacity
            <DraftInput
              className="adm-input"
              type="number"
              min={1}
              value={String(st.dailyCapacity)}
              onCommit={(v) => patchSettings({ dailyCapacity: Math.max(1, Math.round(Number(v) || 1)) })}
            />
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Closed weekdays</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {WD_ORDER.map((i) => {
              const on = st.closedWeekdays.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  className={'adm-wd' + (on ? ' on' : '')}
                  aria-pressed={on}
                  onClick={() => toggleWeekday(i)}
                >
                  {WD_NAMES[i]}
                </button>
              );
            })}
          </div>
        </div>
        <p className="adm-small" style={{ margin: 0 }}>
          {st.delivery
            ? 'Delivery is on — delivery orders appear alongside collections.'
            : 'Delivery schedules appear here once delivery is enabled in Settings.'}
        </p>
      </section>
    </div>
  );
};
