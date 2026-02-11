import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client.js";
import { config } from "../config/index.js";
import type { JwtPayload, UserRole } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";
import { ROLES, WORKSPACE_STATUSES } from "../constants/index.js";

const SALT_ROUNDS = 10;

export async function registerOwner(data: {
  email: string;
  password: string;
  fullName?: string;
  workspaceName: string;
  address?: string;
  timezone?: string;
}) {
  const client = await db.query(
    "SELECT id FROM workspace_users WHERE email = $1",
    [data.email]
  );
  if (client.rows.length > 0) {
    throw new AppError(400, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const workspaceId = uuidv4();
  const userId = uuidv4();
  await db.query(
    `INSERT INTO workspaces (id, name, address, timezone, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [workspaceId, data.workspaceName, data.address ?? null, data.timezone ?? "UTC", WORKSPACE_STATUSES[0]]
  );
  await db.query(
    `INSERT INTO workspace_users (id, workspace_id, email, password_hash, role, full_name, joined_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [userId, workspaceId, data.email, passwordHash, ROLES[0], data.fullName ?? null]
  );
  const token = jwt.sign(
    {
      userId,
      workspaceId,
      email: data.email,
      role: ROLES[0] as UserRole,
    } as JwtPayload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return {
    token,
    user: { id: userId, email: data.email, role: ROLES[0], fullName: data.fullName },
    workspace: { id: workspaceId, name: data.workspaceName, status: WORKSPACE_STATUSES[0] },
  };
}

export async function login(data: { email: string; password: string }) {
  const r = await db.query(
    `SELECT wu.id, wu.workspace_id, wu.email, wu.password_hash, wu.role, wu.full_name, w.name as workspace_name, w.status as workspace_status
     FROM workspace_users wu
     JOIN workspaces w ON w.id = wu.workspace_id
     WHERE wu.email = $1 AND wu.password_hash IS NOT NULL`,
    [data.email]
  );
  if (r.rows.length === 0) {
    throw new AppError(401, "Invalid email or password");
  }
  const row = r.rows[0];
  const valid = await bcrypt.compare(data.password, row.password_hash);
  if (!valid) throw new AppError(401, "Invalid email or password");
  const payload: JwtPayload = {
    userId: row.id,
    workspaceId: row.workspace_id,
    email: row.email,
    role: row.role,
  };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return {
    token,
    user: {
      id: row.id,
      email: row.email,
      role: row.role,
      fullName: row.full_name,
    },
    workspace: { id: row.workspace_id, name: row.workspace_name, status: row.workspace_status },
  };
}

export async function getMe(userId: string) {
  const r = await db.query(
    `SELECT wu.id, wu.email, wu.role, wu.full_name, wu.permissions, w.id as workspace_id, w.name as workspace_name, w.status as workspace_status
     FROM workspace_users wu
     JOIN workspaces w ON w.id = wu.workspace_id
     WHERE wu.id = $1`,
    [userId]
  );
  if (r.rows.length === 0) throw new AppError(404, "User not found");
  const row = r.rows[0];
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    fullName: row.full_name,
    permissions: row.permissions ?? {},
    workspace: {
      id: row.workspace_id,
      name: row.workspace_name,
      status: row.workspace_status,
    },
  };
}
