import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    const volunteer = data;
    if (!volunteer?.user_email) {
      return Response.json({ skipped: true, reason: 'No email on volunteer record' });
    }

    const offerList = volunteer.offer_types?.join(', ') || 'your time and presence';

    const subject = `Welcome to BOND, ${volunteer.name} 💛`;
    const body = `Hi ${volunteer.name},

We're so glad you're here.

You've signed up to show up for a family in your neighborhood — offering ${offerList}, ${volunteer.frequency?.toLowerCase() || 'as you can'}. That's not a small thing.

Here's what happens next:
• A family in your area will see your profile and may invite you into their circle.
• Once they do, you'll be able to schedule visits and coordinate support directly.
• You can browse families and commit to supporting them at any time.

The families on BOND aren't looking for a hero. They're looking for a neighbor. And that's exactly what you are.

Thank you for showing up.

With gratitude,
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