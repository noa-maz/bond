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
      const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
  <p style="font-size: 22px; margin-bottom: 24px;">⏸️</p>
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${familyName}'s circle is taking a short break</p>
  <p style="margin-bottom: 16px;">They need a pause from their circle${pauseReason ? ` — "${pauseReason}"` : ''}.</p>
  <p style="margin-bottom: 16px;">This doesn't mean anything has gone wrong. Life has rhythms, and sometimes families need a quiet moment to breathe.</p>
  <ul style="padding-left: 20px; margin-bottom: 16px;">
    <li style="margin-bottom: 8px;">🌿 Your commitment still means everything to them.</li>
  </ul>
  <p style="margin-bottom: 32px;">When they're ready to welcome support again, we'll let you know right away.</p>
  <p style="color: #888; font-size: 13px;">With care,<br/>The BOND team</p>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: vol.user_email,
        subject,
        body,
        content_type: 'text/html',
      });

      emailsSent++;
    }

    return Response.json({ success: true, emailsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});