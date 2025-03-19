// Convert numeric values
export function parseIniStringToNumber(obj) {
  for (const key in obj) {
      if (typeof obj[key] === "object") {
        parseIniStringToNumber(obj[key]); // Recursively process sections
      } else if (!isNaN(obj[key])) {
          obj[key] = Number(obj[key]);
      }
  }
  return obj;
}