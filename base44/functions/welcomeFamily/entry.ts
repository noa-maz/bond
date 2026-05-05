import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    const family = data;
    if (!family?.user_email) {
      return Response.json({ skipped: true, reason: 'No email on family record' });
    }

    const subject = `💛 Your circle is on its way`;
    const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
  <p style="font-size: 22px; margin-bottom: 24px;">💛</p>
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Your circle is on its way</p>
  <p style="margin-bottom: 16px;">You don't have to do this alone.</p>
  <p style="margin-bottom: 16px;">Your profile is now visible to neighbors in your area. People who care about their community are already looking for families to support — families like yours.</p>
  <ul style="padding-left: 20px; margin-bottom: 16px;">
    <li style="margin-bottom: 8px;">👥 Neighbors in ${family.neighborhood} can see you're looking for support.</li>
    <li style="margin-bottom: 8px;">🔔 When someone asks to join your circle, we'll let you know right away.</li>
    <li style="margin-bottom: 8px;">✨ You're in control of who joins — only the people you welcome can show up.</li>
  </ul>
  <p style="margin-bottom: 32px;">Your circle is forming right now.</p>
  <p style="color: #888; font-size: 13px;">With care,<br/>The BOND team</p>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: family.user_email,
      subject,
      body,
      content_type: 'text/html',
    });

    return Response.json({ success: true, emailSentTo: family.user_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});