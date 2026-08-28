import { eventConfig } from "@/lib/config";
import styles from "./EventDetails.module.css";

export default function EventDetails() {
  return (
    <section className={`card ${styles.wrap}`}>
      <span className="eyebrow">Save the date</span>
      <h2 className="sectionHeading">{eventConfig.babyFirstName}&rsquo;s Christening</h2>

      <div className={styles.dateTime}>
        <p className={styles.dateLine}>{eventConfig.dateLong}</p>
        <p className={styles.dayLine}>
          {eventConfig.dayOfWeek} &middot; {eventConfig.time}
        </p>
      </div>

      <div className={styles.venues}>
        <div className={styles.venue}>
          <p className={styles.venueLabel}>Ceremony</p>
          <p className={styles.venueName}>{eventConfig.churchName}</p>
          <p className={styles.venueAddress}>{eventConfig.churchAddress}</p>
          <a
            className={styles.venueLink}
            href={eventConfig.churchMapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Church Location ↗
          </a>
        </div>

        <div className={styles.venueDivider} aria-hidden="true" />

        <div className={styles.venue}>
          <p className={styles.venueLabel}>Celebration After</p>
          <p className={styles.venueName}>{eventConfig.receptionName}</p>
          <p className={styles.venueAddress}>{eventConfig.receptionAddress}</p>
          <a
            className={styles.venueLink}
            href={eventConfig.receptionMapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Reception Location ↗
          </a>
        </div>
      </div>

    </section>
  );
}
