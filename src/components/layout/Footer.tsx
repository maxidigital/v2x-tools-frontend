import type { ReactNode } from 'react';

/** The FAQ and the changelog live with the docs (public/doc). */
export const FAQ_URL = '/doc/faq.html';
export const CHANGELOG_URL = '/doc/changelog.html';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function LegalLink({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger className="transition-colors hover:text-foreground">{title}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground [&_strong]:text-foreground [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Footer() {
  return (
    <footer className="flex min-h-9 shrink-0 py-1 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border px-4 text-xs text-muted-foreground">
      <span>
        © {new Date().getFullYear()} asn1click · a product of{' '}
        <a className="transition-colors hover:text-foreground" href="https://v2xnow.de" target="_blank" rel="noreferrer">
          v2xnow
        </a>
      </span>
      <span title="All services and data run in the European Union (Netherlands)">Hosted in the EU</span>
      <LegalLink title="Impressum">
        <p>
          <strong>Maximiliano Bottazzi</strong>
          <br />
          Lichtenrader Str. 47
          <br />
          12049 Berlin, Deutschland
        </p>
        <p>
          <strong>E-Mail:</strong> hello@v2xnow.de
          <br />
          <strong>Telefon:</strong> +49 176 78188784
        </p>
        <p>
          <strong>Verantwortlich nach § 55 Abs. 2 RStV:</strong>
          <br />
          Maximiliano Bottazzi, Lichtenrader Str. 47, 12049 Berlin
        </p>
        <p>
          <strong>Hinweis:</strong> Diese Website dient ausschließlich zu Informationszwecken und
          stellt derzeit kein kommerzielles Angebot dar.
        </p>
      </LegalLink>
      <LegalLink title="Privacy Policy">
        <p>
          <strong>Data Processing:</strong> V2X payloads are processed on our servers for decoding
          purposes only.
        </p>
        <p>
          <strong>What we do:</strong>
        </p>
        <ul>
          <li>Process submitted payloads to provide decoding results</li>
          <li>Temporarily store data in memory during processing</li>
          <li>Return decoded results to your browser</li>
        </ul>
        <p>
          <strong>What we don't do:</strong>
        </p>
        <ul>
          <li>Store payloads permanently on our servers</li>
          <li>Share data with third parties</li>
          <li>Use data for any purpose other than decoding</li>
          <li>Retain data after processing is complete</li>
        </ul>
        <p>
          <strong>AI chat (Ask):</strong> what you type in the chat, and the workspace content you attach to it,
          is sent to an AI provider (OpenAI) to produce the answer; it is not used to train models. Do not use the
          chat for confidential data: Convert and Generate never leave our servers.
        </p>
        <p>
          <strong>Analytics:</strong> anonymous usage events (e.g. "conversion failed" with its error message,
          which may quote a single field value), counted with Umami, which uses no cookies. No payloads.
        </p>
        <p>
          <strong>Cookies and browser storage:</strong> only what the service needs: your sign-in session and your
          preferences (e.g. the chat's output format). No tracking or advertising cookies.
        </p>
        <p>
          <strong>Security:</strong> Data transmission is encrypted via HTTPS. Processing occurs in
          isolated server environments. Contact: hello@v2xnow.de
        </p>
      </LegalLink>
      <LegalLink title="Terms of Use & Disclaimer">
        <p className="text-center font-bold text-destructive">USE AT YOUR OWN RISK</p>
        <p>This tool is provided "as is" without any warranties or guarantees.</p>
        <p>
          <strong>No liability:</strong>
        </p>
        <ul>
          <li>We are not responsible for any consequences arising from the use of decoded data</li>
          <li>Users assume full responsibility for decisions made based on our results</li>
          <li>No liability for damages, losses, or issues caused by using this service</li>
        </ul>
        <p>
          <strong>Accuracy:</strong> Decoding results may contain errors — always verify critical
          data independently. Not intended for safety-critical applications.
        </p>
        <p className="border-t border-border pt-2 text-center font-semibold">
          By using this website, you acknowledge and accept these terms.
        </p>
      </LegalLink>
      <a className="transition-colors hover:text-foreground" href="/contact.html">
        Contact
      </a>
      <a className="transition-colors hover:text-foreground" href="/doc/" target="_blank" rel="noreferrer">
        Docs
      </a>
      <a className="transition-colors hover:text-foreground" href={FAQ_URL} target="_blank" rel="noreferrer">
        FAQ
      </a>
      <a className="transition-colors hover:text-foreground" href={CHANGELOG_URL} target="_blank" rel="noreferrer">
        What's new
      </a>
    </footer>
  );
}
