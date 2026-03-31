import { getVerifyPageState, resolveVerificationStatus, type VerificationStatus } from '@/lib/verify-email-state';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

type VerifyEmailSearch = {
  token?: string;
  status?: string;
};

export const Route = createFileRoute('/_public/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    status: typeof search.status === 'string' ? search.status : undefined
  }),
  component: VerifyEmailPage
});

function VerifyEmailPage() {
  const search = Route.useSearch();
  const [status, setStatus] = useState<VerificationStatus>('idle');

  useEffect(() => {
    const token = search.token;

    if (!token) {
      setStatus('idle');
      return;
    }

    let active = true;

    const verify = async () => {
      setStatus('loading');

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include'
        });

        const payload = await response.json().catch(() => null);
        console.log('🚀 ~ verify ~ payload:', payload);

        if (!active) return;
        const resolvedStatus = resolveVerificationStatus(response.ok, payload?.code);
        console.log('🚀 ~ verify ~ resolvedStatus:', resolvedStatus);

        setStatus(resolvedStatus);
      } catch (error) {
        console.error('🚨 verify-email fetch error:', error);
        if (!active) return;
        setStatus('invalid');
      }
    };

    void verify();

    return () => {
      active = false;
    };
  }, [search.token]);

  const pageState = useMemo(
    () => getVerifyPageState(status, !!search.token, search.status),
    [search.status, search.token, status]
  );

  const toneClasses =
    pageState.tone === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : pageState.tone === 'error'
        ? 'border-red-500/30 bg-red-500/10 text-red-300'
        : 'border-amber-500/30 bg-amber-500/10 text-amber-300';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div
          className={`mb-6 inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${toneClasses}`}
        >
          Email verification
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-foreground">{pageState.title}</h1>
          <p className="text-sm leading-7 text-muted">{pageState.body}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="laughtrack://"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Open app
          </a>
        </div>
      </div>
    </div>
  );
}
