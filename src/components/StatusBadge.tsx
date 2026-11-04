import { statuses, tones, type StatusId } from '../data/catalog';

export const badgeColors = (st: StatusId) => {
  const S = statuses[st] ?? { label: st, tone: 'neutral' as const };
  return { label: S.label, ...tones[S.tone] };
};

export const StatusBadge = ({ status, large = false }: { status: StatusId; large?: boolean }) => {
  const b = badgeColors(status);
  return (
    <span className="badge" style={{ background: b.bg, color: b.fg, ...(large ? { padding: '9px 14px', fontSize: 13 } : null) }}>
      <span className="dot" style={{ background: b.dot }} />
      {b.label}
    </span>
  );
};
