import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";

const SALT_ROUNDS = 10;

export async function getWorkspace(workspaceId: string, userId: string) {
  const r = await db.query(
    `SELECT w.* FROM workspaces w
     JOIN workspace_users wu ON wu.workspace_id = w.id
     WHERE w.id = $1 AND wu.id = $2`,
    [workspaceId, userId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Workspace not found");
  return r.rows[0];
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  data: { name?: string; address?: string; timezone?: string; contact_email?: string }
) {
  await getWorkspace(workspaceId, userId);
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (data.name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(data.name);
  }
  if (data.address !== undefined) {
    updates.push(`address = $${i++}`);
    values.push(data.address);
  }
  if (data.timezone !== undefined) {
    updates.push(`timezone = $${i++}`);
    values.push(data.timezone);
  }
  if (data.contact_email !== undefined) {
    updates.push(`contact_email = $${i++}`);
    values.push(data.contact_email);
  }
  if (updates.length === 0) return getWorkspace(workspaceId, userId);
  updates.push(`updated_at = NOW()`);
  values.push(workspaceId);
  await db.query(
    `UPDATE workspaces SET ${updates.join(", ")} WHERE id = $${i}`,
    values
  );
  return getWorkspace(workspaceId, userId);
}

export async function setEmailIntegration(
  workspaceId: string,
  userId: string,
  config: { provider: string; apiKey?: string; fromEmail?: string }
) {
  await getWorkspace(workspaceId, userId);
  await db.query(
    `INSERT INTO integrations (workspace_id, type, provider, config, is_active)
     VALUES ($1, 'email', $2, $3, true)
     ON CONFLICT (workspace_id, type) DO UPDATE SET provider = $2, config = $3, is_active = true, updated_at = NOW()`,
    [workspaceId, config.provider, JSON.stringify(config)]
  );
  await db.query(
    "UPDATE workspaces SET email_connected = true, updated_at = NOW() WHERE id = $1",
    [workspaceId]
  );
  return getWorkspace(workspaceId, userId);
}

export async function setSmsIntegration(
  workspaceId: string,
  userId: string,
  config: { provider: string; accountSid?: string; authToken?: string; phoneNumber?: string }
) {
  await getWorkspace(workspaceId, userId);
  await db.query(
    `INSERT INTO integrations (workspace_id, type, provider, config, is_active)
     VALUES ($1, 'sms', $2, $3, true)
     ON CONFLICT (workspace_id, type) DO UPDATE SET provider = $2, config = $3, is_active = true, updated_at = NOW()`,
    [workspaceId, config.provider, JSON.stringify(config)]
  );
  await db.query(
    "UPDATE workspaces SET sms_connected = true, updated_at = NOW() WHERE id = $1",
    [workspaceId]
  );
  return getWorkspace(workspaceId, userId);
}

export async function createOrUpdateContactForm(
  workspaceId: string,
  userId: string,
  data: { name?: string; fields?: unknown[]; welcome_message_template?: string }
) {
  await getWorkspace(workspaceId, userId);
  const r = await db.query(
    `INSERT INTO contact_forms (workspace_id, name, fields, welcome_message_template)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (workspace_id) DO UPDATE SET name = $2, fields = $3, welcome_message_template = $4, updated_at = NOW()
     RETURNING *`,
    [
      workspaceId,
      data.name ?? "Contact",
      JSON.stringify(data.fields ?? [{ name: "name", type: "text" }, { name: "email", type: "email" }, { name: "message", type: "textarea" }]),
      data.welcome_message_template ?? "",
    ]
  );
  return r.rows[0];
}

export async function getContactForm(workspaceId: string) {
  const r = await db.query("SELECT * FROM contact_forms WHERE workspace_id = $1", [workspaceId]);
  return r.rows[0] ?? null;
}

export async function getOnboardingStatus(workspaceId: string, userId: string) {
  const w = await getWorkspace(workspaceId, userId);
  const steps = {
    workspace: true,
    emailOrSms: !!(w.email_connected || w.sms_connected),
    contactForm: false,
    bookingTypes: false,
    postBookingForms: false,
    inventory: false,
    staff: false,
    active: w.status === "active",
  };
  const cf = await db.query("SELECT id FROM contact_forms WHERE workspace_id = $1", [workspaceId]);
  steps.contactForm = cf.rows.length > 0;
  const bt = await db.query("SELECT id FROM booking_types WHERE workspace_id = $1", [workspaceId]);
  steps.bookingTypes = bt.rows.length > 0;
  const av = await db.query("SELECT id FROM availability WHERE workspace_id = $1", [workspaceId]);
  const hasAvailability = av.rows.length > 0;
  const ft = await db.query("SELECT id FROM form_templates WHERE workspace_id = $1", [workspaceId]);
  steps.postBookingForms = ft.rows.length > 0;
  const inv = await db.query("SELECT id FROM inventory_items WHERE workspace_id = $1", [workspaceId]);
  steps.inventory = inv.rows.length > 0; // optional; we can consider it done if they skipped
  const staff = await db.query(
    "SELECT id FROM workspace_users WHERE workspace_id = $1 AND role = 'staff'",
    [workspaceId]
  );
  steps.staff = staff.rows.length > 0; // optional
  return {
    workspace: w,
    steps: { ...steps, hasAvailability },
    canActivate: (w.email_connected || w.sms_connected) && steps.bookingTypes && hasAvailability,
  };
}

export async function activateWorkspace(workspaceId: string, userId: string) {
  const status = await getOnboardingStatus(workspaceId, userId);
  if (!status.canActivate) {
    throw new AppError(
      400,
      "Cannot activate: connect at least one communication channel, add a booking type, and set availability."
    );
  }
  await db.query("UPDATE workspaces SET status = 'active', updated_at = NOW() WHERE id = $1", [
    workspaceId,
  ]);
  return getWorkspace(workspaceId, userId);
}

export async function listStaff(workspaceId: string, userId: string) {
  await getWorkspace(workspaceId, userId);
  const r = await db.query(
    `SELECT id, email, role, full_name, joined_at
     FROM workspace_users
     WHERE workspace_id = $1 AND role = 'staff'
     ORDER BY joined_at DESC NULLS LAST`,
    [workspaceId]
  );
  return r.rows;
}

export async function addStaff(
  workspaceId: string,
  userId: string,
  data: { email: string; password: string; fullName?: string }
) {
  await getWorkspace(workspaceId, userId);
  const existing = await db.query(
    "SELECT id FROM workspace_users WHERE workspace_id = $1 AND email = $2",
    [workspaceId, data.email]
  );
  if (existing.rows.length > 0) {
    throw new AppError(400, "A user with this email already exists in this workspace");
  }
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const staffId = uuidv4();
  await db.query(
    `INSERT INTO workspace_users (id, workspace_id, email, password_hash, role, full_name, joined_at)
     VALUES ($1, $2, $3, $4, 'staff', $5, NOW())`,
    [staffId, workspaceId, data.email, passwordHash, data.fullName ?? null]
  );
  return {
    id: staffId,
    email: data.email,
    role: "staff",
    fullName: data.fullName ?? null,
  };
}
