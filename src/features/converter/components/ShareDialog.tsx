import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { buildHtml, buildCsv } from '@/lib/export';
import { shareEmail, HubError } from '@/services/hubClient';
import type { ResultTab } from '@/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabs: ResultTab[];
}

export function ShareDialog({ open, onOpenChange, tabs }: ShareDialogProps) {
  const [email, setEmail] = useLocalStorage('v2x-last-email', '');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!EMAIL_RE.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (tabs.length === 0) return;
    setSending(true);
    try {
      await shareEmail({
        recipientEmail: email,
        htmlContent: buildHtml(tabs),
        csvContent: buildCsv(tabs),
        subject: `asn1click conversion (${tabs.length} result${tabs.length > 1 ? 's' : ''})`,
        message: 'Shared from asn1click',
      });
      toast.success('Email sent');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof HubError ? err.message : 'Could not send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share conversion</DialogTitle>
          <DialogDescription>
            Send {tabs.length} result{tabs.length === 1 ? '' : 's'} as HTML + CSV by email.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="email"
          placeholder="recipient@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={send} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
