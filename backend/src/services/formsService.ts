import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listFormTemplates(workspaceId: string, userId: string) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const r = await db.query(
    `SELECT ft.*, bt.name as linked_booking_type_name
     FROM form_templates ft
     LEFT JOIN booking_types bt ON bt.id = ft.linked_booking_type_id
     WHERE ft.workspace_id = $1 ORDER BY ft.name`,
    [workspaceId]
  );
  return r.rows;
}

export async function createFormTemplate(
  workspaceId: string,
  userId: string,
  data: { name: string; description?: string; fields?: unknown[]; linked_booking_type_id?: string }
) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const id = uuidv4();
  await db.query(
    `INSERT INTO form_templates (id, workspace_id, name, description, fields, linked_booking_type_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      id,
      workspaceId,
      data.name,
      data.description ?? null,
      JSON.stringify(data.fields ?? []),
      data.linked_booking_type_id ?? null,
    ]
  );
  const r = await db.query("SELECT * FROM form_templates WHERE id = $1", [id]);
  return r.rows[0];
}

export async function listFormSubmissions(
  workspaceId: string,
  userId: string,
  filters?: { status?: string }
) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  let query = `
    SELECT fs.*, c.name as contact_name, c.email as contact_email,
           b.scheduled_at as booking_scheduled_at, ft.name as form_name
    FROM form_submissions fs
    JOIN contacts c ON c.id = fs.contact_id
    JOIN bookings b ON b.id = fs.booking_id
    JOIN form_templates ft ON ft.id = fs.form_template_id
    WHERE fs.workspace_id = $1
  `;
  const params: unknown[] = [workspaceId];
  if (filters?.status) {
    query += " AND fs.status = $2";
    params.push(filters.status);
  }
  query += " ORDER BY fs.created_at DESC";
  const r = await db.query(query, params);
  return r.rows;
}

export async function getFormSubmission(workspaceId: string, userId: string, submissionId: string) {
  const r = await db.query(
    `SELECT fs.*, c.name as contact_name, c.email as contact_email, ft.name as form_name, ft.fields as form_fields
     FROM form_submissions fs
     JOIN contacts c ON c.id = fs.contact_id
     JOIN form_templates ft ON ft.id = fs.form_template_id
     JOIN workspace_users wu ON wu.workspace_id = fs.workspace_id
     WHERE fs.workspace_id = $1 AND wu.id = $2 AND fs.id = $3`,
    [workspaceId, userId, submissionId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Form submission not found");
  return r.rows[0];
}

export async function submitFormPublic(submissionId: string, data: Record<string, unknown>) {
  const r = await db.query(
    "SELECT * FROM form_submissions WHERE id = $1",
    [submissionId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Form not found");
  const sub = r.rows[0];
  if (sub.status === "completed") throw new AppError(400, "Form already completed");
  await db.query(
    "UPDATE form_submissions SET data = $1, status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = $2",
    [JSON.stringify(data), submissionId]
  );
  return { success: true };
}

export async function getFormForSubmission(submissionId: string) {
  const r = await db.query(
    `SELECT fs.id, fs.status, ft.name, ft.fields
     FROM form_submissions fs
     JOIN form_templates ft ON ft.id = fs.form_template_id
     WHERE fs.id = $1`,
    [submissionId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Form not found");
  return r.rows[0];
}
