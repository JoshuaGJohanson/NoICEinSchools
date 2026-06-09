// POST { email } → generates a signed token and emails a one-click removal link.
// This removes the contact from the proposal supporters list only — not an email unsubscribe.
// Requires env vars: BREVO_API_KEY, GRANITE_PROPOSAL_LIST_ID, REMOVAL_SECRET, SITE_URL, SENDER_EMAIL

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Invalid request body.' }, 400);
  }

  const { email } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return json({ message: 'A valid email address is required.' }, 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const secret = env.REMOVAL_SECRET;
  if (!secret) {
    return json({ message: 'Service misconfiguration.' }, 500);
  }

  const token = await generateToken(normalizedEmail, secret);
  const baseUrl = (env.SITE_URL || 'https://noiceinschools.org').replace(/\/$/, '');
  const confirmUrl = `${baseUrl}/api/confirm-removal?token=${token}`;
  const senderEmail = env.SENDER_EMAIL || 'hello@noiceinschools.org';

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'No ICE in Schools', email: senderEmail },
        to: [{ email: normalizedEmail }],
        subject: 'Confirm removal from proposal supporter list — Granite School District',
        htmlContent: `<p>You requested to remove your name from the list of supporters for the <strong>Student Safety and Immigration Enforcement</strong> proposal submitted to Granite School District.</p>
<p>Click the button below to confirm. This removes your name from the proposal supporter list only — it does not affect any email subscriptions.</p>
<p><a href="${confirmUrl}" style="display:inline-block;padding:0.65rem 1.4rem;background:#071926;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Remove my name →</a></p>
<p style="font-size:0.88em;color:#555;">This link expires in 24 hours. If you did not request this, you can ignore this email — your name will remain on the list.</p>
<p>— No ICE in Schools</p>`,
      }),
    });
    if (!res.ok) throw new Error('mail failed');
  } catch {
    return json({ message: 'Could not send verification email. Please try again.' }, 502);
  }

  return json({ message: 'Check your email for a confirmation link.' }, 200);
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ message: 'Method not allowed.' }, 405);
}

async function generateToken(email, secret) {
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const data = email + '|' + expiry;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return btoa(data + '|' + sigHex).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' },
  });
}
