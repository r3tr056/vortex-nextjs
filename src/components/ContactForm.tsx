'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">First Name</label>
          <input className="form-input" type="text" placeholder="Arjun" required />
        </div>
        <div className="form-field">
          <label className="form-label">Last Name</label>
          <input className="form-input" type="text" placeholder="Sharma" required />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Email Address</label>
        <input className="form-input" type="email" placeholder="you@organisation.gov.in" required />
      </div>

      <div className="form-field">
        <label className="form-label">Organisation</label>
        <input className="form-input" type="text" placeholder="Ministry / Company / Unit" required />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Inquiry Type</label>
          <select className="form-select" required defaultValue="">
            <option value="" disabled>Select type</option>
            <option>Defense Procurement</option>
            <option>Government / Enterprise</option>
            <option>Agriculture / Civil</option>
            <option>Investment / Partnership</option>
            <option>Media / Press</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Platform Interest</label>
          <select className="form-select" defaultValue="">
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
        <label className="form-label">Message</label>
        <textarea
          className="form-textarea"
          placeholder="Describe your requirement, timeline, and quantity if applicable..."
          rows={5}
        />
      </div>

      <div className="form-check">
        <input type="checkbox" id="nda" />
        <label htmlFor="nda">
          This inquiry involves classified information. I understand an NDA will be required before technical details are shared for restricted platforms (VAS-05 · Sentinel-M, VAS-06 · Hornet).
        </label>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={submitted}
        style={submitted ? {
          background: '#2a3a1a',
          color: 'var(--green)',
          cursor: 'default',
          border: 'none',
        } : {}}
      >
        {submitted ? (
          'Submitted ✓'
        ) : (
          <>Submit Inquiry <span className="arr">→</span></>
        )}
      </button>

      {!submitted && (
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: -8 }}>
          Response SLA: 48 hours · Defense inquiries: 24 hours
        </p>
      )}
    </form>
  );
}
