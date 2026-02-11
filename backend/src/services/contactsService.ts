import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listContacts(workspaceId: string, userId: string) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const r = await db.query(
    `SELECT c.*, 
       (SELECT COUNT(*) FROM messages m JOIN conversations cv ON cv.id = m.conversation_id WHERE cv.contact_id = c.id AND m.direction = 'in') as unread_count
     FROM contacts c
     WHERE c.workspace_id = $1
     ORDER BY c.updated_at DESC`,
    [workspaceId]
  );
  return r.rows;
}

export async function getContact(workspaceId: string, userId: string, contactId: string) {
  const r = await db.query(
    `SELECT c.* FROM contacts c
     JOIN workspace_users wu ON wu.workspace_id = c.workspace_id
     WHERE c.workspace_id = $1 AND wu.id = $2 AND c.id = $3`,
    [workspaceId, userId, contactId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Contact not found");
  return r.rows[0];
}

export async function findOrCreateContact(
  workspaceId: string,
  data: { email?: string; phone?: string; name?: string }
): Promise<{ id: string; created: boolean }> {
  const key = data.email ?? data.phone;
  if (!key) throw new AppError(400, "Email or phone required");
  const existing = await db.query(
    "SELECT id FROM contacts WHERE workspace_id = $1 AND (email = $2 OR phone = $2)",
    [workspaceId, key]
  );
  if (existing.rows.length > 0) {
    await db.query(
      "UPDATE contacts SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), updated_at = NOW() WHERE id = $4",
      [data.name, data.email, data.phone, existing.rows[0].id]
    );
    return { id: existing.rows[0].id, created: false };
  }
  const id = uuidv4();
  await db.query(
    "INSERT INTO contacts (id, workspace_id, email, phone, name) VALUES ($1, $2, $3, $4, $5)",
    [id, workspaceId, data.email ?? null, data.phone ?? null, data.name ?? null]
  );
  return { id, created: true };
}

export async function getOrCreateConversation(workspaceId: string, contactId: string) {
  const r = await db.query(
    "SELECT id FROM conversations WHERE workspace_id = $1 AND contact_id = $2",
    [workspaceId, contactId]
  );
  if (r.rows.length > 0) return r.rows[0].id;
  const convId = uuidv4();
  await db.query(
    "INSERT INTO conversations (id, workspace_id, contact_id, status) VALUES ($1, $2, $3, 'open')",
    [convId, workspaceId, contactId]
  );
  return convId;
}
