type Chip = { id: string; label: string; n: number };

type Props = { chips: Chip[]; value: string; onChange: (id: string) => void; label: string };

export const FilterChips = ({ chips, value, onChange, label }: Props) => (
  <div className="adm-chips" role="group" aria-label={label}>
    {chips.map((c) => (
      <button
        key={c.id}
        type="button"
        className={'adm-chip' + (c.id === value ? ' on' : '')}
        aria-pressed={c.id === value}
        onClick={() => onChange(c.id)}
      >
        {c.label} <span className="adm-chip-n">{c.n}</span>
      </button>
    ))}
  </div>
);
