/**
 * Shared live room PIN utilities.
 * Matches backend `normalize_room_pin` and `format_room_pin` in `app/services/live_manager.py`:
 * - Strips whitespace and hyphens, uppercases letters
 * - Accepts 6–12 alphanumeric characters (e.g. "ADBI 482" or "482 619")
 * - Formats letter+digit codes as "ADBI 482" and 6-digit codes as "482 619"
 */

export const ROOM_PIN_EXAMPLE = 'ADBI 482';

export function normalizeRoomPin(raw: string): string {
  return raw.replace(/[\s-]+/g, '').trim().toUpperCase();
}

export function isValidRoomPin(raw: string): boolean {
  const clean = normalizeRoomPin(raw);
  return /^[A-Z0-9]{6,12}$/.test(clean);
}

export function formatRoomPin(raw: string): string {
  const clean = normalizeRoomPin(raw);
  if (/^\d{6}$/.test(clean)) {
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  const match = /^([A-Z]+)(\d+)$/.exec(clean);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return clean;
}
