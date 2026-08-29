import { NextResponse } from "next/server";
import { createManagementToken, createRsvp } from "@/lib/rsvpStore";
import { normalizePhilippineMobile } from "@/lib/phone";
import eventConfig from "@/lib/config";

function cleanName(value) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function validateGuest(guest, { requirePhone }) {
  const errors = {};
  if (!guest || typeof guest !== "object" || Array.isArray(guest)) {
    return {
      errors: {
        firstName: "Please enter a first name.",
        ...(requirePhone ? { lastName: "Please enter a last name." } : {}),
      },
      valid: false,
      data: { firstName: "", ...(requirePhone ? { lastName: "" } : {}) },
    };
  }

  const firstName = cleanName(guest.firstName);
  const lastName = cleanName(guest.lastName);
  const contactNumber = normalizePhilippineMobile(guest.contactNumber);

  if (!firstName) errors.firstName = "Please enter a first name.";
  if (requirePhone && !lastName) errors.lastName = "Please enter a last name.";
  if (requirePhone && !contactNumber) {
    errors.contactNumber = "Please enter a valid contact number.";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    data: {
      firstName,
      ...(requirePhone ? { lastName, contactNumber } : {}),
    },
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

  if (coGuests !== undefined && !Array.isArray(coGuests)) {
    return NextResponse.json({ ok: false, message: "Invalid guest information." }, { status: 400 });
  }

  const guestList = coGuests || [];
  if (guestList.length > eventConfig.maxCoGuests) {
    return NextResponse.json({ ok: false, message: `You may add up to ${eventConfig.maxCoGuests} co-guests.` }, { status: 400 });
  }
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
