const PENDING_LIST_ID = 3;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid request body." }, 400);
  }

  const { email, state, district, city, sub_national, sub_local, sub_urgent } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return json({ message: "A valid email address is required." }, 400);
  }

  if (!sub_national && !sub_local && !sub_urgent) {
    return json({ message: "At least one subscription preference must be selected." }, 400);
  }

  // PUT updates attributes directly — no list changes, no confirmation email
  let brevoRes;
  try {
    brevoRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email.trim().toLowerCase())}`,
      {
        method: "PUT",
        headers: {
          "api-key":      env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Accept":       "application/json",
        },
        body: JSON.stringify({
          attributes: {
            STATE:        state    || null,
            DISTRICT:     district || null,
            CITY:         city     || null,
            SUB_NATIONAL: !!sub_national,
            SUB_LOCAL:    !!sub_local,
            SUB_URGENT:   !!sub_urgent,
          },
        }),
      }
    );
  } catch {
    return json({ message: "Could not reach the subscription service. Please try again." }, 502);
  }

  // Brevo returns 204 on successful update
  if (brevoRes.status === 204) {
    return json({ message: "Your preferences have been updated." }, 200);
  }

  // 404 means the contact doesn't exist yet — treat as a new signup
  if (brevoRes.status === 404) {
    let signupRes;
    try {
      signupRes = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key":      env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Accept":       "application/json",
        },
        body: JSON.stringify({
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
        }),
      });
    } catch {
      return json({ message: "Could not reach the subscription service. Please try again." }, 502);
    }

    if (signupRes.status === 201 || signupRes.status === 204) {
      return json({ message: "Check your email to confirm your subscription.", new_signup: true }, 200);
    }

    let err = {};
    try { err = await signupRes.json(); } catch {}
    return json({ message: err.message || "Signup failed. Please try again." }, 502);
  }

  let brevoError = {};
  try { brevoError = await brevoRes.json(); } catch {}

  const message = brevoError.message || "Update failed. Please try again.";
  return json({ message }, brevoRes.status === 400 ? 400 : 502);
}

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
