import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listBookingTypes(workspaceId: string, userId: string) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const r = await db.query(
    "SELECT * FROM booking_types WHERE workspace_id = $1 ORDER BY name",
    [workspaceId]
  );
  return r.rows;
}

export async function createBookingType(
  workspaceId: string,
  userId: string,
  data: { name: string; duration_minutes: number; location?: string; is_online?: boolean }
) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const id = uuidv4();
  await db.query(
    `INSERT INTO booking_types (id, workspace_id, name, duration_minutes, location, is_online)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, workspaceId, data.name, data.duration_minutes, data.location ?? null, data.is_online ?? false]
  );
  const r = await db.query("SELECT * FROM booking_types WHERE id = $1", [id]);
  return r.rows[0];
}

export async function listAvailability(workspaceId: string, bookingTypeId?: string) {
  const r = await db.query(
    `SELECT * FROM availability
     WHERE workspace_id = $1 AND (booking_type_id = $2 OR ($2::uuid IS NULL AND booking_type_id IS NULL))
     ORDER BY day_of_week, start_time`,
    [workspaceId, bookingTypeId ?? null]
  );
  return r.rows;
}

export async function setAvailability(
  workspaceId: string,
  userId: string,
  data: { booking_type_id?: string; slots: { day_of_week: number; start_time: string; end_time: string }[] }
) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  await db.query(
    "DELETE FROM availability WHERE workspace_id = $1 AND (booking_type_id = $2 OR ($2::uuid IS NULL AND booking_type_id IS NULL))",
    [workspaceId, data.booking_type_id ?? null]
  );
  for (const slot of data.slots) {
    await db.query(
      `INSERT INTO availability (workspace_id, booking_type_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)`,
      [workspaceId, data.booking_type_id ?? null, slot.day_of_week, slot.start_time, slot.end_time]
    );
  }
  return listAvailability(workspaceId, data.booking_type_id ?? undefined);
}

export async function listBookings(
  workspaceId: string,
  userId: string,
  filters?: { from?: string; to?: string; status?: string }
) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  let query = `
    SELECT b.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone,
           bt.name as booking_type_name, bt.duration_minutes
    FROM bookings b
    JOIN contacts c ON c.id = b.contact_id
    JOIN booking_types bt ON bt.id = b.booking_type_id
    WHERE b.workspace_id = $1
  `;
  const params: unknown[] = [workspaceId];
  let i = 2;
  if (filters?.from) {
    query += ` AND b.scheduled_at >= $${i++}`;
    params.push(filters.from);
  }
  if (filters?.to) {
    query += ` AND b.scheduled_at <= $${i++}`;
    params.push(filters.to);
  }
  if (filters?.status) {
    query += ` AND b.status = $${i++}`;
    params.push(filters.status);
  }
  query += " ORDER BY b.scheduled_at ASC";
  const r = await db.query(query, params);
  return r.rows;
}

export async function updateBookingStatus(
  workspaceId: string,
  userId: string,
  bookingId: string,
  status: string
) {
  const r = await db.query(
    "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND workspace_id = $3 RETURNING *",
    [status, bookingId, workspaceId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Booking not found");
  return r.rows[0];
}

export async function getAvailableSlots(
  workspaceId: string,
  bookingTypeId: string,
  date: string
): Promise<string[]> {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const r = await db.query(
    `SELECT start_time, end_time FROM availability
     WHERE workspace_id = $1 AND (booking_type_id = $2 OR booking_type_id IS NULL) AND day_of_week = $3
     ORDER BY start_time`,
    [workspaceId, bookingTypeId, dayOfWeek]
  );
  const bt = await db.query(
    "SELECT duration_minutes FROM booking_types WHERE id = $1 AND workspace_id = $2",
    [bookingTypeId, workspaceId]
  );
  if (bt.rows.length === 0) return [];
  const duration = bt.rows[0].duration_minutes;
  const taken = await db.query(
    `SELECT scheduled_at FROM bookings
     WHERE workspace_id = $1 AND booking_type_id = $2 AND DATE(scheduled_at) = $3 AND status NOT IN ('cancelled')`,
    [workspaceId, bookingTypeId, date]
  );
  const takenSet = new Set(taken.rows.map((row) => row.scheduled_at.toISOString()));
  const slots: string[] = [];
  for (const row of r.rows) {
    const [sh, sm] = row.start_time.split(":").map(Number);
    const [eh, em] = row.end_time.split(":").map(Number);
    let min = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (min + duration <= endMin) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      const slotTime = new Date(d);
      slotTime.setHours(h, m, 0, 0);
      const iso = slotTime.toISOString();
      if (!takenSet.has(iso)) slots.push(iso);
      min += 30;
    }
  }
  return slots;
}
