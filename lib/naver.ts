export const NAVER_SCRIPT_ID = "naver-maps-sdk";

export function naverClientId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  return id && id.trim().length > 0 ? id.trim() : undefined;
}

export function naverScriptSrc(clientId: string): string {
  const url = new URL("https://oapi.map.naver.com/openapi/v3/maps.js");
  url.searchParams.set("ncpClientId", clientId);
  url.searchParams.set("ncpKeyId", clientId);
  url.searchParams.set("submodules", "");
  return url.toString();
}

export function loadNaverMaps(clientId: string): Promise<typeof naver.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Naver Maps is client-only."));
  }
  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps);
  }
  const existing = document.getElementById(NAVER_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => {
        if (window.naver?.maps) resolve(window.naver.maps);
        else reject(new Error("Naver Maps loaded without maps namespace."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Naver Maps script failed.")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = NAVER_SCRIPT_ID;
    script.src = naverScriptSrc(clientId);
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else reject(new Error("Naver Maps loaded without maps namespace."));
    };
    script.onerror = () => reject(new Error("Naver Maps script failed to load."));
    document.head.appendChild(script);
  });
}

type MinimalChromeOptions = naver.maps.MapOptions & {
  disableDefaultUI?: boolean;
};

export const NAVER_MAP_OPTIONS: MinimalChromeOptions = {
  disableDefaultUI: true,
  logoControl: false,
  mapDataControl: false,
  scaleControl: false,
  zoomControl: false,
  mapTypeControl: false,
};
