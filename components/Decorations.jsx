export function FloralDivider() {
  return (
    <div className="divider" aria-hidden="true">
      <svg viewBox="0 0 90 20" fill="none">
        <path d="M0 10 H30" stroke="currentColor" strokeWidth="1" />
        <circle cx="45" cy="10" r="3" fill="var(--blush)" />
        <path
          d="M45 10 C40 4, 34 4, 34 10 C34 16, 40 16, 45 10 C50 4, 56 4, 56 10 C56 16, 50 16, 45 10"
          stroke="var(--taupe)"
          strokeWidth="1"
          fill="none"
        />
        <path d="M60 10 H90" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function BowIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 12C16 12 13 4 6 4C2.5 4 1 6.5 1 9C1 12.5 5 14 8 12.5L16 12L8 11.5C5 10 1 11.5 1 15C1 17.5 2.5 20 6 20C13 20 16 12 16 12Z"
        fill="var(--blush)"
        opacity="0.9"
      />
      <path
        d="M16 12C16 12 19 4 26 4C29.5 4 31 6.5 31 9C31 12.5 27 14 24 12.5L16 12L24 11.5C27 10 31 11.5 31 15C31 17.5 29.5 20 26 20C19 20 16 12 16 12Z"
        fill="var(--blush)"
        opacity="0.9"
      />
      <circle cx="16" cy="12" r="2.4" fill="var(--blush-deep)" />
    </svg>
  );
}

export function SparkleField() {
  return (
    <svg
      className="sparkleField"
      viewBox="0 0 200 60"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {[
        [20, 12, 3],
        [60, 30, 2],
        [110, 8, 2.5],
        [150, 25, 3],
        [180, 45, 2],
        [90, 45, 2],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`}
          fill="var(--blush)"
          opacity="0.85"
        />
      ))}
    </svg>
  );
}

export function CornerFlourish({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2C20 2 20 20 38 20C50 20 50 8 58 8"
        stroke="var(--taupe)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2.5" fill="var(--blush)" />
      <circle cx="24" cy="16" r="1.6" fill="var(--taupe)" />
    </svg>
  );
}
