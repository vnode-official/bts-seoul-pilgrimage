export function formatKrw(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKrwRange(low: number, high: number): string {
  return `${formatKrw(low)}–${formatKrw(high)}`;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function naverSearchUrl(query: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
}
