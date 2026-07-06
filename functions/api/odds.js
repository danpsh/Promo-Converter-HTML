// Cloudflare Pages Function — server-side proxy for The Odds API.
// Runs at  /api/odds  and keeps your API key OUT of the browser.

export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const market = searchParams.get("market") || "h2h";

  if (!sport) {
    return json({ error: "missing sport" }, 400);
  }
  if (!env.ODDS_API_KEY) {
    return json({ error: "ODDS_API_KEY env var not set on the server" }, 401);
  }

  const api =
    `https://api.the-odds-api.com/v4/sports/${encodeURIComponent(sport)}/odds/` +
    `?apiKey=${env.ODDS_API_KEY}` +
    `&regions=us,us2&markets=${encodeURIComponent(market)}&oddsFormat=american`;

  const res = await fetch(api);
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": "application/json",
      "x-requests-remaining": res.headers.get("x-requests-remaining") || "0",
      "cache-control": "no-store",
    },
  });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
