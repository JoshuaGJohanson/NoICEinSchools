// Temporary debug endpoint — DELETE after confirming Brevo connection works
// Visit /api/test-brevo in your browser to check

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.BREVO_API_KEY) {
    return json({ ok: false, error: "BREVO_API_KEY is not set in environment" });
  }

  // Call Brevo account endpoint — lightweight, just verifies the key
  let res;
  try {
    res = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": env.BREVO_API_KEY,
        "Accept":  "application/json",
      },
    });
  } catch (e) {
    return json({ ok: false, error: "Network error reaching Brevo", detail: e.message });
  }

  const body = await res.json().catch(() => ({}));

  return json({
    ok:     res.status === 200,
    status: res.status,
    body,
    keyPrefix: env.BREVO_API_KEY.slice(0, 6) + "…", // shows first 6 chars to confirm correct key
  });
}

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
