import { NextResponse } from "next/server";
import { getRsvp, updateRsvp, withdrawRsvp } from "@/lib/rsvpStore";

function isValidGuest(guest, requirePhone) {
  if (!guest || typeof guest !== "object") return false;
  const digits = String(guest.contactNumber || "").replace(/[^\d]/g, "");
  return Boolean(String(guest.firstName || "").trim()) &&
    (!requirePhone || (digits.length >= 7 && digits.length <= 15));
}

function validEntry(entry) {
  return entry && (entry.attending === "yes" || entry.attending === "no") &&
    isValidGuest(entry.primaryGuest, true) &&
    Array.isArray(entry.coGuests) && entry.coGuests.length <= 20 &&
    entry.coGuests.every((guest) => isValidGuest(guest, false));
}

function tokenFrom(request) {
  return new URL(request.url).searchParams.get("token")?.trim() || "";
}

export async function GET(request) {
  const token = tokenFrom(request);
  if (!token) return NextResponse.json({ ok: false, message: "Invalid management link." }, { status: 400 });

  try {
    const result = await getRsvp(token);
    return NextResponse.json({ ok: true, entry: result.entry });
  } catch {
    return NextResponse.json({ ok: false, message: "This management link is invalid or expired." }, { status: 404 });
  }
}

export async function PATCH(request) {
  const token = tokenFrom(request);
  if (!token) return NextResponse.json({ ok: false, message: "Invalid management link." }, { status: 400 });

  let entry;
  try {
    entry = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  try {
    if (!validEntry(entry)) {
      return NextResponse.json({ ok: false, message: "Please double-check the highlighted fields." }, { status: 400 });
    }
    const result = await updateRsvp(token, entry);
    return NextResponse.json({ ok: true, status: result.status });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to update this RSVP." }, { status: 400 });
  }
}

export async function DELETE(request) {
  const token = tokenFrom(request);
  if (!token) return NextResponse.json({ ok: false, message: "Invalid management link." }, { status: 400 });

  try {
    const result = await withdrawRsvp(token);
    return NextResponse.json({ ok: true, status: result.status });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to withdraw this RSVP." }, { status: 400 });
  }
}