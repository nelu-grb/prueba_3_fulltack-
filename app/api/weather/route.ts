import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.METEORED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta METEORED_API_KEY" }, { status: 500 });
  }

  const lat = -33.45;
  const lon = -70.66;
  const alt = 570;
  const tz = encodeURIComponent("America/Santiago");

  const base = `https://api.meteored.com/api/forecast/v1/daily/coords/${lat}/${lon}/${alt}/${tz}`;

  // Intento A: x-api-key
  const r1 = await fetch(base, {
    headers: {
      "x-api-key": apiKey,
      "accept": "application/json",
    },
  });

  if (r1.ok) {
    return NextResponse.json(await r1.json());
  }

  // Intento B: Authorization Bearer
  const r2 = await fetch(base, {
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "accept": "application/json",
    },
  });

  if (r2.ok) {
    return NextResponse.json(await r2.json());
  }

  // Intento C: api key por query param (nombres comunes)
  const r3 = await fetch(`${base}?apikey=${encodeURIComponent(apiKey)}`, {
    headers: { "accept": "application/json" },
  });

  const detail = await r3.text();
  return NextResponse.json(
    {
      error: "No autorizado por Meteored",
      tried: ["x-api-key header", "Authorization: Bearer", "?apikey=..."],
      status1: r1.status,
      status2: r2.status,
      status3: r3.status,
      detail,
    },
    { status: 502 }
  );
}
