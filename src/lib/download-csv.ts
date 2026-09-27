/** Browser CSV download helper for dashboard tables. */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const flatten = (value: string | number | null | undefined) =>
    String(value ?? "")
      .replace(/\r\n|\r|\n/g, " ")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const escape = (value: string | number | null | undefined) => {
    const text = flatten(value);
    if (/[",]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };

  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
