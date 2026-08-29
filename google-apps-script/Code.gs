const WEBHOOK_SECRET = "CFPqR7nh19gjB9k5CcSuS9naexaZ-SMTe1w4_ns11uI";
const SHEET_NAME = "";
const MAX_CO_GUESTS = 3;

const HEADERS = [
  "RSVP ID",
  "Submitted At",
  "Attending",
  "Primary First Name",
  "Primary Last Name",
  "Primary Contact Number",
  "Co-Guests",
  "Co-Guests JSON",
  "Guest Count",
  "Status",
  "Management Token",
  "Updated At",
];

function doPost(request) {
  try {
    const payload = JSON.parse(request.postData.contents || "{}");

    if (!WEBHOOK_SECRET || WEBHOOK_SECRET === "REPLACE_WITH_A_LONG_RANDOM_SECRET") {
      throw new Error("Set WEBHOOK_SECRET before deploying.");
    }

    if (payload.secret !== WEBHOOK_SECRET) {
      return jsonResponse({ ok: false, message: "Unauthorized." });
    }

    if (payload.action === "get" || payload.action === "update" || payload.action === "withdraw") {
      return handleManagementAction(payload);
    }

    const entry = payload.entry;
    if (!entry || !entry.primaryGuest) {
      return jsonResponse({ ok: false, message: "Missing RSVP entry." });
    }
    if (!isValidEntry(entry)) {
      return jsonResponse({ ok: false, message: "Invalid RSVP data." });
    }
    entry.primaryGuest.contactNumber = normalizePhilippineMobile(entry.primaryGuest.contactNumber);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_NAME
      ? spreadsheet.getSheetByName(SHEET_NAME)
      : spreadsheet.getSheets()[0];

    if (!sheet) throw new Error("Target sheet was not found.");

    removeDeletedColumns(sheet);
    ensureHeaders(sheet);
    hideNonDisplayColumns(sheet);
    const columns = getColumns(sheet);
    normalizeColumnFormats(sheet, columns);

    const primaryGuest = entry.primaryGuest;
    const coGuests = Array.isArray(entry.coGuests)
      ? entry.coGuests.map((guest) => ({ firstName: guest.firstName || "" }))
      : [];
    const coGuestText = coGuests
      .map((guest) => {
        return guest.firstName || "";
      })
      .join("; ");

    const row = Array(sheet.getLastColumn()).fill("");
    row[columns.RSVPId - 1] = entry.rsvpId || Utilities.getUuid();
    row[columns.SubmittedAt - 1] = formatSubmittedAt(entry.submittedAt);
    row[columns.Attending - 1] = entry.attending === "yes" ? "Yes" : "No";
    row[columns.PrimaryFirstName - 1] = primaryGuest.firstName || "";
    row[columns.PrimaryLastName - 1] = primaryGuest.lastName || "";
    row[columns.PrimaryContact - 1] = primaryGuest.contactNumber || "";
    row[columns.CoGuests - 1] = coGuestText;
    row[columns.CoGuestsJSON - 1] = JSON.stringify(coGuests);
    row[columns.GuestCount - 1] = Number(entry.guestCount) || 1;
    row[columns.Status - 1] = "Active";
    row[columns.ManagementToken - 1] = entry.managementToken || "";
    row[columns.UpdatedAt - 1] = formatSubmittedAt(entry.submittedAt);

    sheet.appendRow(row);

    return jsonResponse({ ok: true, rsvpId: row[0] });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      ok: false,
      message: error && error.message ? `Unable to save RSVP: ${error.message}` : "Unable to save RSVP.",
    });
  }
}

function handleManagementAction(payload) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SHEET_NAME
    ? spreadsheet.getSheetByName(SHEET_NAME)
    : spreadsheet.getSheets()[0];
  if (!sheet) throw new Error("Target sheet was not found.");

  removeDeletedColumns(sheet);
  ensureHeaders(sheet);
  hideNonDisplayColumns(sheet);
  const columns = getColumns(sheet);
  normalizeColumnFormats(sheet, columns);
  const token = String(payload.managementToken || "");
  if (!token) return jsonResponse({ ok: false, message: "Invalid management link." });

  const rowNumber = findRowByToken(sheet, columns, token);
  if (!rowNumber) return jsonResponse({ ok: false, message: "RSVP not found." });

  if (payload.action === "get") {
    return jsonResponse({ ok: true, entry: readEntry(sheet, columns, rowNumber) });
  }

  const entry = payload.entry || {};
  const now = formatSubmittedAt(new Date().toISOString());

  if (payload.action === "withdraw") {
    sheet.getRange(rowNumber, columns.Status).setValue("Withdrawn");
    sheet.getRange(rowNumber, columns.Attending).setValue("No");
    sheet.getRange(rowNumber, columns.UpdatedAt).setValue(now);
    return jsonResponse({ ok: true, status: "Withdrawn" });
  }

  if (payload.action !== "update" || !entry.primaryGuest) {
    return jsonResponse({ ok: false, message: "Invalid RSVP update." });
  }
  if (!isValidEntry(entry)) {
    return jsonResponse({ ok: false, message: "Invalid RSVP update." });
  }
  entry.primaryGuest.contactNumber = normalizePhilippineMobile(entry.primaryGuest.contactNumber);

  const primaryGuest = entry.primaryGuest;
  const coGuests = Array.isArray(entry.coGuests)
    ? entry.coGuests.map(function (guest) { return { firstName: guest.firstName || "" }; })
    : [];
  const coGuestText = coGuests.map(function (guest) {
    return guest.firstName || "";
  }).join("; ");

  sheet.getRange(rowNumber, columns.Attending).setValue(entry.attending === "yes" ? "Yes" : "No");
  sheet.getRange(rowNumber, columns.PrimaryFirstName).setValue(primaryGuest.firstName || "");
  sheet.getRange(rowNumber, columns.PrimaryLastName).setValue(primaryGuest.lastName || "");
  sheet.getRange(rowNumber, columns.PrimaryContact).setValue(primaryGuest.contactNumber || "");
  sheet.getRange(rowNumber, columns.CoGuests).setValue(coGuestText);
  sheet.getRange(rowNumber, columns.CoGuestsJSON).setValue(JSON.stringify(coGuests));
  sheet.getRange(rowNumber, columns.GuestCount).setValue(Number(entry.guestCount) || 1);
  sheet.getRange(rowNumber, columns.Status).setValue("Active");
  sheet.getRange(rowNumber, columns.UpdatedAt).setValue(now);

  return jsonResponse({ ok: true, status: "Active" });
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  HEADERS.forEach(function (header) {
    if (existing.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
    }
  });
}

