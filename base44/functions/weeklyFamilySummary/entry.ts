import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const families = await base44.asServiceRole.entities.Family.list();
    const visits = await base44.asServiceRole.entities.Visit.list();
    const users = await base44.asServiceRole.entities.User.list();

    // Filter visits from the past week (completed = date is in the past)
    const recentVisits = visits.filter(v => v.date >= weekAgoStr && v.date < todayStr);

    let emailsSent = 0;

    for (const family of families) {
      const familyUser = users.find(u => u.email === family.user_email);
      if (!familyUser?.email) continue;

      const familyVisits = recentVisits.filter(v => v.family_id === family.id);
      if (familyVisits.length === 0) continue;

      const visitItems = familyVisits
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(v => {
          const dateLabel = new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          });
          let item = `<li style="margin-bottom: 8px;">✅ ${v.volunteer_name} — ${dateLabel} · ${v.visit_type}`;
          if (v.note) item += `<br/><span style="font-size: 14px; color: #666; margin-left: 20px;">"${v.note}"</span>`;
          item += '</li>';
          return item;
        })
        .join('');

      const subject = `📋 Your circle this week`;
      const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
  <p style="font-size: 22px; margin-bottom: 24px;">📋</p>
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Your circle this week</p>
  <p style="margin-bottom: 16px;">Here's who showed up for you this week:</p>
  <ul style="padding-left: 20px; margin-bottom: 16px;">
    ${visitItems}
  </ul>
  <p style="margin-bottom: 32px;">Your circle is showing up for you. 💛</p>
  <p style="color: #888; font-size: 13px;">With care,<br/>The BOND team</p>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: familyUser.email,
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