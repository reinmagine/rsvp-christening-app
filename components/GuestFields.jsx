"use client";

import styles from "./GuestFields.module.css";

export default function GuestFields({
  guest,
  errors = {},
  onChange,
  isPrimary,
  index,
  onRemove,
  disabled,
}) {
  const idPrefix = isPrimary ? "primary" : `guest-${index}`;

  function handleField(field) {
    return (e) => onChange(field, e.target.value);
  }

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <p className={styles.groupLabel}>
          {isPrimary ? "Primary Guest (You)" : `Guest ${index + 1}`}
        </p>
        {!isPrimary && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onRemove}
            disabled={disabled}
          >
            Remove Guest
          </button>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-firstName`}>
          First Name <span className={styles.required}>*</span>
        </label>
        <input
          id={`${idPrefix}-firstName`}
          type="text"
          autoComplete="given-name"
          value={guest.firstName || ""}
          onChange={handleField("firstName")}
          disabled={disabled}
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? `${idPrefix}-firstName-err` : undefined}
        />
        {errors.firstName && (
          <p id={`${idPrefix}-firstName-err`} className={styles.error}>
            {errors.firstName}
          </p>
        )}
      </div>

      {isPrimary && (
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-lastName`}>
            Last Name <span className={styles.required}>*</span>
          </label>
          <input
            id={`${idPrefix}-lastName`}
            type="text"
            autoComplete="family-name"
            value={guest.lastName || ""}
            onChange={handleField("lastName")}
            disabled={disabled}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? `${idPrefix}-lastName-err` : undefined}
          />
          {errors.lastName && (
            <p id={`${idPrefix}-lastName-err`} className={styles.error}>
              {errors.lastName}
            </p>
          )}
        </div>
      )}

      {isPrimary && <div className={styles.field}>
        <label htmlFor={`${idPrefix}-contactNumber`}>
          Contact Number <span className={styles.required}>*</span>
        </label>
        <input
          id={`${idPrefix}-contactNumber`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="09XX XXX XXXX"
          value={guest.contactNumber || ""}
          onChange={handleField("contactNumber")}
          disabled={disabled}
          aria-invalid={Boolean(errors.contactNumber)}
          aria-describedby={errors.contactNumber ? `${idPrefix}-contactNumber-err` : undefined}
        />
        {errors.contactNumber && (
          <p id={`${idPrefix}-contactNumber-err`} className={styles.error}>
            {errors.contactNumber}
          </p>
        )}
      </div>}
    </div>
  );
}
