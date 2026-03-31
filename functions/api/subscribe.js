const PENDING_LIST_ID = 3; // update this to your Brevo list ID for pending confirmation

export async function onRequestPost(context) {
  const { request, env } = context;

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid request body." }, 400);
  }

  const { email, state, district, city, sub_national, sub_local, sub_urgent } = body;

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return json({ message: "A valid email address is required." }, 400);
  }

  if (!sub_national && !sub_local && !sub_urgent) {
    return json({ message: "At least one subscription preference must be selected." }, 400);
  }

  // Build Brevo contact payload
  const brevoPayload = {
    email: email.trim().toLowerCase(),
    attributes: {
      STATE:        state    || null,
      DISTRICT:     district || null,
      CITY:         city     || null,
      SUB_NATIONAL: !!sub_national,
      SUB_LOCAL:    !!sub_local,
      SUB_URGENT:   !!sub_urgent,
    },
    listIds: [PENDING_LIST_ID],
    updateEnabled: true,
  };

  // Send to Brevo
  let brevoRes;
  try {
    brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key":      env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify(brevoPayload),
    });
  } catch {
    return json({ message: "Could not reach the subscription service. Please try again." }, 502);
  }

  // Brevo returns 201 on create, 204 on update (updateEnabled)
  if (brevoRes.status === 201 || brevoRes.status === 204) {
    return json({ message: "Success. Check your email to confirm your subscription." }, 200);
  }

  // Surface Brevo error message if available
  let brevoError = {};
  try { brevoError = await brevoRes.json(); } catch {}

  const message = brevoError.message || "Subscription failed. Please try again.";
  return json({ message }, brevoRes.status === 400 ? 400 : 502);
}

// Reject non-POST methods
export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return json({ message: "Method not allowed." }, 405);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
