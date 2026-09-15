import { fetchBusArrivals, fetchBusVehicles } from "@/lib/seoul-bus";
import { fetchSubwayArrivals, fetchSubwayVehicles } from "@/lib/seoul-subway";
import { kakaoRestKey } from "@/lib/keys";
import type { TransitSnapshot, TransitStation } from "@/types/transit";

export async function buildTransitSnapshot(
  station: TransitStation,
): Promise<TransitSnapshot> {
  const [subwayArr, busArr, subwayVeh] = await Promise.all([
    fetchSubwayArrivals(station),
    fetchBusArrivals(station),
    fetchSubwayVehicles(station),
  ]);
  const busVeh = await fetchBusVehicles(busArr.routeIds);
  const errors = [
    subwayArr.error,
    busArr.error,
    subwayVeh.error,
    busVeh.error,
  ].filter((error): error is NonNullable<typeof error> => Boolean(error));

  return {
    station,
    fetchedAt: new Date().toISOString(),
    arrivals: [...subwayArr.arrivals, ...busArr.arrivals],
    vehicles: [...subwayVeh.vehicles, ...busVeh.vehicles],
    errors,
    sources: [
      {
        feed: "subway",
        configured: !subwayArr.error || subwayArr.error.code !== "missing-key",
        label: "Seoul Metro Open API",
      },
      {
        feed: "bus",
        configured: !busArr.error || busArr.error.code !== "missing-key",
        label: "Seoul TOPIS bus (data.go.kr)",
      },
      {
        feed: "kakao",
        configured: Boolean(kakaoRestKey()),
        label: "Kakao Navi directions",
      },
    ],
  };
}
