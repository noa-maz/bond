import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    const volunteer = data;
    if (!volunteer?.user_email) {
      return Response.json({ skipped: true, reason: 'No email on volunteer record' });
    }

    const subject = `💛 Welcome to BOND, ${volunteer.name}`;
    const body = `Hi ${volunteer.name},

We're so glad you're here.

✨ A family in your area will see your profile and may invite you into their circle.

🏘️ Once they do, you'll be able to schedule visits and coordinate support directly.

📅 You can browse families and commit to supporting them at any time.

The families on BOND aren't looking for a hero. They're looking for a neighbor. And that's exactly what you are.

With care,
The BOND team`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: volunteer.user_email,
      subject,
      body,
    });

    return Response.json({ success: true, emailSentTo: volunteer.user_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});