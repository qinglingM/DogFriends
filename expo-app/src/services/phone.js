export function normalizeChinaMobileToE164(input) {
  const trimmed = String(input ?? '').trim().replace(/\s+/g, '');

  if (/^\+861\d{10}$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  if (/^1\d{10}$/.test(digits)) return `+86${digits}`;
  if (/^861\d{10}$/.test(digits)) return `+${digits}`;

  return null;
}

export function maskPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const local = digits.startsWith('86') ? digits.slice(2) : digits;
  if (local.length !== 11) return phone;
  return `${local.slice(0, 3)}****${local.slice(-4)}`;
}
