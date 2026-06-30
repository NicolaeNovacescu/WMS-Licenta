"use client";

import {
  downloadCsvFile,
  type CsvExportColumn,
  type CsvExportRow,
} from "@/lib/export/csv";

type ExportCsvButtonProps = {
  label: string;
  emptyLabel?: string;
  fileName: string;
  columns: readonly CsvExportColumn[];
  rows: readonly CsvExportRow[];
};

export function ExportCsvButton({
  label,
  emptyLabel = "No rows to export",
  fileName,
  columns,
  rows,
}: ExportCsvButtonProps) {
  const disabled = rows.length === 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => downloadCsvFile(fileName, columns, rows)}
      className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? emptyLabel : label}
    </button>
  );
}
