import { classNames } from "../../utils/formatters";

const DataTable = ({
  columns,
  rows,
  rowKey = (row) => row.id,
  renderCell,
  emptyState,
  className = ""
}) => (
  <div className={classNames("overflow-x-auto rounded-[28px] border border-white/70 bg-white/85 shadow-card", className)}>
    <table className="min-w-full text-left">
      <thead className="bg-cloud/70">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={classNames(
                "px-5 py-4 text-xs font-bold uppercase tracking-[0.26em] text-slate/70",
                column.className
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-mist/60">
        {rows.length ? (
          rows.map((row) => (
            <tr key={rowKey(row)} className="transition hover:bg-cloud/60">
              {columns.map((column) => (
                <td key={column.key} className="px-5 py-4 align-top text-sm text-ink">
                  {renderCell ? renderCell(row, column.key) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="px-5 py-12">
              {emptyState}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;

