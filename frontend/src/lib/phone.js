/**
 * Russian phone helper:
 *  - formatPhone("89991234567") → "+7 (999) 123-45-67"
 *  - formatPhone("+71234567890") → "+7 (123) 456-78-90"
 *  - isValidRuPhone(formatted) → true only when 11 digits total starting with 7
 *
 * The masked formatter keeps the leading "+7 " visible at all times, so
 * users typing or pasting never break the format.
 */

export function digitsOnly(s) {
  return (s || "").replace(/\D/g, "");
}

export function normalizeRuDigits(input) {
  // Strip every non-digit, then coerce leading 8/0/missing to country code 7.
  let d = digitsOnly(input);
  if (!d) return "";
  if (d[0] === "8") d = "7" + d.slice(1);
  if (d[0] !== "7") d = "7" + d;
  // Truncate to exactly 11 digits (RU phone length).
  return d.slice(0, 11);
}

export function formatPhone(input) {
  const d = normalizeRuDigits(input);
  if (!d) return "";
  // Always start with "+7 "
  const a = d.slice(1, 4);  // 3 digits
  const b = d.slice(4, 7);  // 3 digits
  const c = d.slice(7, 9);  // 2 digits
  const e = d.slice(9, 11); // 2 digits
  let out = "+7";
  if (a) out += ` (${a}`;
  if (a.length === 3) out += ")";
  if (b) out += ` ${b}`;
  if (c) out += `-${c}`;
  if (e) out += `-${e}`;
  return out;
}

export function isValidRuPhone(value) {
  const d = digitsOnly(value);
  return d.length === 11 && d[0] === "7";
}
