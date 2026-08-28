import { eventConfig } from "@/lib/config";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.signoff}>
        With love,
        <br />
        {eventConfig.babyFirstName} &amp; Family
      </p>
      <p className={styles.meta}>
        Christening Celebration &middot; {eventConfig.dateLong}
      </p>
    </footer>
  );
}
