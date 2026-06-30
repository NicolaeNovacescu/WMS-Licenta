export type CsvExportValue = string | number | boolean | null | undefined;

export type CsvExportRow = Record<string, CsvExportValue>;

export type CsvExportColumn = {
  key: string;
  header: string;
};

export function downloadCsvFile(
  fileName: string,
  columns: readonly CsvExportColumn[],
  rows: readonly CsvExportRow[],
) {
  const csvContent = buildCsvContent(columns, rows);
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

function buildCsvContent(
  columns: readonly CsvExportColumn[],
  rows: readonly CsvExportRow[],
) {
  const headerRow = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const valueRows = rows.map((row) =>
    columns.map((column) => escapeCsvCell(row[column.key])).join(","),
  );

  return [headerRow, ...valueRows].join("\r\n");
}

function escapeCsvCell(value: CsvExportValue) {
  const normalized = value == null ? "" : String(value);

  if (!/[",\r\n]/.test(normalized)) {
    return normalized;
  }

  return `"${normalized.replaceAll('"', '""')}"`;
}
