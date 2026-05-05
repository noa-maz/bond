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
      const subject = `🌟 Good news — they're back`;
      const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
      <p style="font-size: 22px; margin-bottom: 24px;">🌟</p>
      <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Good news — they're back</p>
      <p style="margin-bottom: 16px;">${familyName} is back and ready to reconnect.</p>
      <p style="margin-bottom: 16px;">They've resumed their circle, which means your support matters again — right now.</p>
      <ul style="padding-left: 20px; margin-bottom: 16px;">
      <li style="margin-bottom: 8px;">📅 Head into the app and schedule your next visit whenever you're ready.</li>
      </ul>
      <p style="margin-bottom: 32px;">Thank you for staying committed even through the pauses.</p>
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

    return Response.json({ success: true, emailsSent, sentTo: committed.map(v => v.user_email) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});