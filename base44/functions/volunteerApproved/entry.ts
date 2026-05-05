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
      const body = `Hi ${data.name},

${familyName} has welcomed you into their circle. They've opened their door to you — and that takes trust.

📅 Head into the app and schedule your first visit.

💛 Choose a date and type of support, and let them know you're coming.

✨ Show up. That's all they need.

You don't need to have all the answers. You just need to be there.

With care,
The BOND team`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: data.user_email,
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