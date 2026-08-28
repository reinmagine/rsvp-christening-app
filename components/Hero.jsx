import { eventConfig } from "@/lib/config";
import { FloralDivider, CornerFlourish } from "./Decorations";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <CornerFlourish className={styles.flourishLeft} />
      <CornerFlourish className={styles.flourishRight} />

      <p className={styles.eyebrow}>A Little Invitation</p>
      <h1 className={styles.heading}>
        A Little Invitation <span className={styles.heart}>♡</span>
      </h1>
      <p className={styles.subheading}>We&rsquo;d love to celebrate this special day with you.</p>

      <div className={styles.videoFrame}>
        <div className={styles.videoArch}>
          <video
            className={styles.video}
            src={eventConfig.videoSrc}
            poster={eventConfig.videoPoster || undefined}
            controls
            playsInline
            preload="metadata"
          >
            Sorry, your browser doesn&rsquo;t support embedded video.
          </video>
        </div>
      </div>

      <FloralDivider />
    </section>
  );
}
