'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      // Hook this up to a real endpoint (API route / Resend / Formspree).
      // For now, simulate success so the UI flow can be tested.
      await new Promise((r) => setTimeout(r, 600));
      setStatus('success');
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus('error');
    }
  };

  const disabled = status === 'submitting' || status === 'success';

  return (
    <form className="form-grid" onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="cf-first">First Name</label>
          <input
            className="form-input"
            id="cf-first"
            name="firstName"
            type="text"
            placeholder="First name"
            autoComplete="given-name"
            required
            disabled={disabled}
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="cf-last">Last Name</label>
          <input
            className="form-input"
            id="cf-last"
            name="lastName"
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="cf-email">Email Address</label>
        <input
          className="form-input"
          id="cf-email"
          name="email"
          type="email"
          placeholder="name@organisation.gov.in"
          autoComplete="email"
          required
          disabled={disabled}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="cf-org">Organisation</label>
        <input
          className="form-input"
          id="cf-org"
          name="organisation"
          type="text"
          placeholder="Ministry / Company / Unit"
          autoComplete="organization"
          required
          disabled={disabled}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="cf-type">Inquiry Type</label>
          <select
            className="form-select"
            id="cf-type"
            name="inquiryType"
            required
            defaultValue=""
            disabled={disabled}
          >
            <option value="" disabled>Select type</option>
            <option>Defence Procurement</option>
            <option>Government / Enterprise</option>
            <option>Agriculture / Civil</option>
            <option>Investment / Partnership</option>
            <option>Media / Press</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="cf-platform">Platform Interest</label>
          <select
            className="form-select"
            id="cf-platform"
            name="platform"
            defaultValue=""
            disabled={disabled}
          >
            <option value="">All platforms</option>
            <option>VAS-01 · Atlas Logistics</option>
            <option>VAS-02 · Atlas Ag</option>
            <option>VAS-03 · Ranger</option>
            <option>VAS-04 · Sentinel</option>
            <option>VAS-05 · Sentinel-M</option>
            <option>VAS-06 · Hornet Swarm</option>
            <option>Vortex Cloud GCS</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="cf-msg">Message</label>
        <textarea
          className="form-textarea"
          id="cf-msg"
          name="message"
          placeholder="Describe your requirement, timeline, and quantity if applicable."
          rows={5}
          disabled={disabled}
        />
      </div>

      <div className="form-check">
        <input id="cf-nda" name="nda" type="checkbox" disabled={disabled} />
        <label htmlFor="cf-nda">
          This inquiry involves classified information. I understand an NDA will be
          required before technical details are shared for restricted platforms
          (VAS-05 Sentinel-M, VAS-06 Hornet).
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={disabled}>
        {status === 'submitting' && 'Submitting…'}
        {status === 'success' && <>Inquiry received <span className="arr">✓</span></>}
        {(status === 'idle' || status === 'error') && (
          <>Submit Inquiry <span className="arr">→</span></>
        )}
      </button>

      <p className="form-meta" role="status" aria-live="polite">
        {status === 'success'
          ? 'We will be in touch within 48 hours (24h for defence inquiries).'
          : status === 'error'
          ? 'Something went wrong. Email info@vortexsystem.org directly.'
          : 'Response SLA · 48 hours — Defence inquiries · 24 hours'}
      </p>
    </form>
  );
}
