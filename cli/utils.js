const getAlignedTable = (rows) => {
  if (rows.length === 0) return;
  const headers = rows.reduce((acc, row) => {
    for (const key in row) {
      if (!acc.includes(key)) {
        acc.push(key);
      }
    }
    return acc;
  }, []);
  const upperHeaders = headers.map((header) => header.toUpperCase());
  const colWidths = headers.map((header) =>
    Math.max(
      ...rows.map((row) => (row[header] ? row[header].toString().length : 0)),
      header.length
    )
  );

  const formatRow = (row) =>
    row
      .map((cell, i) => {
        if (cell === undefined) cell = "";
        if (cell === "") cell = "-";
        return cell.toString().padEnd(colWidths[i]);
      })
      .join("  ");

  // console.log(rows);
  let result = formatRow(upperHeaders) + "\n";
  result += rows
    .map((row) => formatRow(headers.map((header) => row[header])))
    .join("\n");
  return result;
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export { capitalize, getAlignedTable };
