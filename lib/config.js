/**
 * ────────────────────────────────────────────────────────────
 *  EVENT CONFIGURATION
 *  Edit everything about the event here — nothing else in the
 *  codebase needs to change.
 * ────────────────────────────────────────────────────────────
 */

export const eventConfig = {
  // Baby's details
  babyName: "Keilly Ellysse",
  babyFirstName: "Keilly Ellysse",

  // Invitation video
  // Drop your video file at: public/video/vid-invitation.mp4
  // (or replace this string with an external URL, e.g. a Cloudinary/YouTube-hosted link)
  videoSrc: "/video/vid-invitation.mp4",
  videoPoster: "", // optional: "/video/poster.jpg"

  // Date & time
  dateLong: "20 September 2026",
  dayOfWeek: "Sunday",
  time: "9:00 AM",

  // Church
  churchName: "San Agustin Parish Church",
  churchAddress: "Moonwalk, Parañaque City",
  churchMapUrl:
    "https://maps.google.com/?q=San+Agustin+Parish+Church+Moonwalk+Paranaque",

  // Reception
  receptionName: "Shakey's Olivarez Plaza",
  receptionAddress: "Ninoy Aquino Ave., Parañaque City",
  receptionMapUrl:
    "https://maps.google.com/?q=Shakey%27s+Olivarez+Plaza+Ninoy+Aquino+Ave+Paranaque",

  // Misc copy
  siteTitle: "Keilly Ellysse's Christening ♡",
  siteDescription:
    "Join us as we celebrate Keilly Ellysse's Christening on 20 September 2026. We'd love for you to be there.",
  // Social preview image — put a 1200x630 image at public/og-image.jpg
  ogImage: "/og-image.jpg",
  timezone: "Asia/Manila",
  maxCoGuests: 3,
};

export default eventConfig;
