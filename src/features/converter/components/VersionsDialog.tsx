import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Layers, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  clearMessageDefault,
  HubError,
  messageVersions,
  setMessageDefault,
} from '@/services/hubClient';
import type { MessageVersionRow } from '@/types';

const PUBLIC = '__public__';

/** "2:2" → "protocolVersion 2 · messageId 2". */
function identityLabel(identity: string): string {
  const [pv, mid] = identity.split(':');
  return `protocolVersion ${pv} · messageId ${mid}`;
}

const SHORT: Record<string, string> = { CollectivePerceptionMessage: 'CPM' };

/** The message type, from the versions' root element (CAM, DENM, …). */
function typeOf(row: MessageVersionRow): string {
  const roots = Array.from(new Set(row.versions.map((v) => SHORT[v.rootElement] ?? v.rootElement)));
  return roots.join(' / ');
}

/** By protocolVersion, then messageId (numeric). */
function byIdentity(a: MessageVersionRow, b: MessageVersionRow): number {
  const [pa, ma] = a.identity.split(':').map(Number);
  const [pb, mb] = b.identity.split(':').map(Number);
  return pa - pb || ma - mb;
}

/**
 * Which definition auto-detect uses for each V2X header identity, and — for a logged-in user — the choice of
 * their own (only theirs changes; the public default stays). Anonymous users see the table read-only.
 */
export function VersionsDialog() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<MessageVersionRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      setRows((await messageVersions()).sort(byIdentity));
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : 'Could not load the versions');
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open, user?.id]);

  const choose = async (row: MessageVersionRow, value: string) => {
    setBusy(row.identity);
    try {
      if (value === PUBLIC) await clearMessageDefault(row.identity);
      else await setMessageDefault(row.identity, value);
      await load();
      toast.success(`${typeOf(row)}: auto-detect now uses ${value === PUBLIC ? 'the public default' : value}`);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : 'Could not change the default');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Message versions used by auto-detect">
          <Layers className="h-4 w-4" /> <span className="hidden sm:inline">Versions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Message versions</DialogTitle>
          <DialogDescription>
            Without a ref, a payload is decoded with the definition chosen for its header
            (protocolVersion + messageId). The public default is the newest version.
            {user
              ? ' You can pick your own per message type: only your account changes.'
              : ' Log in to pick your own per message type.'}
          </DialogDescription>
        </DialogHeader>

        {!rows ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Message</th>
                <th className="py-2 pr-3 font-medium">Header</th>
                <th className="py-2 font-medium">Auto-detect uses</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.identity} className="border-b border-border/60 align-middle">
                  <td className="py-2 pr-3 font-medium">{typeOf(row)}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                    {identityLabel(row.identity)}
                  </td>
                  <td className="py-2">
                    {user && row.versions.length > 1 ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={row.userDefault ?? PUBLIC}
                          onValueChange={(v) => choose(row, v)}
                          disabled={busy === row.identity}
                        >
                          <SelectTrigger className="h-8 w-[220px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PUBLIC} className="text-xs">
                              Public default ({row.publicDefault ?? '—'})
                            </SelectItem>
                            {row.versions.map((v) => (
                              <SelectItem key={v.name} value={v.name} className="font-mono text-xs" title={v.description}>
                                {v.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {busy === row.identity && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    ) : (
                      <span className="font-mono text-xs">
                        {row.effective ?? '—'}
                        {row.versions.length > 1 && (
                          <span className="text-muted-foreground">
                            {' '}
                            (also: {row.versions.filter((v) => v.name !== row.effective).map((v) => v.name).join(', ')})
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}
