// ============================================================================
// XAKKHI PURGE TOOL — deletes reports AND their photos for a time window.
// Standalone ops script. NOT part of the website; runs only when you invoke it.
//
// Needs the service-role key in .env.local (never commit it):
//   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase → Settings → API → service_role)
//
// USAGE (times are IST, format "YYYY-MM-DD HH:mm"):
//   Dry-run a window (shows what WOULD be deleted, deletes nothing):
//     node scripts/purge-reports.cjs --from "2026-06-24 21:00" --to "2026-06-24 21:20"
//   Actually delete that window:
//     node scripts/purge-reports.cjs --from "2026-06-24 21:00" --to "2026-06-24 21:20" --confirm
//   Dry-run EVERYTHING (full wipe preview):
//     node scripts/purge-reports.cjs
//   Actually wipe EVERYTHING:
//     node scripts/purge-reports.cjs --confirm --all
//
// Default is ALWAYS a dry-run. Nothing is deleted without --confirm.
// A full wipe (no --from/--to) additionally requires --all as a safety latch.
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const BUCKET = 'report-photos';
const PHOTO_FIELDS = ['photo_url', 'before_photo_url', 'after_photo_url', 'flag_photo_url', 'verification_photo_url'];

// --- env ---
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach((l) => { const i = l.indexOf('='); if (i > 0 && !l.startsWith('#')) env[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error('\nERROR: SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.');
  console.error('Add it (Supabase → Settings → API → service_role key), then retry.\n');
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// --- args ---
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const has = (name) => args.includes(name);
const fromIST = getArg('--from');
const toIST = getArg('--to');
const confirm = has('--confirm');
const allowAll = has('--all');

// IST "YYYY-MM-DD HH:mm" -> UTC ISO string
const istToUtc = (s) => new Date(s.replace(' ', 'T') + ':00+05:30').toISOString();
const fmtIST = (utc) => new Date(utc).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const storagePath = (u) => (u && u.includes('/' + BUCKET + '/')) ? u.split('/' + BUCKET + '/')[1] : null;
const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };

(async () => {
  const isFullWipe = !fromIST && !toIST;

  let q = supabase.from('reports').select('id, created_at, ' + PHOTO_FIELDS.join(', '));
  if (fromIST) q = q.gte('created_at', istToUtc(fromIST));
  if (toIST) q = q.lte('created_at', istToUtc(toIST));
  const { data: reports, error } = await q;
  if (error) { console.error('Fetch failed:', error.message); process.exit(1); }

  console.log('\n=== Purge ' + (confirm ? '(LIVE)' : '(dry-run)') + ' ===');
  console.log('Window:', isFullWipe ? 'EVERYTHING (no time bounds)' : `${fromIST || '(start)'}  →  ${toIST || '(now)'}  IST`);
  console.log('Reports matched:', reports.length);
  if (reports.length === 0) { console.log('Nothing to do.\n'); return; }

  const sorted = [...reports].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  console.log('Earliest:', fmtIST(sorted[0].created_at), 'IST');
  console.log('Latest:  ', fmtIST(sorted[sorted.length - 1].created_at), 'IST');

  const ids = reports.map((r) => r.id);

  // gather photo paths from the reports + their report_actions
  const paths = new Set();
  for (const r of reports) for (const f of PHOTO_FIELDS) { const p = storagePath(r[f]); if (p) paths.add(p); }
  for (const batch of chunk(ids, 100)) {
    const { data: acts } = await supabase.from('report_actions').select('photo_url').in('report_id', batch);
    (acts || []).forEach((a) => { const p = storagePath(a.photo_url); if (p) paths.add(p); });
  }
  console.log('Photo files to delete:', paths.size);

  if (!confirm) {
    console.log('\nDRY-RUN only — nothing deleted. Re-run with --confirm to delete.\n');
    return;
  }
  if (isFullWipe && !allowAll) {
    console.log('\nFull wipe blocked: add --all to confirm deleting EVERYTHING.\n');
    return;
  }

  // 1) delete photo files from storage
  let removed = 0;
  for (const batch of chunk([...paths], 100)) {
    const { error: e } = await supabase.storage.from(BUCKET).remove(batch);
    if (e) console.error('Storage remove error:', e.message); else removed += batch.length;
  }
  console.log('Deleted photo files:', removed);

  // 2) delete child rows then reports (in batches)
  for (const batch of chunk(ids, 100)) {
    await supabase.from('report_actions').delete().in('report_id', batch);
    await supabase.from('report_seen').delete().in('report_id', batch);
    const { error: e } = await supabase.from('reports').delete().in('id', batch);
    if (e) console.error('Reports delete error:', e.message);
  }
  console.log('Deleted reports:', ids.length);
  console.log('Done.\n');
})();
