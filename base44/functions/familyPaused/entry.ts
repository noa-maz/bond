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
    const pauseReason = data.pause_reason;

    // Find all volunteers committed to this family
    const volunteers = await base44.asServiceRole.entities.Volunteer.list();
    const committed = volunteers.filter(
      v => v.committed_family_ids?.includes(familyId) && v.user_email
    );

    if (committed.length === 0) {
      return Response.json({ skipped: true, reason: 'No committed volunteers with email' });
    }

    let emailsSent = 0;

    for (const vol of committed) {
      const subject = `⏸️ ${familyName}'s circle is taking a short break`;
      const body = `Hi ${vol.name},

${familyName} needs a pause from their circle${pauseReason ? ` — "${pauseReason}"` : ''}. This doesn't mean anything has gone wrong.

🌿 Your commitment still means everything to them.

When they're ready to welcome support again, we'll let you know right away.

Thank you for being someone they can count on.

With care,
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