import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";
import * as integrations from "../integrations/index.js";

export async function listConversations(workspaceId: string, userId: string) {
  const r = await db.query(
    `SELECT cv.id, cv.contact_id, cv.status, cv.updated_at, cv.last_read_at,
       c.name as contact_name, c.email as contact_email, c.phone as contact_phone,
       (SELECT body FROM messages WHERE conversation_id = cv.id ORDER BY created_at DESC LIMIT 1) as last_message,
       (SELECT created_at FROM messages WHERE conversation_id = cv.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
       (SELECT direction FROM messages WHERE conversation_id = cv.id ORDER BY created_at DESC LIMIT 1) as last_message_direction
     FROM conversations cv
     JOIN contacts c ON c.id = cv.contact_id
     JOIN workspace_users wu ON wu.workspace_id = cv.workspace_id
     WHERE cv.workspace_id = $1 AND wu.id = $2
     ORDER BY cv.updated_at DESC`,
    [workspaceId, userId]
  );
  return r.rows.map((row: Record<string, unknown>) => {
    const lastAt = row.last_message_at ? new Date(row.last_message_at as string).getTime() : 0;
    const readAt = row.last_read_at ? new Date(row.last_read_at as string).getTime() : 0;
    const hasUnread = row.last_message_direction === "in" && (readAt === 0 || lastAt > readAt);
    return { ...row, has_unread: hasUnread };
  });
}

export async function getConversation(workspaceId: string, userId: string, conversationId: string) {
  const r = await db.query(
    `SELECT cv.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone
     FROM conversations cv
     JOIN contacts c ON c.id = cv.contact_id
     JOIN workspace_users wu ON wu.workspace_id = cv.workspace_id
     WHERE cv.workspace_id = $1 AND wu.id = $2 AND cv.id = $3`,
    [workspaceId, userId, conversationId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Conversation not found");
  return r.rows[0];
}

export async function markConversationRead(workspaceId: string, userId: string, conversationId: string) {
  await getConversation(workspaceId, userId, conversationId);
  await db.query(
    "UPDATE conversations SET last_read_at = NOW() WHERE id = $1 AND workspace_id = $2",
    [conversationId, workspaceId]
  );
}

export async function getMessages(workspaceId: string, userId: string, conversationId: string) {
  await getConversation(workspaceId, userId, conversationId);
  const r = await db.query(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId]
  );
  return r.rows;
}

export async function sendReply(
  workspaceId: string,
  userId: string,
  conversationId: string,
  data: { channel: "email" | "sms"; body: string; subject?: string }
) {
  const conv = await getConversation(workspaceId, userId, conversationId);
  const contactId = conv.contact_id;
  const toEmail = conv.contact_email;
  const toPhone = conv.contact_phone;
  if (data.channel === "email" && !toEmail) throw new AppError(400, "Contact has no email");
  if (data.channel === "sms" && !toPhone) throw new AppError(400, "Contact has no phone");

  const messageId = uuidv4();
  await db.query(
    `INSERT INTO messages (id, workspace_id, conversation_id, direction, channel, body, subject, is_automated)
     VALUES ($1, $2, $3, 'out', $4, $5, $6, false)`,
    [messageId, workspaceId, conversationId, data.channel, data.body, data.subject ?? null]
  );

  let result = { success: false };
  if (data.channel === "email") {
    result = await integrations.sendEmail(workspaceId, {
      to: toEmail,
      subject: data.subject ?? "Message",
      body: data.body,
    });
  } else {
    result = await integrations.sendSms(workspaceId, { to: toPhone, body: data.body });
  }

  if (result.success && result.externalId) {
    await db.query("UPDATE messages SET external_id = $1 WHERE id = $2", [result.externalId, messageId]);
  }
  await db.query(
    "UPDATE conversations SET updated_at = NOW(), automation_paused_until = NOW() + INTERVAL '24 hours' WHERE id = $1",
    [conversationId]
  );
  const msg = await db.query("SELECT * FROM messages WHERE id = $1", [messageId]);
  return msg.rows[0];
}
