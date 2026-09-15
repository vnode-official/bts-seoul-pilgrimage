export function publicOrigin(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) {
    return envUrl;
  }
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const host = forwardedHost ?? hostHeader ?? url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    url.protocol.replace(":", "") ??
    "http";
  const safeHost = host.replace(/^0\.0\.0\.0/, "127.0.0.1");
  return `${proto}://${safeHost}`;
}
