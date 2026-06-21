'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for ALL reports + one Supabase Realtime subscription.
//
// Every page (map, list, leaderboard, official, about, review) reads from this
// shared array via useReports() instead of running its own fetch. One websocket
// keeps the array live across every open tab/device.
//
// NOTE: holds the FULL unfiltered list (incl. flag_status='approved') so the
// review queue can see flagged items. Public pages filter those out themselves.
//
// REQUIRES Realtime enabled on the table (one-time, in Supabase SQL editor):
//   alter publication supabase_realtime add table reports;
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { detectWard } from '../lib/ward-detector';

// Always derive a report's ward from its actual coordinates (point-in-polygon),
// overriding the stored ward_number. This keeps the heat overlay, dots, Ward
// Health, and official pages perfectly consistent with where each report sits —
// and it self-corrects automatically if ward boundaries are ever updated.
function withWard(r) {
  if (r && r.lat != null && r.lng != null) {
    const w = detectWard(r.lat, r.lng);
    if (w) return { ...r, ward_number: w.wardNumber };
  }
  return r;
}

const ReportsContext = createContext({
  reports: [],
  loading: true,
  error: null,
  addReportOptimistic: () => {},
  refetch: () => {},
});

export function useReports() {
  return useContext(ReportsContext);
}

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracks whether we've ever been SUBSCRIBED, so a *re-subscribe* (after a
  // dropped websocket) triggers a catch-up refetch but the first one doesn't.
  const hasSubscribedRef = useRef(false);

  const fetchAll = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      console.error('[ReportsProvider] fetch failed:', err);
      setError(err.message);
    } else {
      setReports((data || []).map(withWard));
      setError(null);
    }
    setLoading(false);
  }, []);

  // Optimistic insert for the submitter — adds their own pin instantly.
  // Idempotent: Realtime will deliver the same row shortly; we dedupe by id.
  const addReportOptimistic = useCallback((report) => {
    if (!report?.id) return;
    const row = withWard(report);
    setReports((prev) => (prev.some((r) => r.id === row.id) ? prev : [row, ...prev]));
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('reports-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        if (!payload.new?.id) return;
        const row = withWard(payload.new);
        setReports((prev) => (prev.some((r) => r.id === row.id) ? prev : [row, ...prev]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, (payload) => {
        if (!payload.new?.id) return;
        const row = withWard(payload.new);
        setReports((prev) =>
          prev.some((r) => r.id === row.id)
            ? prev.map((r) => (r.id === row.id ? row : r))
            : [row, ...prev]
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reports' }, (payload) => {
        const id = payload.old?.id;
        if (!id) return;
        setReports((prev) => prev.filter((r) => r.id !== id));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Reconnect guard: if this is a re-subscribe (websocket dropped and
          // came back), refetch once to catch any events missed during the gap.
          if (hasSubscribedRef.current) {
            fetchAll();
          }
          hasSubscribedRef.current = true;
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return (
    <ReportsContext.Provider value={{ reports, loading, error, addReportOptimistic, refetch: fetchAll }}>
      {children}
    </ReportsContext.Provider>
  );
}
