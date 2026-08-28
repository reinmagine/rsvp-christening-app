const ALLOWED_PHONE_CHARACTERS = /^[+\d\s().-]+$/;
const LOCAL_MOBILE_PATTERN = /^09\d{9}$/;
const INTERNATIONAL_MOBILE_PATTERN = /^\+639\d{9}$/;

export function normalizePhilippineMobile(value) {
  if (typeof value !== "string") return "";

  const input = value.trim();
  if (!input || !ALLOWED_PHONE_CHARACTERS.test(input)) return "";
  if (input.indexOf("+") > 0 || input.indexOf("+") !== input.lastIndexOf("+")) return "";

  const compact = input.replace(/[\s().-]/g, "");
  if (LOCAL_MOBILE_PATTERN.test(compact)) return compact;
  if (INTERNATIONAL_MOBILE_PATTERN.test(compact)) return `0${compact.slice(3)}`;

  return "";
}

export function isValidPhilippineMobile(value) {
  return Boolean(normalizePhilippineMobile(value));
}