function removeDeletedColumns(sheet) {
  if (sheet.getLastColumn() === 0) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const deletedHeaders = ["Primary M.I."];
  for (let index = headers.length - 1; index >= 0; index -= 1) {
    if (deletedHeaders.indexOf(headers[index]) !== -1) {
      sheet.deleteColumn(index + 1);
    }
  }
}

function hideNonDisplayColumns(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const displayedHeaders = [
    "Submitted At",
    "Attending",
    "Primary First Name",
    "Primary Last Name",
    "Primary Contact Number",
    "Co-Guests",
    "Guest Count",
    "Status",
    "Updated At",
  ];

  headers.forEach(function (header, index) {
    if (displayedHeaders.indexOf(header) === -1) {
      sheet.hideColumns(index + 1);
    }
  });
}

function normalizeColumnFormats(sheet, columns) {
  if (columns.GuestCount) {
    sheet.getRange(2, columns.GuestCount, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat("0");
  }
}

function getColumns(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const columns = {};
  headers.forEach(function (header, index) {
    columns[header.replace(/[^a-zA-Z]/g, "")] = index + 1;
  });
  return {
    RSVPId: columns.RSVPID,
    SubmittedAt: columns.SubmittedAt,
    Attending: columns.Attending,
    PrimaryFirstName: columns.PrimaryFirstName,
    PrimaryLastName: columns.PrimaryLastName,
    PrimaryContact: columns.PrimaryContactNumber,
    CoGuests: columns.CoGuests,
    CoGuestsJSON: columns.CoGuestsJSON,
    GuestCount: columns.GuestCount,
    Status: columns.Status,
    ManagementToken: columns.ManagementToken,
    UpdatedAt: columns.UpdatedAt,
  };
}

function findRowByToken(sheet, columns, token) {
  if (!columns.ManagementToken || sheet.getLastRow() < 2) return 0;
  const values = sheet.getRange(2, columns.ManagementToken, sheet.getLastRow() - 1, 1).getValues();
  for (var index = 0; index < values.length; index++) {
    if (String(values[index][0]) === token) return index + 2;
  }
  return 0;
}

function readEntry(sheet, columns, rowNumber) {
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  return {
    rsvpId: row[columns.RSVPId - 1],
    attending: String(row[columns.Attending - 1]).toLowerCase() === "yes" ? "yes" : "no",
    primaryGuest: {
      firstName: String(row[columns.PrimaryFirstName - 1] ?? ""),
      lastName: String(row[columns.PrimaryLastName - 1] ?? ""),
      contactNumber: String(row[columns.PrimaryContact - 1] ?? ""),
    },
    coGuests: parseCoGuests(row[columns.CoGuestsJSON - 1]),
    guestCount: Number(row[columns.GuestCount - 1]) || 1,
    status: row[columns.Status - 1] || "Active",
  };
}

function parseCoGuests(value) {
  try {
    const guests = JSON.parse(value || "[]");
    return Array.isArray(guests)
      ? guests.map(function (guest) { return { firstName: String(guest.firstName ?? "") }; })
      : [];
  } catch (error) {
    return [];
  }
}

function normalizePhilippineMobile(value) {
  if (typeof value !== "string") return "";

  var input = value.trim();
  if (!input || !/^[+\d\s().-]+$/.test(input)) return "";
  if (input.indexOf("+") > 0 || input.indexOf("+") !== input.lastIndexOf("+")) return "";

  var compact = input.replace(/[\s().-]/g, "");
  if (/^09\d{9}$/.test(compact)) return compact;
  if (/^\+639\d{9}$/.test(compact)) return "0" + compact.slice(3);
  return "";
}

function isValidEntry(entry) {
  if (!entry || (entry.attending !== "yes" && entry.attending !== "no")) return false;
  if (!entry.primaryGuest || typeof entry.primaryGuest !== "object") return false;
  if (!String(entry.primaryGuest.firstName || "").trim()) return false;
  if (!String(entry.primaryGuest.lastName || "").trim()) return false;
  if (!normalizePhilippineMobile(entry.primaryGuest.contactNumber)) return false;

  var coGuests = entry.coGuests;
  if (!Array.isArray(coGuests) || coGuests.length > MAX_CO_GUESTS) return false;
  if (Number(entry.guestCount) !== 1 + coGuests.length) return false;
  return coGuests.every(function (guest) {
    return guest && typeof guest === "object" && String(guest.firstName || "").trim();
  });
}

function formatSubmittedAt(value) {
  const date = value ? new Date(value) : new Date();
  return Utilities.formatDate(date, "Asia/Manila", "dd MMM yyyy, hh:mm a");
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
