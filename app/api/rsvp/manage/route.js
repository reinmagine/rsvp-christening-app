import { NextResponse } from "next/server";
import { getRsvp, updateRsvp, withdrawRsvp } from "@/lib/rsvpStore";
import { normalizePhilippineMobile } from "@/lib/phone";
import eventConfig from "@/lib/config";

function validateGuest(guest, requirePhone) {
  if (!guest || typeof guest !== "object" || Array.isArray(guest)) {
    return { valid: false, data: { firstName: "", ...(requirePhone ? { lastName: "" } : {}) } };
  }

  const firstName = String(guest.firstName || "").trim().slice(0, 80);
  const lastName = String(guest.lastName || "").trim().slice(0, 80);
  const contactNumber = normalizePhilippineMobile(guest.contactNumber);
  return {
    valid:
      Boolean(firstName) &&
      (!requirePhone || Boolean(lastName)) &&
      (!requirePhone || Boolean(contactNumber)),
    data: {
      firstName,
      ...(requirePhone ? { lastName, contactNumber } : {}),
    },
  };
}

function validEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  if (entry.attending !== "yes" && entry.attending !== "no") return null;
  if (!Array.isArray(entry.coGuests) || entry.coGuests.length > eventConfig.maxCoGuests) return null;

  const primary = validateGuest(entry.primaryGuest, true);
  const coGuests = entry.coGuests.map((guest) => validateGuest(guest, false));
  const guestCount = 1 + coGuests.length;
  if (!primary.valid || coGuests.some((guest) => !guest.valid)) return null;
  if (!Number.isInteger(entry.guestCount) || entry.guestCount !== guestCount) return null;

  return {
    attending: entry.attending,
    primaryGuest: primary.data,
    coGuests: coGuests.map((guest) => guest.data),
    guestCount,
  };
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
    const validData = validEntry(entry);
    if (!validData) {
      return NextResponse.json({ ok: false, message: "Please double-check the highlighted fields." }, { status: 400 });
    }
    const result = await updateRsvp(token, validData);
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