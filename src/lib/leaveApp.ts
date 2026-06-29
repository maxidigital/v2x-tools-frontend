import { allowNavigation } from '@/hooks/useReloadGuard';
import { snapshotConverter } from '@/stores/useConverterStore';

/**
 * Navigate away on purpose (login / logout / external tool). Skips the unsaved-work "Leave site?" warning,
 * and — for round-trips that return to this app (login) — optionally snapshots the converter work (open
 * tabs) so it's restored when we come back. Use `preserve: true` only for navigations that land back on
 * v2x.tools.
 */
export function leaveApp(url: string, opts: { preserve?: boolean } = {}) {
  if (opts.preserve) snapshotConverter();
  allowNavigation();
  window.location.assign(url);
}
