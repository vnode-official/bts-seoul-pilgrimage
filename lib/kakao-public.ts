export function kakaoJsKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}
