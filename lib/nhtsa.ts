export type Recall = {
  NHTSACampaignNumber: string;
  Component: string;
  Summary: string;
  ReportReceivedDate: string;
};

export type RecallLookupResult = {
  results: Recall[];
  source: "live" | "sample";
};

/* Curated samples shown only when the live API is unreachable. */
export const CURATED: Record<string, Recall[]> = {
  "2019|honda|accord": [
    {
      NHTSACampaignNumber: "20V314000",
      Component: "FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP",
      Summary:
        "The fuel pump impeller may deform and crack, potentially causing the low-pressure fuel pump to fail. An engine stall while driving increases the risk of a crash.",
      ReportReceivedDate: "05/28/2020",
    },
  ],
  "2015|ford|f-150": [
    {
      NHTSACampaignNumber: "22V056000",
      Component: "ELECTRICAL SYSTEM",
      Summary:
        "Underhood wiring may chafe, which can lead to a short circuit and increase the risk of a fire.",
      ReportReceivedDate: "02/02/2022",
    },
  ],
};

export function curatedKey(year: string, make: string, model: string): string {
  return `${year.trim()}|${make.toLowerCase().trim()}|${model.toLowerCase().trim()}`;
}

export class NhtsaUnreachableError extends Error {
  constructor() {
    super("NHTSA unreachable");
    this.name = "NhtsaUnreachableError";
  }
}

export async function lookupRecalls(
  year: string,
  make: string,
  model: string,
): Promise<RecallLookupResult> {
  const params = new URLSearchParams({ year, make, model });
  try {
    const res = await fetch(`/api/recalls?${params}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { results?: Recall[] };
    return { results: data.results ?? [], source: "live" };
  } catch {
    const fallback = CURATED[curatedKey(year, make, model)];
    if (fallback) return { results: fallback, source: "sample" };
    throw new NhtsaUnreachableError();
  }
}
