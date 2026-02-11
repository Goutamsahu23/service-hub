import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getDashboard(workspaceId: string, userId: string) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [bookingsToday, bookingsUpcoming, bookingsStats, conversations, formStats, lowStock, alerts] =
    await Promise.all([
      db.query(
        `SELECT b.*, c.name as contact_name, bt.name as booking_type_name
         FROM bookings b
         JOIN contacts c ON c.id = b.contact_id
         JOIN booking_types bt ON bt.id = b.booking_type_id
         WHERE b.workspace_id = $1 AND DATE(b.scheduled_at) = $2 AND b.status NOT IN ('cancelled')
         ORDER BY b.scheduled_at`,
        [workspaceId, today]
      ),
      db.query(
        `SELECT b.*, c.name as contact_name, bt.name as booking_type_name
         FROM bookings b
         JOIN contacts c ON c.id = b.contact_id
         JOIN booking_types bt ON bt.id = b.booking_type_id
         WHERE b.workspace_id = $1 AND b.scheduled_at > $2 AND b.status NOT IN ('cancelled')
         ORDER BY b.scheduled_at LIMIT 10`,
        [workspaceId, tomorrow + "T23:59:59"]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE DATE(scheduled_at) = $2 AND status = 'completed') as completed_today,
           COUNT(*) FILTER (WHERE DATE(scheduled_at) = $2 AND status = 'no_show') as no_show_today
         FROM bookings WHERE workspace_id = $1`,
        [workspaceId, today]
      ),
      db.query(
        `SELECT COUNT(*) as total FROM conversations WHERE workspace_id = $1 AND status = 'open'`,
        [workspaceId]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'pending') as pending,
           COUNT(*) FILTER (WHERE status = 'overdue') as overdue,
           COUNT(*) FILTER (WHERE status = 'completed') as completed
         FROM form_submissions WHERE workspace_id = $1`,
        [workspaceId]
      ),
      db.query(
        `SELECT * FROM inventory_items
         WHERE workspace_id = $1 AND quantity_available <= low_stock_threshold`,
        [workspaceId]
      ),
      db.query(
        `SELECT * FROM alerts WHERE workspace_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT 20`,
        [workspaceId]
      ),
    ]);

  return {
    bookings: {
      today: bookingsToday.rows,
      upcoming: bookingsUpcoming.rows,
      completedToday: parseInt(bookingsStats.rows[0]?.completed_today ?? "0", 10),
      noShowToday: parseInt(bookingsStats.rows[0]?.no_show_today ?? "0", 10),
    },
    conversations: {
      openCount: parseInt(conversations.rows[0]?.total ?? "0", 10),
    },
    forms: {
      pending: parseInt(formStats.rows[0]?.pending ?? "0", 10),
      overdue: parseInt(formStats.rows[0]?.overdue ?? "0", 10),
      completed: parseInt(formStats.rows[0]?.completed ?? "0", 10),
    },
    inventory: {
      lowStock: lowStock.rows,
    },
    alerts: alerts.rows,
  };
}

export async function getNavCounts(workspaceId: string, userId: string) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const [inbox, bookings] = await Promise.all([
    db.query(
      `SELECT COUNT(*) as total FROM conversations cv
       JOIN LATERAL (
         SELECT direction, created_at FROM messages WHERE conversation_id = cv.id ORDER BY created_at DESC LIMIT 1
       ) m ON true
       WHERE cv.workspace_id = $1 AND m.direction = 'in'
         AND (cv.last_read_at IS NULL OR m.created_at > cv.last_read_at)`,
      [workspaceId]
    ),
    db.query(
      "SELECT COUNT(*) as total FROM bookings WHERE workspace_id = $1 AND status = 'confirmed'",
      [workspaceId]
    ),
  ]);
  return {
    inbox: parseInt(inbox.rows[0]?.total ?? "0", 10),
    bookings: parseInt(bookings.rows[0]?.total ?? "0", 10),
  };
}
