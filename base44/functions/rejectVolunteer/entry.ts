import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { volunteer_id, family_id } = await req.json();

    if (!volunteer_id || !family_id) {
      return Response.json({ error: 'Missing volunteer_id or family_id' }, { status: 400 });
    }

    const volunteer = await base44.asServiceRole.entities.Volunteer.get(volunteer_id);
    if (!volunteer) {
      return Response.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    const updated = (volunteer.committed_family_ids || []).filter(id => id !== family_id);
    await base44.asServiceRole.entities.Volunteer.update(volunteer_id, { committed_family_ids: updated });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});