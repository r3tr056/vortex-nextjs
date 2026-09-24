'use client';

import { useState } from 'react';
import { ArrowUpRight, Camera, Check, MessageCircle, Phone, X } from 'lucide-react';
import { CONTACT, type ArDrone } from '../config/drones';
import type { ArController } from '../controller';
import styles from './ar.module.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function Attribution() {
  return (
    <p className={styles.attribution}>
      AR engine: 8th Wall by Niantic Spatial, Inc. © 2026 Niantic Spatial, Inc. Used under the{' '}
      <a href="/xr8/LICENSE" target="_blank" rel="noreferrer">
        XR Engine License Agreement
      </a>
      , provided “as is” without warranties. Vortex is not affiliated with or endorsed by Niantic Spatial.
    </p>
  );
}

function LeadForm({ drone, ctrl }: { drone: ArDrone; ctrl: ArController }) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('submitting');
    setMessage(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, interest: `${drone.num} · ${drone.name}`, source: `ar-${drone.slug}` }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'failed');
      setStatus('success');
      ctrl.trackLead(true);
      form.reset();
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message === 'invalid' ? 'Please check your name, organisation and email.' : null);
      ctrl.trackLead(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.success}>
        <span className={styles.eyebrowAccent}>
          <Check size={12} /> Request received
        </span>
        <p className={styles.statusBody} style={{ textAlign: 'left' }}>
          Thanks — the Vortex team will reach out to set up a {drone.name} demo. If you’re at the booth, say hello.
        </p>
      </div>
    );
  }

  const disabled = status === 'submitting';
  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor="ar-name">Name</label>
        <input id="ar-name" className={styles.input} name="name" autoComplete="name" required maxLength={120} disabled={disabled} />
      </div>
      <div className={styles.field}>
        <label htmlFor="ar-org">Organisation</label>
        <input id="ar-org" className={styles.input} name="organisation" autoComplete="organization" required maxLength={160} disabled={disabled} />
      </div>
      <div className={styles.field}>
        <label htmlFor="ar-email">Email</label>
        <input id="ar-email" className={styles.input} name="email" type="email" autoComplete="email" required maxLength={160} disabled={disabled} />
      </div>
      <div className={styles.field}>
        <label htmlFor="ar-phone">Phone (optional)</label>
        <input id="ar-phone" className={styles.input} name="phone" type="tel" autoComplete="tel" maxLength={40} disabled={disabled} />
      </div>
      {/* Honeypot: real visitors never see or fill this. */}
      <input className={styles.honeypot} name="fax_extension" tabIndex={-1} autoComplete="off" aria-hidden />
      {status === 'error' && (
        <p className={styles.formError} role="alert">
          {message ?? 'Couldn’t send right now.'} You can also message us on WhatsApp or email {CONTACT.email}.
        </p>
      )}
      <button className={styles.primaryBtn} type="submit" disabled={disabled}>
        {disabled ? 'Sending…' : 'Book a demo'}
      </button>
      <p className={styles.formNote}>We only use these details to contact you about Vortex systems.</p>
    </form>
  );
}

export function CtaSheet({ drone, ctrl }: { drone: ArDrone; ctrl: ArController }) {
  const wa = `https://wa.me/${CONTACT.phone.replace('+', '')}?text=${encodeURIComponent(
    `Hi Vortex team — I just flew the ${drone.name} (${drone.num}) in AR and would like to know more.`,
  )}`;

  // Close the sheet so it isn't in the way, then shoot. Progress shows as a HUD toast.
  const takePhoto = () => {
    ctrl.setCtaOpen(false);
    window.setTimeout(() => void ctrl.capturePhoto(), 450);
  };

  return (
    <>
      <div className={styles.scrim} onClick={() => ctrl.setCtaOpen(false)} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="cta-title">
        <div className={styles.grabber} />
        <div className={styles.sheetHead}>
          <div>
            <span className={styles.eyebrowAccent}>
              {drone.num} · {drone.name}
            </span>
            <h2 id="cta-title" className={styles.sheetTitle}>
              See it fly for real
            </h2>
          </div>
          <button className={styles.iconBtn} onClick={() => ctrl.setCtaOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.quickGrid}>
          <a className={styles.quick} href={wa} target="_blank" rel="noreferrer" onClick={() => ctrl.trackCta('whatsapp')}>
            <MessageCircle size={18} className={styles.quickIcon} />
            <strong>WhatsApp</strong>
            <span>Chat with the team</span>
          </a>
          <a className={styles.quick} href={`tel:${CONTACT.phone}`} onClick={() => ctrl.trackCta('call')}>
            <Phone size={18} className={styles.quickIcon} />
            <strong>Call</strong>
            <span>{CONTACT.phoneDisplay}</span>
          </a>
          <a className={styles.quick} href={drone.systemPath} onClick={() => ctrl.trackCta('system_page')}>
            <ArrowUpRight size={18} className={styles.quickIcon} />
            <strong>Full specs</strong>
            <span>{drone.name} system page</span>
          </a>
          <button className={styles.quick} onClick={takePhoto}>
            <Camera size={18} className={styles.quickIcon} />
            <strong>Photo</strong>
            <span>Save &amp; share this moment</span>
          </button>
        </div>

        <span className={styles.eyebrow}>Book a demo</span>
        <div style={{ height: 8 }} />
        <LeadForm drone={drone} ctrl={ctrl} />
        <div style={{ height: 14 }} />
        <Attribution />
      </div>
    </>
  );
}
