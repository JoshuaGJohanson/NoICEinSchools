export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Invalid request body.' }, 400);
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: 'A valid email address is required.' }, 400);
  }

  // Look up the contact by email, then remove all list memberships
  const headers = {
    'api-key': env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  };

  try {
    // Brevo: mark contact as unsubscribed from all email
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ emailBlacklisted: true }),
    });

    if (res.status === 404) {
      // Email not found — treat as success so we don't leak whether an address is subscribed
      return json({ message: 'Unsubscribed.' }, 200);
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return json({ message: `Brevo ${res.status}: ${data.message || data.code || JSON.stringify(data)}` }, 502);
    }

    return json({ message: 'Unsubscribed.' }, 200);
  } catch (err) {
    return json({ message: 'Server error. Please try again.' }, 502);
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
