// Cloudflare Pages Function — same-origin PASS-THROUGH proxy for SportsGameOdds.
// Runs at  /api/sgo
//
// Same purpose as /api/odds: the browser only talks to THIS app's domain, so
// corporate/work networks that block betting domains still work. This forwards
// each user's own SportsGameOdds key (pass-through — no shared key stored here).
//
// Used to pull Caesars moneylines, which The Odds API's free tier doesn't
// reliably return.

export async function onRequest(context) {
  const { request } = context;
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league");
  const key = searchParams.get("key");
  const oddID = searchParams.get("oddID") || "";
  const startsAfter = searchParams.get("startsAfter") || "";
  const startsBefore = searchParams.get("startsBefore") || "";

  if (!league) return json({ error: "missing league" }, 400);
  if (!key)    return json({ error: "missing key" }, 401);

  let api =
    `https://api.sportsgameodds.com/v2/events/` +
    `?leagueID=${encodeURIComponent(league)}` +
    `&apiKey=${encodeURIComponent(key)}` +
    `&oddsAvailable=true&type=match&bookmakerID=caesars&limit=100`;
  if (oddID)        api += `&oddID=${encodeURIComponent(oddID)}`;
  if (startsAfter)  api += `&startsAfter=${encodeURIComponent(startsAfter)}`;
  if (startsBefore) api += `&startsBefore=${encodeURIComponent(startsBefore)}`;

  let res;
  try {
    res = await fetch(api, { headers: { "X-Api-Key": key } });
  } catch (e) {
    return json({ error: "upstream fetch failed" }, 502);
  }

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
