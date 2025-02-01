// math functions to handle amounts, dates, and more
// tldr i got tired of redeclaring these functions in every page

export function relativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(min / 60);
  const d = Math.floor(hrs / 24);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${d}d ago`;
}

export function date(date) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function fixMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
