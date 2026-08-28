"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import GuestFields from "./GuestFields";
import styles from "./ManageRsvp.module.css";
import { normalizePhilippineMobile } from "@/lib/phone";

const emptyGuest = () => ({ firstName: "" });

export default function ManageRsvp() {
  const searchParams = useSearchParams();
  const token = searchParams.get("manage");
  const [entry, setEntry] = useState(null);
  const [coGuests, setCoGuests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ primaryGuest: {}, coGuests: [] });
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const cancelWithdrawRef = useRef(null);

  useEffect(() => {
    if (withdrawOpen) cancelWithdrawRef.current?.focus();
  }, [withdrawOpen]);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") setWithdrawOpen(false);
    }
    if (withdrawOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [withdrawOpen]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/rsvp/manage?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message);
        setEntry(data.entry);
        setCoGuests(data.entry.coGuests || []);
        setStatus("ready");
      })
      .catch((error) => {
        setMessage(error.message || "This management link is invalid or expired.");
        setStatus("error");
      });
  }, [token]);

  if (!token) return null;

  function updatePrimary(field, value) {
    setEntry((current) => ({ ...current, primaryGuest: { ...current.primaryGuest, [field]: value } }));
  }

  function updateCoGuest(index, field, value) {
    setCoGuests((current) => current.map((guest, i) => i === index ? { ...guest, [field]: value } : guest));
  }

  async function saveChanges(event) {
    event.preventDefault();

    const primaryErrors = {};
    if (!entry.primaryGuest.firstName.trim()) primaryErrors.firstName = "Please enter a first name.";
    if (!normalizePhilippineMobile(entry.primaryGuest.contactNumber)) {
      primaryErrors.contactNumber = "Please enter a valid Philippine mobile number.";
    }
    const coGuestErrors = coGuests.map((guest) => (
      guest.firstName.trim() ? {} : { firstName: "Please enter a first name." }
    ));
    const hasErrors =
      Object.keys(primaryErrors).length > 0 ||
      coGuestErrors.some((guestErrors) => Object.keys(guestErrors).length > 0);
    setErrors({ primaryGuest: primaryErrors, coGuests: coGuestErrors });
    if (hasErrors) {
      setMessage("Please double-check the highlighted fields.");
      return;
    }

    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/rsvp/manage?token=${encodeURIComponent(token)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attending: entry.attending,
        primaryGuest: {
          ...entry.primaryGuest,
          contactNumber: normalizePhilippineMobile(entry.primaryGuest.contactNumber),
        },
        coGuests: coGuests.map((guest) => ({ firstName: guest.firstName })),
        guestCount: 1 + coGuests.length,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setMessage(data.message || "Unable to update this RSVP.");
      setStatus("ready");
      return;
    }
    setEntry((current) => ({ ...current, status: "Active" }));
    setStatus("saved");
    setMessage("Your RSVP has been updated.");
  }

  async function confirmWithdraw() {
    setWithdrawOpen(false);
    setStatus("saving");
    const response = await fetch(`/api/rsvp/manage?token=${encodeURIComponent(token)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setMessage(data.message || "Unable to withdraw this RSVP.");
      setStatus("ready");
      return;
    }
    setEntry((current) => ({ ...current, attending: "no", status: "Withdrawn" }));
    setStatus("withdrawn");
    setMessage("Your RSVP has been withdrawn.");
  }

  return (
    <main className={`page ${styles.page}`}>
      <section className={`card ${styles.card}`}>
        <span className="eyebrow">Manage RSVP</span>
        {status === "loading" && <p className="supportingText">Loading your RSVP…</p>}
        {status === "error" && <p className={styles.error} role="alert">{message}</p>}
        {entry && (
          <>
            <h1 className="sectionHeading">Update your response</h1>
            <p className="supportingText">Change your details or withdraw your attendance below.</p>
            <form className={styles.form} onSubmit={saveChanges}>
              <fieldset disabled={status === "saving" || status === "withdrawn"} className={styles.fieldset}>
                <legend>Will you be joining us?</legend>
                <label><input type="radio" checked={entry.attending === "yes"} onChange={() => setEntry({ ...entry, attending: "yes" })} /> Yes, I’ll be there!</label>
                <label><input type="radio" checked={entry.attending === "no"} onChange={() => setEntry({ ...entry, attending: "no" })} /> Sorry, I can’t make it.</label>
              </fieldset>
              <GuestFields guest={entry.primaryGuest} errors={errors.primaryGuest} onChange={updatePrimary} isPrimary disabled={status === "saving" || status === "withdrawn"} />
              <div className={styles.guestsBlock}>
                {coGuests.map((guest, index) => (
                  <GuestFields key={index} guest={guest} errors={errors.coGuests[index] || {}} onChange={(field, value) => updateCoGuest(index, field, value)} index={index} onRemove={() => setCoGuests((current) => current.filter((_, i) => i !== index))} disabled={status === "saving" || status === "withdrawn"} />
                ))}
              </div>
              {status !== "withdrawn" && <button type="button" className={styles.secondaryButton} onClick={() => setCoGuests((current) => [...current, emptyGuest()])}>+ Add a Guest</button>}
              {message && <p className={status === "saved" || status === "withdrawn" ? styles.success : styles.error} role="status">{message}</p>}
              {status !== "withdrawn" && <button className={styles.submitButton} disabled={status === "saving"} type="submit">{status === "saving" ? "Saving…" : "Save Changes"}</button>}
            </form>
            {status !== "withdrawn" && <button className={styles.withdrawButton} onClick={() => setWithdrawOpen(true)} disabled={status === "saving"}>Withdraw my RSVP</button>}
          </>
        )}
      </section>
      {withdrawOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="withdraw-heading">
          <div className={styles.modal}>
            <h2 id="withdraw-heading" className={styles.modalHeading}>Are you sure you want to withdraw your RSVP?</h2>
            <p className={styles.modalMessage}>You can&rsquo;t undo this action from this link.</p>
            <div className={styles.modalActions}>
              <button ref={cancelWithdrawRef} type="button" className={styles.cancelButton} onClick={() => setWithdrawOpen(false)}>Cancel</button>
              <button type="button" className={styles.confirmButton} onClick={confirmWithdraw}>Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
