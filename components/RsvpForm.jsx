"use client";

import { useState } from "react";
import GuestFields from "./GuestFields";
import SuccessModal from "./SuccessModal";
import { FloralDivider } from "./Decorations";
import styles from "./RsvpForm.module.css";
import { normalizePhilippineMobile } from "@/lib/phone";
import eventConfig from "@/lib/config";

const emptyGuest = () => ({ firstName: "", lastName: "", contactNumber: "" });

export default function RsvpForm() {
  const [primaryGuest, setPrimaryGuest] = useState(emptyGuest());
  const [attending, setAttending] = useState(null); // "yes" | "no" | null
  const [coGuests, setCoGuests] = useState([]);
  const [errors, setErrors] = useState({ primaryGuest: {}, coGuests: [], attending: null });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState("");
  const [locked, setLocked] = useState(false);
  const [managementUrl, setManagementUrl] = useState("");

  function updatePrimaryField(field, value) {
    setPrimaryGuest((g) => ({ ...g, [field]: value }));
  }

  function updateCoGuestField(index, field, value) {
    setCoGuests((list) =>
      list.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  }

  function addGuest() {
    setCoGuests((list) =>
      list.length < eventConfig.maxCoGuests ? [...list, emptyGuest()] : list
    );
  }

  function removeGuest(index) {
    setCoGuests((list) => list.filter((_, i) => i !== index));
    setErrors((e) => ({ ...e, coGuests: e.coGuests.filter((_, i) => i !== index) }));
  }

  function validateLocally() {
    const primaryErrors = {};
    if (!String(primaryGuest.firstName || "").trim()) primaryErrors.firstName = "Please enter your first name.";
    if (!String(primaryGuest.lastName || "").trim()) primaryErrors.lastName = "Please enter your last name.";
    const normalizedContactNumber = normalizePhilippineMobile(primaryGuest.contactNumber);
    if (!normalizedContactNumber) {
      primaryErrors.contactNumber = "Please enter a valid Philippine mobile number.";
    }

    const coErrors = coGuests.map((g) => {
      const e = {};
      if (!g.firstName.trim()) e.firstName = "Please enter a first name.";
      return e;
    });

    const attendingError = attending ? null : "Please let us know if you'll be joining us.";

    setErrors({ primaryGuest: primaryErrors, coGuests: coErrors, attending: attendingError });

    const hasErrors =
      Object.keys(primaryErrors).length > 0 ||
      coErrors.some((e) => Object.keys(e).length > 0) ||
      Boolean(attendingError);

    return !hasErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "submitting" || locked) return;

    const isValid = validateLocally();
    if (!isValid) return;

    setStatus("submitting");
    setSubmitError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGuest: {
            ...primaryGuest,
            lastName: String(primaryGuest.lastName || "").trim(),
            contactNumber: normalizePhilippineMobile(primaryGuest.contactNumber),
          },
          coGuests,
          attending,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus("error");
        setSubmitError(
          data.message || "Something went wrong while sending your RSVP. Please try again."
        );
        return;
      }

      setStatus("success");
      setLocked(true);
      setManagementUrl(data.managementUrl || "");
    } catch {
      setStatus("error");
      setSubmitError("Something went wrong while sending your RSVP. Please try again.");
    }
  }

  const isSubmitting = status === "submitting";
  const canAddGuest = !locked && !isSubmitting && coGuests.length < eventConfig.maxCoGuests;

  return (
    <section className={`card ${styles.wrap}`} id="rsvp">
      <span className="eyebrow">RSVP</span>
      <h2 className="sectionHeading">Will you join us?</h2>
      <p className="supportingText">Please let us know if you&rsquo;ll be celebrating with us.</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <fieldset className={styles.attendFieldset} disabled={locked}>
          <legend className={styles.attendLegend}>
            Will you be joining us? <span className={styles.required}>*</span>
          </legend>

          <label className={`${styles.attendOption} ${attending === "yes" ? styles.attendOptionActive : ""}`}>
            <input
              type="radio"
              name="attending"
              value="yes"
              checked={attending === "yes"}
              onChange={() => setAttending("yes")}
            />
            Yes, I&rsquo;ll be there!
          </label>

          <label className={`${styles.attendOption} ${attending === "no" ? styles.attendOptionActive : ""}`}>
            <input
              type="radio"
              name="attending"
              value="no"
              checked={attending === "no"}
              onChange={() => setAttending("no")}
            />
            Sorry, I won&rsquo;t be able to make it.
          </label>

          {errors.attending && <p className={styles.error}>{errors.attending}</p>}
        </fieldset>

        <div className={styles.guestsBlock}>
          <GuestFields
            guest={primaryGuest}
            errors={errors.primaryGuest}
            onChange={updatePrimaryField}
            isPrimary
            disabled={locked}
          />
        </div>

        <FloralDivider />

        <div className={styles.coGuestSection}>
          <h3 className={styles.coGuestHeading}>Bringing someone with you?</h3>
          <p className="supportingText">
            You may add up to {eventConfig.maxCoGuests} co-guests.
          </p>

          <div className={styles.guestsBlock}>
            {coGuests.map((guest, index) => (
              <GuestFields
                key={index}
                guest={guest}
                errors={errors.coGuests[index] || {}}
                onChange={(field, value) => updateCoGuestField(index, field, value)}
                index={index}
                onRemove={() => removeGuest(index)}
                disabled={locked}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.addGuestBtn}
            onClick={addGuest}
            disabled={!canAddGuest}
          >
            + Add a Guest
          </button>
        </div>

        {status === "error" && (
          <div className={styles.errorBanner} role="alert">
            <p>{submitError}</p>
            <button type="button" onClick={() => setStatus("idle")}>
              Try Again
            </button>
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting || locked}>
          {isSubmitting ? "Sending…" : locked ? "RSVP Sent" : "RSVP"}
        </button>
      </form>

      <SuccessModal
        open={status === "success"}
        attending={attending}
        managementUrl={managementUrl}
        onClose={() => setStatus("success-closed")}
      />
    </section>
  );
}
