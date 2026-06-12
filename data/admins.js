// ─── Admin allow-list ────────────────────────────────────────────────────────
// ONLY these emails get moderation powers, and ONLY after a valid magic-link
// login (valid login AND on this list = the security gate). Anyone who logs in
// with an email not on this list is treated as an ordinary anonymous visitor.
//
// Edit this list to add/remove admins.
//
// ⚠️ IMPORTANT: this list is ALSO enforced in the database via the SQL function
// `is_admin()` (see the RLS migration). The client list only shows/hides admin
// UI — the database list is what actually permits writes. If you change admins
// here, update the `is_admin()` function in Supabase too, or the new admin
// won't actually be able to moderate.
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_EMAILS = [
  'xakkhi.official@gmail.com',
  'royannwesha01@gmail.com',
];

export function isAdminEmail(email) {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === e);
}
