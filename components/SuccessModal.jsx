"use client";

import { useEffect, useRef } from "react";
import { eventConfig } from "@/lib/config";
import { SparkleField } from "./Decorations";
import styles from "./SuccessModal.module.css";

export default function SuccessModal({ open, onClose, attending, managementUrl }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const heading = attending === "yes" ? "You're on the list! ♡" : "Thank you for letting us know ♡";
  const message =
    attending === "yes"
      ? `Thank you for letting us know. We're so happy to celebrate ${eventConfig.babyFirstName}'s special day with you!`
      : `Thank you for letting us know. We'll miss you, but we appreciate you telling us ahead of time.`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="success-heading">
      <div className={styles.modal}>
        <SparkleField />
        <h2 id="success-heading" className={styles.heading}>
          {heading}
        </h2>
        <p className={styles.message}>{message}</p>
        {attending === "yes" && <p className={styles.small}>We can&rsquo;t wait to see you!</p>}
        {managementUrl && (
          <p className={styles.small}>
            Save this link to update or withdraw your RSVP: <a href={managementUrl}>Manage RSVP</a>
          </p>
        )}
        <button ref={closeBtnRef} className={styles.doneBtn} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
