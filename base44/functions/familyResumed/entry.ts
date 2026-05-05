import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    const familyId = data?.id;
    if (!familyId) {
      return Response.json({ skipped: true, reason: 'No family id' });
    }

    const familyName = data.name || 'A family';

    const volunteers = await base44.asServiceRole.entities.Volunteer.list();
    const committed = volunteers.filter(
      v => v.committed_family_ids?.includes(familyId) && v.user_email
    );

    if (committed.length === 0) {
      return Response.json({ skipped: true, reason: 'No committed volunteers with email' });
    }

    let emailsSent = 0;

    for (const vol of committed) {
      const subject = `Good news - they're back 💛`;
      const body = `Hi ${vol.name},

${familyName} is back and ready to reconnect.

They've resumed their circle, which means your support matters again — right now.

If you've been waiting for the right moment to show up, this is it. Head into the app and schedule your next visit whenever you're ready.

Thank you for staying committed even through the quiet stretches. That kind of loyalty doesn't go unnoticed.

With warmth,
The BOND team`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: vol.user_email,
        subject,
        body,
      });

      emailsSent++;
    }

    return Response.json({ success: true, emailsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});