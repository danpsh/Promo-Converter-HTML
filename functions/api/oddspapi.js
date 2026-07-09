// Cloudflare Pages Function — same-origin PASS-THROUGH proxy for OddsPapi.
// Runs at  /api/oddspapi
//
// Same purpose as /api/odds and /api/sgo: the browser only talks to THIS app's
// domain, so corporate/work networks that block betting domains still work.
// Forwards each user's own OddsPapi key (pass-through — no shared key stored).
//
// Used to pull Circa + Fanatics moneylines. Generic over OddsPapi's GET
// endpoints: pass ?ep=<endpoint>&key=<apiKey>&<other params>.

export async function onRequest(context) {
  const { request } = context;
  const { searchParams } = new URL(request.url);
  const ep = searchParams.get("ep");
  const key = searchParams.get("key");

  if (!ep)  return json({ error: "missing ep" }, 400);
  if (!key) return json({ error: "missing key" }, 401);

  const allowed = ["sports", "tournaments", "fixtures", "odds-by-tournaments", "odds", "bookmakers"];
  if (!allowed.includes(ep)) return json({ error: "endpoint not allowed" }, 400);

  const params = new URLSearchParams();
  for (const [k, v] of searchParams) {
    if (k === "ep" || k === "key") continue;
    params.set(k, v);
  }
  params.set("apiKey", key);

  const api = `https://api.oddspapi.io/v4/${ep}?${params.toString()}`;

  let res;
  try {
    res = await fetch(api, { headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Referer": "https://oddspapi.io/",
    } });
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
