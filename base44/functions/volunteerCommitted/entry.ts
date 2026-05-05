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
      const body = `Hi ${family.name},

${volunteerName} has asked to be part of your support circle. They'd like to show up for you and your family.

✅ Welcome them in and they can start scheduling visits.

❌ Let them know it's not the right fit right now.

Your circle, your choice.

With care,
The BOND team`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: family.user_email,
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