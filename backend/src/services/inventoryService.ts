import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listInventory(workspaceId: string, userId: string) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const r = await db.query(
    "SELECT * FROM inventory_items WHERE workspace_id = $1 ORDER BY name",
    [workspaceId]
  );
  return r.rows;
}

export async function createInventoryItem(
  workspaceId: string,
  userId: string,
  data: {
    name: string;
    quantity_available: number;
    quantity_used_per_booking?: number;
    low_stock_threshold?: number;
    unit?: string;
  }
) {
  await db.query(
    "SELECT 1 FROM workspace_users WHERE workspace_id = $1 AND id = $2",
    [workspaceId, userId]
  );
  const id = uuidv4();
  await db.query(
    `INSERT INTO inventory_items (id, workspace_id, name, quantity_available, quantity_used_per_booking, low_stock_threshold, unit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      workspaceId,
      data.name,
      data.quantity_available,
      data.quantity_used_per_booking ?? 1,
      data.low_stock_threshold ?? 5,
      data.unit ?? "unit",
    ]
  );
  const r = await db.query("SELECT * FROM inventory_items WHERE id = $1", [id]);
  return r.rows[0];
}

export async function updateInventoryItem(
  workspaceId: string,
  userId: string,
  itemId: string,
  data: { quantity_available?: number; low_stock_threshold?: number }
) {
  const r = await db.query(
    "UPDATE inventory_items SET quantity_available = COALESCE($1, quantity_available), low_stock_threshold = COALESCE($2, low_stock_threshold), updated_at = NOW() WHERE id = $3 AND workspace_id = $4 RETURNING *",
    [data.quantity_available, data.low_stock_threshold, itemId, workspaceId]
  );
  if (r.rows.length === 0) throw new AppError(404, "Inventory item not found");
  return r.rows[0];
}

export async function getLowStockItems(workspaceId: string) {
  const r = await db.query(
    `SELECT * FROM inventory_items
     WHERE workspace_id = $1 AND quantity_available <= low_stock_threshold
     ORDER BY quantity_available ASC`,
    [workspaceId]
  );
  return r.rows;
}
