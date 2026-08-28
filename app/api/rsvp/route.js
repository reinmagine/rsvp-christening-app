import { NextResponse } from "next/server";
import { createManagementToken, createRsvp } from "@/lib/rsvpStore";

function isValidPhone(value) {
  if (!value) return false;
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function cleanName(value) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function validateGuest(guest, { requirePhone }) {
  const errors = {};
  const firstName = cleanName(guest.firstName);
  const contactNumber = typeof guest.contactNumber === "string" ? guest.contactNumber.trim() : "";

  if (!firstName) errors.firstName = "Please enter a first name.";
  if (requirePhone && !isValidPhone(contactNumber)) {
    errors.contactNumber = "Please enter a valid contact number.";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    data: { firstName, ...(requirePhone ? { contactNumber } : {}) },
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { primaryGuest, coGuests, attending } = body || {};

  if (attending !== "yes" && attending !== "no") {
    return NextResponse.json(
      { ok: false, message: "Please let us know if you'll be joining us." },
      { status: 400 }
    );
  }

  if (!primaryGuest || typeof primaryGuest !== "object") {
    return NextResponse.json({ ok: false, message: "Missing guest information." }, { status: 400 });
  }

  const primaryResult = validateGuest(primaryGuest, { requirePhone: true });

  const guestList = Array.isArray(coGuests) ? coGuests.slice(0, 20) : [];
  const coGuestResults = guestList.map((g) => validateGuest(g, { requirePhone: false }));

  const allValid = primaryResult.valid && coGuestResults.every((r) => r.valid);

  if (!allValid) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please double-check the highlighted fields.",
        errors: {
          primaryGuest: primaryResult.errors,
          coGuests: coGuestResults.map((r) => r.errors),
        },
      },
      { status: 400 }
    );
  }

  const entry = {
    primaryGuest: primaryResult.data,
    attending,
    coGuests: coGuestResults.map((r) => r.data),
    guestCount: 1 + coGuestResults.length,
    submittedAt: new Date().toISOString(),
    managementToken: createManagementToken(),
  };

  try {
    await createRsvp(entry);
  } catch (err) {
    console.error("[api/rsvp] Failed to save RSVP:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          process.env.NODE_ENV === "development" && err instanceof Error
            ? err.message
            : "Something went wrong while sending your RSVP. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    managementToken: entry.managementToken,
    managementUrl: `/?manage=${entry.managementToken}`,
  });
}
