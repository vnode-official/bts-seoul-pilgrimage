interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cached<T>(key: string, ttlMs: number, produce: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return Promise.resolve(hit.value as T);
  }
  return produce().then((value) => {
    store.set(key, { expiresAt: Date.now() + ttlMs, value });
    return value;
  });
}

export async function fetchText(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: string }> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: init?.headers,
  });
  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

export function xmlItems(xml: string, itemTag: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const blockRe = new RegExp(`<${itemTag}>([\\s\\S]*?)</${itemTag}>`, "g");
  let block = blockRe.exec(xml);
  while (block) {
    const inner = block[1];
    const fields: Record<string, string> = {};
    const fieldRe = /<([A-Za-z0-9_]+)>([^<]*)<\/\1>/g;
    let pair = fieldRe.exec(inner);
    while (pair) {
      fields[pair[1]] = pair[2];
      pair = fieldRe.exec(inner);
    }
    rows.push(fields);
    block = blockRe.exec(xml);
  }
  return rows;
}

export function xmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1] : null;
}
