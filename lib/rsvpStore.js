import { randomBytes } from "node:crypto";

/**
 * RSVP DATA STORE
 *
 * Persists submissions through a Google Apps Script web app attached to the
 * event spreadsheet. Both values are server-only environment variables.
 */

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const GOOGLE_SHEETS_WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

function isConfigured() {
  return Boolean(GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_SECRET);
}

/**
 * Persists a single RSVP entry.
 */
export async function saveRsvp(entry) {
  if (!isConfigured()) {
    throw new Error(
      "Google Sheets webhook is not configured. Set GOOGLE_SHEETS_WEBHOOK_URL and " +
        "GOOGLE_SHEETS_WEBHOOK_SECRET."
    );
  }

  const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: GOOGLE_SHEETS_WEBHOOK_SECRET, entry }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    const message = result?.message ? `: ${result.message}` : ".";
    throw new Error(`Google Sheets webhook failed (${response.status})${message}`);
  }

  return { persisted: true };
}

export function createManagementToken() {
  return randomBytes(32).toString("hex");
}

async function callWebhook(action, payload = {}) {
  if (!isConfigured()) {
    throw new Error(
      "Google Sheets webhook is not configured. Set GOOGLE_SHEETS_WEBHOOK_URL and " +
        "GOOGLE_SHEETS_WEBHOOK_SECRET."
    );
  }

  const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: GOOGLE_SHEETS_WEBHOOK_SECRET,
      action,
      ...payload,
    }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    const message = result?.message ? `: ${result.message}` : ".";
    throw new Error(`Google Sheets webhook failed (${response.status})${message}`);
  }
  return result;
}

export async function createRsvp(entry) {
  return callWebhook("create", { entry });
}

export async function getRsvp(managementToken) {
  return callWebhook("get", { managementToken });
}

export async function updateRsvp(managementToken, entry) {
  return callWebhook("update", { managementToken, entry });
}

export async function withdrawRsvp(managementToken) {
  return callWebhook("withdraw", { managementToken });
}

/**
 * Retrieves all stored RSVPs (oldest first).
 * Useful for a future admin view or CSV export.
 */
export async function listRsvps() {
  return [];
}
