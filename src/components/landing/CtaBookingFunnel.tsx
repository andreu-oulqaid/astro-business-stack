import Cal, { getCalApi } from '@calcom/embed-react';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getAttribution } from '@/scripts/attribution';

const CAL_NAMESPACE = 'auditoria';

function buildAttributionPayload() {
  const attr = getAttribution();
  return {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
    referrer: attr.referrer ?? null,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
  };
}

export type CtaFunnelLabels = {
  step1Title: string;
  nameLabel: string;
  namePlaceholder: string;
  step2Title: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phoneOptional: string;
  phonePlaceholder: string;
  honeypotLabel: string;
  next: string;
  back: string;
  step3Title: string;
  leadError: string;
  nameError: string;
  emailError: string;
  savingHint: string;
};

type CalConfig = NonNullable<ComponentProps<typeof Cal>['config']>;

export type CtaFunnelLocale = 'en' | 'es' | 'ca' | 'pl';

export interface CtaBookingFunnelProps {
  calLink: string;
  labels: CtaFunnelLabels;
  theme?: 'dark' | 'light';
  locale?: CtaFunnelLocale;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function CtaBookingFunnel({
  calLink,
  labels,
  theme = 'dark',
  locale,
}: CtaBookingFunnelProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [savingVisible, setSavingVisible] = useState(false);
  const redirected = useRef(false);
  const calendarViewSent = useRef(false);

  const leadRef = useRef<{
    name: string;
    email: string;
    phone: string;
    locale?: CtaFunnelLocale;
  }>({ name: '', email: '', phone: '', locale });

  useEffect(() => {
    leadRef.current = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      locale,
    };
  }, [name, email, phone, locale]);

  useEffect(() => {
    if (step === 2) {
      calendarViewSent.current = false;
    }
  }, [step]);

  const calConfig: CalConfig = {
    name: name.trim(),
    email: email.trim(),
  };

  useEffect(() => {
    if (step !== 3) return;

    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 0));
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;

      cal('ui', {
        theme,
        styles: {
          branding: {
            brandColor: '#000000',
          },
        },
      });

