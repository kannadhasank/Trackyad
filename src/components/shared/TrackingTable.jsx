export function TrackingTable({ columns, rows }) {
  return (
    <div className="tracking-table-wrap">
      <table className="tracking-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                // A column may supply render(row) for anything that is not
                // plain text — a button, a chip, a formatted value.
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty-state">No records match this search.</div>}
    </div>
  );
}
