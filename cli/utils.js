const stripAnsi = (str) => str.replace(/\x1B\[\d+m/g, ""); // Removes ANSI color codes

const getAlignedTable = (rows) => {
  if (rows.length === 0) return "";

  // Extract headers dynamically
  const headers = rows.reduce((acc, row) => {
    for (const key in row) {
      if (!acc.includes(key)) acc.push(key);
    }
    return acc;
  }, []);

  // Convert headers to uppercase
  const upperHeaders = headers.map((header) => header.toUpperCase());

  // Calculate column widths (strip ANSI codes for correct length calculation)
  const colWidths = headers.map((header) =>
    Math.max(
      ...rows.map((row) =>
        row[header] ? stripAnsi(row[header].toString()).length : 0
      ),
      header.length
    )
  );

  // Format a row with proper padding
  const formatRow = (row) =>
    row
      .map((cell, i) => {
        if (cell === undefined) cell = "";
        if (cell === "") cell = "-";
        let cellStr = cell.toString();
        return cellStr.padEnd(
          colWidths[i] + (cellStr.length - stripAnsi(cellStr).length)
        ); // Adjust padding to account for ANSI codes
      })
      .join("  ");

  // Generate the table
  let result = formatRow(upperHeaders) + "\n";
  result += rows
    .map((row) => formatRow(headers.map((header) => row[header] || "-")))
    .join("\n");

  return result;
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export { capitalize, getAlignedTable };
