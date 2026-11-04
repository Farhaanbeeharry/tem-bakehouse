import type { CSSProperties } from 'react';

type Props = { style?: CSSProperties; className?: string; title?: string; fill?: string };

export const Logo = ({ style, className, title = 'TEM', fill = 'currentColor' }: Props) => (
  <svg viewBox="465 829 1119 392" fill={fill} role="img" aria-label={title} className={className} style={{ display: 'block', height: 'auto', ...style }}>
    <polygon points="465,829 794,829 794,909 675,909 675,1221 585,1221 585,909 465,909" />
    <polygon points="852,829 1122,829 1122,909 942,909 942,985 1097,985 1097,1058 942,1058 942,1141 1127,1141 1127,1221 852,1221" />
    <polygon points="1185,829 1283,829 1384,1031 1485,829 1584,829 1584,1221 1494,1221 1494,994 1412,1154 1356,1154 1276,994 1276,1221 1185,1221" />
  </svg>
);
