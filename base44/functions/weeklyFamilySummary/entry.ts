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

    // Filter visits from the past week (completed = date is in the past)
    const recentVisits = visits.filter(v => v.date >= weekAgoStr && v.date < todayStr);

    let emailsSent = 0;

    for (const family of families) {
      if (!family.user_email) continue;

      const familyVisits = recentVisits.filter(v => v.family_id === family.id);
      if (familyVisits.length === 0) continue;

      const visitLines = familyVisits
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(v => {
          const dateLabel = new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          });
          let line = `✅ ${v.volunteer_name} — ${dateLabel} · ${v.visit_type}`;
          if (v.note) line += `\n  "${v.note}"`;
          return line;
        })
        .join('\n\n');

      const subject = `📋 Your circle this week`;
      const body = `Hi ${family.name},

Here's who showed up for you this week:

${visitLines}

Your circle is showing up for you. 💛

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