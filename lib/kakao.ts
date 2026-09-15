export const KAKAO_T_SCHEME = "kakaot://launch";
export const KAKAO_T_WEB = "https://taxi.kakao.com";
export const KAKAO_T_IOS =
  "https://apps.apple.com/app/kakaot-taxi/id981110422";
export const KAKAO_T_ANDROID =
  "https://play.google.com/store/apps/details?id=com.kakao.taxi";

export function kakaoTDeepLink(origin: string, destination: string): string {
  const params = new URLSearchParams({
    origin,
    destination,
  });
  return `${KAKAO_T_WEB}?${params.toString()}`;
}

export function openKakaoT(origin: string, destination: string): void {
  const web = kakaoTDeepLink(origin, destination);
  const probe = window.open(KAKAO_T_SCHEME, "_blank", "noopener,noreferrer");
  window.setTimeout(() => {
    if (probe) {
      probe.location.href = web;
    } else {
      window.open(web, "_blank", "noopener,noreferrer");
    }
  }, 400);
}
