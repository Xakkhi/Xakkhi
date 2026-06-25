-- ============================================================================
-- XAKKHI EMERGENCY KILL SWITCH
-- Run these in the Supabase SQL editor (dashboard → SQL editor).
-- These only touch the database; the website code is unaffected.
-- ============================================================================

-- ─── STOP all new report submissions (use during a spam flood) ──────────────
-- After this, the public can no longer insert reports. Viewing the map/list,
-- admin, etc. all keep working. This is instant and reversible.

drop policy if exists "Public insert reports" on reports;


-- ─── RE-OPEN submissions (run after cleanup) ────────────────────────────────
-- Restores the hardened insert policy (anon can only create fresh, unresolved,
-- visible reports — same as normal operation).

create policy "Public insert reports" on reports for insert
  with check (
    status = 'unresolved'
    and coalesce(is_removed, false) = false
    and resolved_at is null
    and after_photo_url is null
    and coalesce(resolved_by_citizen, false) = false
    and coalesce(seen_count, 0) = 0
  );
