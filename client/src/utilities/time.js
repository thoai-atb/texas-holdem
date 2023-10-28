export function timeAgo(timestamp1, timestamp2) {
  const timeDiff = Math.abs(timestamp1 - timestamp2); // Calculate the time difference in milliseconds
  const hours = Math.floor(timeDiff / (1000 * 60 * 60)); // Calculate the number of hours
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)); // Calculate the number of minutes
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000); // Calculate the number of seconds

  let result = "";

  if (hours > 0) {
    result += `${hours}h`;
  }

  if (minutes > 0) {
    result += ` ${minutes}m`;
  }

  if (hours === 0 || minutes === 0) {
    result += ` ${seconds}s`;
  }

  return result.trim(); // Trim any leading or trailing whitespace
}
