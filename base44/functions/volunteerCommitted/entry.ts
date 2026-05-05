import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, old_data } = await req.json();

    const newIds = data?.committed_family_ids || [];
    const oldIds = old_data?.committed_family_ids || [];

    // Find newly added family IDs
    const addedFamilyIds = newIds.filter(id => !oldIds.includes(id));

    if (addedFamilyIds.length === 0) {
      return Response.json({ skipped: true, reason: 'No new family commitments' });
    }

    const volunteerName = data.name || 'A neighbor';
    let emailsSent = 0;

    for (const familyId of addedFamilyIds) {
      const families = await base44.asServiceRole.entities.Family.filter({ id: familyId });
      const family = families[0];

      if (!family?.user_email) continue;

      const subject = `🤝 Someone wants to join your circle`;
      const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
  <p style="font-size: 22px; margin-bottom: 24px;">🤝</p>
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Someone wants to join your circle</p>
  <p style="margin-bottom: 16px;">${volunteerName} has asked to be part of your support circle.</p>
  <p style="margin-bottom: 16px;">They'd like to show up for you and your family. You're in charge of who's in your circle, so this is your call.</p>
  <ul style="padding-left: 20px; margin-bottom: 16px;">
    <li style="margin-bottom: 8px;">✅ Welcome them in and they can start scheduling visits.</li>
    <li style="margin-bottom: 8px;">❌ Let them know it's not the right fit right now.</li>
  </ul>
  <p style="margin-bottom: 32px;">Your circle, your choice.</p>
  <p style="color: #888; font-size: 13px;">With care,<br/>The BOND team</p>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: family.user_email,
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