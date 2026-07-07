// Cloudflare Pages Function — same-origin PASS-THROUGH proxy for The Odds API.
// Runs at  /api/odds
//
// Why this exists: the browser only ever talks to THIS app's own domain. The
// odds request is made server-side from here, so corporate/work networks that
// block betting domains (api.the-odds-api.com) still work — exactly how the old
// Streamlit server behaved. Your browser never contacts the blocked domain.
//
// This is a PASS-THROUGH: each user's own API key is sent from their browser and
// simply forwarded. There is NO shared key stored on the server, so every friend
// still uses their own key and quota, and you still host one site for everyone.
//
// Netlify/Vercel equivalents are a one-file port — ask if you move hosts.

export async function onRequest(context) {
  const { request } = context;
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const market = searchParams.get("market") || "h2h";
  const key = searchParams.get("key");

  if (!sport) return json({ error: "missing sport" }, 400);
  if (!key)   return json({ error: "missing key — paste your Odds API key in the app" }, 401);

  const api =
    `https://api.the-odds-api.com/v4/sports/${encodeURIComponent(sport)}/odds/` +
    `?apiKey=${encodeURIComponent(key)}` +
    `&regions=us,us2&markets=${encodeURIComponent(market)}&oddsFormat=american`;

  let res;
  try {
    res = await fetch(api);
  } catch (e) {
    return json({ error: "upstream fetch failed" }, 502);
  }

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": "application/json",
      // forward the quota header so the app can show "Requests left"
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
