import type { StatusId } from '../data/catalog';
import { statusDef, toneOf } from './adminData';

type Props = { status: StatusId; dot?: boolean };

export const StatusBadge = ({ status, dot = false }: Props) => {
  const t = toneOf(status);
  return (
    <span className="adm-badge" style={{ background: t.bg, color: t.fg }}>
      {dot && <span className="adm-badge-dot" style={{ background: t.dot }} />}
      {statusDef(status).label}
    </span>
  );
};
