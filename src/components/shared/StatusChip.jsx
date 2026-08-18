export function StatusChip({ tone, children }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}