      cal('on', {
        action: 'bookingSuccessful',
        callback: (e) => {
          if (redirected.current) return;
          redirected.current = true;

          const lead = leadRef.current;
          if (lead.email) {
            const raw = e?.detail?.data?.date;
            let auditDate = new Date().toISOString();
            if (raw) {
              const parsed = new Date(raw);
              if (!Number.isNaN(parsed.getTime())) {
                auditDate = parsed.toISOString();
              }
            }
            const payload = JSON.stringify({
              name: lead.name,
              email: lead.email,
              phone: lead.phone || undefined,
              locale: lead.locale,
              auditDate,
              ...buildAttributionPayload(),
            });
            const blob = new Blob([payload], { type: 'application/json' });
            const beaconed =
              typeof navigator !== 'undefined' &&
              typeof navigator.sendBeacon === 'function' &&
              navigator.sendBeacon('/api/leads/confirm', blob);
            if (!beaconed) {
              void fetch('/api/leads/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
                body: payload,
              }).catch(() => {});
            }
          }

          window.location.href = '/gracias';
        },
      });
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [step, theme]);

  useEffect(() => {
    if (step !== 3) return;
    setSavingVisible(true);
    const timer = setTimeout(() => setSavingVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [step]);

  const goStep1 = useCallback(() => {
    setStep(1);
  }, []);

  const submitStep1 = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setFieldErrors({ name: labels.nameError });
      return;
    }
    setFieldErrors({});
    setStep(2);
  }, [name, labels.nameError]);

  const submitStep2 = useCallback(() => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setFieldErrors({ email: labels.emailError });
      return;
    }
    setFieldErrors({});

    void fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: name.trim(),
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        locale,
        company: honeypot,
        ...buildAttributionPayload(),
      }),
    }).catch(() => {
      // Swallowed: the calendar is already shown; lead processing is best-effort.
    });

    if (!calendarViewSent.current) {
      calendarViewSent.current = true;
      void fetch('/api/analytics/calendar-viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim() || undefined,
          locale,
          company: honeypot,
          ...buildAttributionPayload(),
        }),
      }).catch(() => {});
    }

    setStep(3);
  }, [email, honeypot, labels.emailError, locale, name, phone]);

  const isDark = theme === 'dark';
  const panelClass = isDark
    ? 'isolate relative z-0 mx-auto w-full max-w-lg rounded-2xl border border-zinc-700/80 bg-zinc-950 p-6 text-left shadow-xl shadow-black/40'
    : 'isolate relative z-0 mx-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-xl shadow-zinc-300/50';
  const progressInactiveClass = isDark ? 'bg-zinc-700' : 'bg-zinc-200';
  const titleClass = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const labelClass = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const optionalClass = 'text-zinc-500';
  const inputClass = isDark
    ? 'w-full rounded-lg border border-zinc-600 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-brand-500/0 transition-shadow focus:border-zinc-500 focus:ring-2 focus:ring-brand-500/30'
    : 'w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-brand-500/0 transition-shadow focus:border-zinc-400 focus:ring-2 focus:ring-brand-500/30';
  const backButtonClass = isDark
    ? 'text-sm font-medium text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline'
    : 'text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline';

  return (
    <div className={panelClass}>
      <div className="mb-4 flex gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-brand-500' : progressInactiveClass}`}
          />
        ))}
      </div>

      <div className="relative min-h-[12rem] overflow-hidden">
        {step === 1 && (
          <div className="animate-slide-up">
            <h3 className={`mb-3 font-display text-lg font-semibold ${titleClass}`}>{labels.step1Title}</h3>
            <label
              htmlFor="cta-name"
              className={`mb-1 block text-xs font-medium uppercase tracking-wide ${labelClass}`}
            >
              {labels.nameLabel}
            </label>
            <input
              id="cta-name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.namePlaceholder}
              className={inputClass}
            />
            {fieldErrors.name ? <p className="mt-2 text-sm text-red-400">{fieldErrors.name}</p> : null}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={submitStep1}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-400"
              >
                {labels.next}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h3 className={`mb-3 font-display text-lg font-semibold ${titleClass}`}>{labels.step2Title}</h3>
            <label
              htmlFor="cta-email"
              className={`mb-1 block text-xs font-medium uppercase tracking-wide ${labelClass}`}
            >
              {labels.emailLabel}
            </label>
            <input
              id="cta-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.emailPlaceholder}
              className={inputClass}
            />
            {fieldErrors.email ? <p className="mt-2 text-sm text-red-400">{fieldErrors.email}</p> : null}

            <label
              htmlFor="cta-phone"
              className={`mb-1 mt-4 block text-xs font-medium uppercase tracking-wide ${labelClass}`}
            >
              {labels.phoneLabel}{' '}
              <span className={`font-normal normal-case ${optionalClass}`}>({labels.phoneOptional})</span>
            </label>
            <input
              id="cta-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={labels.phonePlaceholder}
              className={inputClass}
            />

            <div className="pointer-events-none absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
              <label htmlFor="cta-company">{labels.honeypotLabel}</label>
              <input
                id="cta-company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goStep1}
                className={backButtonClass}
              >
                {labels.back}
              </button>
              <button
                type="button"
                onClick={submitStep2}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-400"
              >
                {labels.next}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <h3 className={`mb-3 font-display text-lg font-semibold ${titleClass}`}>{labels.step3Title}</h3>
            <p
              className={`mb-2 text-xs text-zinc-500 transition-opacity duration-500 ${savingVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-live="polite"
            >
              {labels.savingHint}
            </p>
            <div className="relative min-h-[min(32rem,70vh)] w-full max-w-full overflow-x-auto">
              <Cal
                calLink={calLink}
                namespace={CAL_NAMESPACE}
                config={calConfig}
                className="cal-embed min-h-[520px] w-full"
              />
            </div>
            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={backButtonClass}
              >
                {labels.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
