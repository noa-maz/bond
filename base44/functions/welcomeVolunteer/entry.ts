import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    const volunteer = data;
    if (!volunteer?.user_email) {
      return Response.json({ skipped: true, reason: 'No email on volunteer record' });
    }

    const subject = `💛 Welcome to BOND`;
    const body = `<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2d2d2d; line-height: 1.7;">
  <p style="font-size: 22px; margin-bottom: 24px;">💛</p>
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Welcome to BOND, ${volunteer.name}</p>
  <p style="margin-bottom: 16px;">We're so glad you're here.</p>
  <p style="margin-bottom: 16px;">You've signed up to show up for a family in your neighborhood. That's not a small thing.</p>
  <ul style="padding-left: 20px; margin-bottom: 16px;">
    <li style="margin-bottom: 8px;">✨ A family in your area will see your profile and may invite you into their circle.</li>
    <li style="margin-bottom: 8px;">🏘️ Once they do, you'll be able to schedule visits and coordinate support directly.</li>
    <li style="margin-bottom: 8px;">📅 You can browse families and commit to supporting them at any time.</li>
  </ul>
  <p style="margin-bottom: 32px;">The families on BOND aren't looking for a hero. They're looking for a neighbor. And that's exactly what you are.</p>
  <p style="color: #888; font-size: 13px;">With care,<br/>The BOND team</p>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: volunteer.user_email,
      subject,
      body,
      content_type: 'text/html',
    });

    return Response.json({ success: true, emailSentTo: volunteer.user_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});