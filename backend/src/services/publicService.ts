import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";
import * as contactsService from "./contactsService.js";
import * as integrations from "../integrations/index.js";

export async function getPublicContactForm(workspaceSlugOrId: string) {
  const r = await db.query(
    `SELECT cf.*, w.id as workspace_id, w.name as workspace_name
     FROM contact_forms cf
     JOIN workspaces w ON w.id = cf.workspace_id
     WHERE w.id::text = $1 OR w.name = $1
     LIMIT 1`,
    [workspaceSlugOrId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Form not found");
  const row = r.rows[0];
  return {
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    formName: row.name,
    fields: row.fields ?? [],
  };
}

export async function submitContactForm(
  workspaceId: string,
  data: { name?: string; email?: string; phone?: string; message?: string }
) {
  const workspace = await db.query(
    "SELECT id, status, email_connected, sms_connected FROM workspaces WHERE id = $1",
    [workspaceId]
  );
  if (workspace.rows.length === 0) throw new AppError(404, "Workspace not found");
  const contact = await contactsService.findOrCreateContact(workspaceId, {
    name: data.name,
    email: data.email,
    phone: data.phone,
  });
  const conversationId = await contactsService.getOrCreateConversation(workspaceId, contact.id);

  const msgId = uuidv4();
  await db.query(
    `INSERT INTO messages (id, workspace_id, conversation_id, direction, channel, body, is_automated)
     VALUES ($1, $2, $3, 'in', 'email', $4, false)`,
    [msgId, workspaceId, conversationId, data.message ?? ""]
  );
  await db.query(
    "UPDATE conversations SET updated_at = NOW() WHERE id = $1",
    [conversationId]
  );

  const cf = await db.query(
    "SELECT welcome_message_template FROM contact_forms WHERE workspace_id = $1",
    [workspaceId]
  );
  const welcomeTemplate = cf.rows[0]?.welcome_message_template ?? "Thanks for reaching out! We'll get back to you soon.";
  const welcomeBody = welcomeTemplate.replace(/\{name\}/g, data.name ?? "there");

  if (data.email && workspace.rows[0].email_connected) {
    await integrations.sendEmail(workspaceId, {
      to: data.email,
      subject: "We received your message",
      body: welcomeBody,
    });
  }
  if (data.phone && workspace.rows[0].sms_connected) {
    await integrations.sendSms(workspaceId, { to: data.phone, body: welcomeBody.slice(0, 160) });
  }

  return { success: true, contactId: contact.id };
}

export async function getPublicBookingPage(workspaceSlugOrId: string) {
  const r = await db.query(
    `SELECT id, name FROM workspaces WHERE id::text = $1 OR name = $1 LIMIT 1`,
    [workspaceSlugOrId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Workspace not found");
  const workspaceId = r.rows[0].id;
  const types = await db.query(
    "SELECT id, name, duration_minutes, location, is_online FROM booking_types WHERE workspace_id = $1 ORDER BY name",
    [workspaceId]
  );
  return {
    workspaceId,
    workspaceName: r.rows[0].name,
    bookingTypes: types.rows,
  };
}

export async function createBookingPublic(
  workspaceId: string,
  data: {
    booking_type_id: string;
    scheduled_at: string;
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
  }
) {
  const workspace = await db.query(
    "SELECT id, status FROM workspaces WHERE id = $1",
    [workspaceId]
  );
  if (workspace.rows.length === 0) throw new AppError(404, "Workspace not found");
  if (workspace.rows[0].status !== "active") throw new AppError(400, "Bookings are not open");

  const contact = await contactsService.findOrCreateContact(workspaceId, {
    name: data.name,
    email: data.email,
    phone: data.phone,
  });

  const bookingId = uuidv4();
  await db.query(
    `INSERT INTO bookings (id, workspace_id, contact_id, booking_type_id, scheduled_at, status, notes)
     VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)`,
    [bookingId, workspaceId, contact.id, data.booking_type_id, data.scheduled_at, data.notes ?? null]
  );

  const bt = await db.query(
    "SELECT name, duration_minutes FROM booking_types WHERE id = $1 AND workspace_id = $2",
    [data.booking_type_id, workspaceId]
  );
  if (bt.rows.length === 0) throw new AppError(400, "Invalid booking type");

  const confirmMessage = `Your booking for ${bt.rows[0].name} on ${new Date(data.scheduled_at).toLocaleString()} is confirmed.`;
  if (data.email) {
    await integrations.sendEmail(workspaceId, {
      to: data.email,
      subject: "Booking confirmed",
      body: confirmMessage,
    });
  }
  if (data.phone) {
    await integrations.sendSms(workspaceId, { to: data.phone, body: confirmMessage.slice(0, 160) });
  }

  const formTemplates = await db.query(
    `SELECT id FROM form_templates WHERE workspace_id = $1 AND (linked_booking_type_id = $2 OR linked_booking_type_id IS NULL)`,
    [workspaceId, data.booking_type_id]
  );
  const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  for (const ft of formTemplates.rows) {
    const subId = uuidv4();
    await db.query(
      `INSERT INTO form_submissions (id, workspace_id, booking_id, form_template_id, contact_id, status, due_at, sent_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())`,
      [subId, workspaceId, bookingId, ft.id, contact.id, dueAt]
    );
  }

  return { success: true, bookingId, contactId: contact.id };
}
