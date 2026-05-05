import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, old_data } = await req.json();

    const newIds = data?.approved_family_ids || [];
    const oldIds = old_data?.approved_family_ids || [];

    const addedFamilyIds = newIds.filter(id => !oldIds.includes(id));

    if (addedFamilyIds.length === 0) {
      return Response.json({ skipped: true, reason: 'No new approvals' });
    }

    if (!data?.user_email) {
      return Response.json({ skipped: true, reason: 'No email on volunteer record' });
    }

    let emailsSent = 0;

    for (const familyId of addedFamilyIds) {
      const families = await base44.asServiceRole.entities.Family.filter({ id: familyId });
      const family = families[0];
      const familyName = family?.name || 'A family';

      const subject = `❤️ You've been welcomed in`;
      const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
  <p style="font-size: 22px; margin-bottom: 24px;">❤️</p>
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">You've been welcomed in</p>
  <p style="margin-bottom: 16px;">${familyName} has opened their door to you.</p>
  <p style="margin-bottom: 16px;">This is the beginning of something real. They've trusted you with their family — that takes courage.</p>
  <ul style="padding-left: 20px; margin-bottom: 16px;">
    <li style="margin-bottom: 8px;">📅 Head into the app and schedule your first visit.</li>
    <li style="margin-bottom: 8px;">💛 Choose a date and type of support, and let them know you're coming.</li>
    <li style="margin-bottom: 8px;">✨ Show up. That's all they need.</li>
  </ul>
  <p style="margin-bottom: 32px;">You don't need to have all the answers. You just need to be there.</p>
  <p style="color: #888; font-size: 13px;">With care,<br/>The BOND team</p>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: data.user_email,
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