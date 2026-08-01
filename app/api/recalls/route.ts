const NHTSA_BASE = "https://api.nhtsa.gov/recalls/recallsByVehicle";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year")?.trim();
  const make = searchParams.get("make")?.trim();
  const model = searchParams.get("model")?.trim();

  if (!year || !make || !model) {
    return Response.json(
      { error: "year, make and model are required" },
      { status: 400 },
    );
  }

  const url = `${NHTSA_BASE}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      return Response.json({ error: `NHTSA status ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return Response.json({ results: data?.results ?? [] });
  } catch {
    return Response.json({ error: "NHTSA unreachable" }, { status: 502 });
  }
}
