// Brevo list for Granite proposal supporters — set GRANITE_PROPOSAL_LIST_ID in env
// Brevo custom attributes DISTRICT_RELATIONSHIP and SCHOOL must be created in the Brevo dashboard
// Set SENDER_EMAIL env var to the verified sender address (default: hello@noiceinschools.org)

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid request body." }, 400);
  }

  const { firstName, lastName, email, affiliation, district, school, SUB_LOCAL } = body;

  if (!firstName || !firstName.trim()) {
    return json({ message: "First name is required." }, 400);
  }
  if (!lastName || !lastName.trim()) {
    return json({ message: "Last name is required." }, 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return json({ message: "A valid email address is required." }, 400);
  }

  const listId = env.GRANITE_PROPOSAL_LIST_ID
    ? parseInt(env.GRANITE_PROPOSAL_LIST_ID, 10)
    : null;

  const attributes = {
    FIRSTNAME: firstName.trim(),
    LASTNAME:  lastName.trim(),
  };
  if (affiliation) attributes.DISTRICT_RELATIONSHIP = affiliation.trim();
  if (district)    attributes.DISTRICT    = district.trim();
  if (school)      attributes.SCHOOL      = school.trim();
  if (SUB_LOCAL)   attributes.SUB_LOCAL   = true;

  const brevoPayload = {
    email:         email.trim().toLowerCase(),
    attributes,
    updateEnabled: true,
  };
  if (listId) brevoPayload.listIds = [listId];

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
    return json({ message: "Could not reach the signature service. Please try again." }, 502);
  }

  if (brevoRes.status !== 201 && brevoRes.status !== 204) {
    let brevoError = {};
    try { brevoError = await brevoRes.json(); } catch {}
    const message = brevoError.message || "Submission failed. Please try again.";
    return json({ message }, brevoRes.status === 400 ? 400 : 502);
  }

  // Send confirmation email — soft-fail so a mail error never blocks the signature record
  const senderEmail = env.SENDER_EMAIL || "hello@noiceinschools.org";
  const fullName    = `${firstName.trim()} ${lastName.trim()}`;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key":      env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "No ICE in Schools", email: senderEmail },
        to:     [{ email: email.trim().toLowerCase(), name: fullName }],
        subject: "Your signature has been recorded — Granite School District",
        htmlContent: `<p>Hi ${firstName.trim()},</p>
<p>Your name has been added to the list of supporters for the <strong>Student Safety and Immigration Enforcement</strong> proposal submitted to Granite School District.</p>
<p>We will present these signatures at the Granite School District Board of Education meeting on <strong>July 7, 2026 at 7:00 PM</strong>.</p>
<p>Help grow the list — share this page with anyone who cares about Granite students:<br>
<a href="https://noiceinschools.org/states/ut/granite/proposal/support-the-proposal/">noiceinschools.org/states/ut/granite/proposal/support-the-proposal/</a></p>
<p style="font-size:0.88em;color:#555;">Changed your mind? You can <a href="https://noiceinschools.org/states/ut/granite/proposal/remove-signature/">remove your name from the proposal supporter list</a> at any time. This is separate from email unsubscribe.</p>
<p>Thank you,<br>No ICE in Schools</p>`,
      }),
    });
  } catch {
    // Signature already recorded — email failure is non-fatal
  }

  return json({ message: "Thank you. Your name has been recorded." }, 200);
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
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
