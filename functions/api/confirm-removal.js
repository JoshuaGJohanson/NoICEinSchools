// GET ?token=... → verifies HMAC token, removes contact from the proposal supporters list,
// then redirects to the removal page with ?confirmed=1.
// Requires env vars: BREVO_API_KEY, GRANITE_PROPOSAL_LIST_ID, REMOVAL_SECRET, SITE_URL

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  const baseUrl = (env.SITE_URL || 'https://noiceinschools.org').replace(/\/$/, '');
  const removalPage = `${baseUrl}/states/ut/granite/proposal/remove-signature/`;

  if (!token) {
    return Response.redirect(`${removalPage}?error=invalid`, 302);
  }

  const secret = env.REMOVAL_SECRET;
  if (!secret) {
    return Response.redirect(`${removalPage}?error=invalid`, 302);
  }

  const email = await verifyToken(token, secret);
  if (!email) {
    return Response.redirect(`${removalPage}?error=expired`, 302);
  }

  const listId = env.GRANITE_PROPOSAL_LIST_ID
    ? parseInt(env.GRANITE_PROPOSAL_LIST_ID, 10)
    : null;

  if (listId) {
    try {
      await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}/contacts/delete`, {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: [email] }),
      });
    } catch {
      // Non-fatal — contact may not have been in this list
    }
  }

  return Response.redirect(`${removalPage}?confirmed=1`, 302);
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return new Response(JSON.stringify({ message: 'Method not allowed.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyToken(token, secret) {
  try {
    const raw = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const lastPipe = raw.lastIndexOf('|');
    const secondLastPipe = raw.lastIndexOf('|', lastPipe - 1);
    if (lastPipe === -1 || secondLastPipe === -1) return null;
    const sigHex = raw.slice(lastPipe + 1);
    const data = raw.slice(0, lastPipe);
    const expiry = parseInt(raw.slice(secondLastPipe + 1, lastPipe), 10);
    if (isNaN(expiry) || Date.now() > expiry) return null;
    const email = raw.slice(0, secondLastPipe);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    return valid ? email : null;
  } catch {
    return null;
  }
}
