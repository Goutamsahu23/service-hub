import type { PoolClient } from "pg";
import { db } from "../db/client.js";

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface SendSmsOptions {
  to: string;
  body: string;
}

export interface IntegrationResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export async function sendEmail(
  workspaceId: string,
  options: SendEmailOptions
): Promise<IntegrationResult> {
  const r = await db.query(
    "SELECT provider, config FROM integrations WHERE workspace_id = $1 AND type = 'email' AND is_active = true",
    [workspaceId]
  );
  if (r.rows.length === 0) {
    await logIntegration(workspaceId, "email", "send", false, "No email integration configured");
    return { success: false, error: "No email integration" };
  }
  const { provider, config } = r.rows[0];
  try {
    if (provider === "resend" && config?.apiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          from: options.from ?? config.fromEmail ?? "onboarding@resend.dev",
          to: [options.to],
          subject: options.subject,
          html: options.body,
        }),
      });
      const data = (await res.json()) as { id?: string; message?: string };
      if (!res.ok) {
        await logIntegration(workspaceId, "email", "send", false, data.message ?? res.statusText);
        return { success: false, error: data.message ?? "Email failed" };
      }
      await logIntegration(workspaceId, "email", "send", true, undefined, { id: data.id });
      return { success: true, externalId: data.id };
    }
    if (provider === "mock") {
      console.log("[MOCK EMAIL]", { to: options.to, subject: options.subject });
      await logIntegration(workspaceId, "email", "send", true, undefined, { mock: true });
      return { success: true, externalId: "mock-" + Date.now() };
    }
    await logIntegration(workspaceId, "email", "send", false, `Unknown provider: ${provider}`);
    return { success: false, error: "Unknown email provider" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logIntegration(workspaceId, "email", "send", false, message);
    return { success: false, error: message };
  }
}

export async function sendSms(
  workspaceId: string,
  options: SendSmsOptions
): Promise<IntegrationResult> {
  const r = await db.query(
    "SELECT provider, config FROM integrations WHERE workspace_id = $1 AND type = 'sms' AND is_active = true",
    [workspaceId]
  );
  if (r.rows.length === 0) {
    await logIntegration(workspaceId, "sms", "send", false, "No SMS integration configured");
    return { success: false, error: "No SMS integration" };
  }
  const { provider, config } = r.rows[0];
  try {
    if (provider === "twilio" && config?.accountSid && config?.authToken) {
      const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
      const body = new URLSearchParams({
        To: options.to,
        From: config.phoneNumber ?? "",
        Body: options.body,
      });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );
      const data = (await res.json()) as { sid?: string; message?: string };
      if (!res.ok) {
        await logIntegration(workspaceId, "sms", "send", false, data.message ?? res.statusText);
        return { success: false, error: data.message ?? "SMS failed" };
      }
      await logIntegration(workspaceId, "sms", "send", true, undefined, { sid: data.sid });
      return { success: true, externalId: data.sid };
    }
    if (provider === "mock") {
      console.log("[MOCK SMS]", { to: options.to, body: options.body });
      await logIntegration(workspaceId, "sms", "send", true, undefined, { mock: true });
      return { success: true, externalId: "mock-" + Date.now() };
    }
    await logIntegration(workspaceId, "sms", "send", false, `Unknown provider: ${provider}`);
    return { success: false, error: "Unknown SMS provider" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logIntegration(workspaceId, "sms", "send", false, message);
    return { success: false, error: message };
  }
}

async function logIntegration(
  workspaceId: string,
  type: string,
  event: string,
  success: boolean,
  errorMessage?: string,
  metadata?: Record<string, unknown>
) {
  await db.query(
    `INSERT INTO integration_logs (workspace_id, integration_type, event, success, error_message, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [workspaceId, type, event, success, errorMessage ?? null, JSON.stringify(metadata ?? {})]
  );
  if (!success && errorMessage) {
    await db.query(
      "UPDATE integrations SET last_error = $1, updated_at = NOW() WHERE workspace_id = $2 AND type = $3",
      [errorMessage, workspaceId, type]
    );
  }
}
