# Vortex Booth AR — Build Brief

Status (2026-09-25): built on native AR (ARCore via WebXR on Android, 8th Wall + AR Quick Look on iPhone), verified in the phone-sized 3D stand-in; production build and 20 unit tests pass. Remaining: on-phone test at the booth, Google Sheet env vars, deploy, point the QR codes.

## What it is

Visitors scan the qrfy dynamic QR on a drone standee → a page on vortexsystem.org opens → the phone camera recognises the **standee artwork** and anchors an AR scene to the physical booth. The real stall is the set; we add drones, holographic callouts, and marketing on top of it. We do **not** rebuild the stall in 3D.

Two drones, one standee each:

| Drone | Route | Standee QR target |
|---|---|---|
| Sentinel (VAS-04) | `/ar/sentinel` | Sentinel roll-up standee |
| Ranger (VAS-03) | `/ar/ranger` | Ranger roll-up standee (left side of the booth) |

Until the AR is live, point the QR codes at `/systems/vas04` and `/systems/vas03`.

## Locked decisions

| Area | Decision |
|---|---|
| AR engines (best native AR first) | **Android + ARCore → WebXR** `immersive-ar`: ARCore tracking, hit-test, anchors, light estimation with reflections, depth occlusion, DOM overlay HUD, camera access. **iPhone → 8th Wall** (self-hosted, free) for the interactive experience, plus **AR Quick Look** (native ARKit: people occlusion, true scale, native capture) built on-device from the same GLB, with a "Book a demo" banner. **Desktop / no camera → 3D preview.** If ARCore refuses to start, 8th Wall takes over automatically. |
| Anchoring to the booth | Android: the standee's **QR code** read from the ARCore camera feed (BarcodeDetector) → metric pose from its corners → native anchor. iPhone: **three image targets per standee** (upper artwork, lower spec panel, close-range spec+QR crop) — any one is enough. |
| Resilience (glare, blur, people) | Consensus filter: locks only when several detections agree, rejects outliers (glare/misreads), re-locks only on sustained disagreement. Plausibility checks (upright, 0.2–6 m, right physical size). Rotating hints (glare, distance, light). **Manual fallback after 6 s**: aim the ring at the standee's base (uses native floor detection) or "not at the booth" floor placement. Re-align button always available. |
| Why not WebXR image tracking | Still behind `chrome://flags/#webxr-incubations`; the QR + camera-access route works unflagged. |
| Renderer | Plain three.js inside a client-only Next.js route (8th Wall owns the render loop); React for the DOM HUD. |
| Flow | Anchor → ~40 s ad sequence (Skip always visible) → **Explore** (drone hovers at chest height with 5 tappable hotspots on its real parts; each plays a live demo + spec card from the standee) → joystick flight → mini-mission → CTA. |
| Controls | Dual sticks, Mode 2 (left: throttle/yaw, right: pitch/roll), auto-hover when released. |
| Mission | One per drone (see scripts). ~60 s. |
| CTA | Book-a-demo form + WhatsApp + Call + system page + photo-to-share. |
| WhatsApp / call | +91 98737 17711 |
| Leads | Google Sheet via Apps Script web app. Same endpoint also fixes the site's `ContactForm` (currently a placeholder that sends nothing). |
| Analytics | Anonymous funnel events (scan → anchored → ad complete → flew → mission complete → lead) to a second tab of the lead sheet. |
| Audio / haptics | Procedural rotor SFX + UI ticks (no downloads), mute toggle, resumes after app switches. Haptics on locks and mission complete (Android). |
| Lighting | ARCore light estimate + reflection map (Android); 8th Wall exposure + colour temperature (iPhone). |
| Photos | Camera + drone composited on-device (ARCore camera access / 8th Wall canvas), branded, shared via the native share sheet. |
| Caching | Fix `vercel.json`: `immutable` 1-year cache currently applies to HTML too; restrict to static assets so fixes reach phones during the show. |

## Asset pipeline (done)

Raw Meshy exports + standee print files live in `3d_models/` (git-ignored, ~175 MB).

**Models** — `npm run ar:model -- 3d_models/Sentinel.glb public/ar-assets/models/sentinel.glb --diagonal 0.95 --nose=-x`
(Ranger: `--diagonal 0.85 --ratio 0.07 --error 0.003`). The script rotates the nose to +Z, finds the four 2-blade props,
cuts the blades out (animated props replace them at `prop_N` anchors), scales to the real motor diagonal, simplifies,
and compresses (meshopt + WebP textures).

| Model | Raw | Shipped | Height at real diagonal |
|---|---|---|---|
| Sentinel | 38.6 MB · 604k tris · 4K textures | **0.96 MB** · 63k tris | 413 mm (spec ~500 mm) |
| Ranger | 47 MB · 942k tris · 4K textures | **0.81 MB** · 63k tris | 446 mm (spec 300 mm — Meshy legs are too long) |

**Image targets** — `node scripts/build-image-targets.mjs`. Each 75 cm-wide print gives the physical scale (12.69 px/cm).
Two non-overlapping full-width 3:4 targets per standee, 0.75 × 1.00 m each: *upper* (logo, render, name; centre ≈ 1.39–1.44 m)
and *lower* (spec table + QR; centre 0.50 m). Assumes the print's bottom edge sits at the floor (the extra 9–14 cm beyond
180 cm is in the cassette) — adjust `PRINT_BOTTOM_M` if the drone floats or sinks at the booth.

**First load on 4G:** engine ≈ 2.2 MB gzipped (core + SLAM) + drone ≈ 1 MB + targets ≈ 0.25 MB. The engine and model start
downloading while the visitor reads the intro screen.

## Ad sequence scripts (draft — for approval)

### Sentinel — "Eyes above 5,000 m" (~40 s)
1. **Lock** (0–4 s): lime scan line sweeps the standee; HUD tag `SENTINEL · VAS-04` locks on.
2. **Deploy** (4–10 s): drone resolves wireframe → solid at the standee base, props spin up, vertical take-off. Callout: *Man-portable · rapid deploy*.
3. **Climb** (10–18 s): altitude counter runs up to **5,000 m+**; *Ladakh-class ceilings*.
4. **Track** (18–28 s): gimbal cone projects onto the floor; three holographic ground targets appear and get classified with AI boxes. Callout: *Onboard AI target tracking — no ground-station dependency*.
5. **Deny** (28–35 s): GNSS icon struck through, `GPS DENIED`; drone holds course. Callouts: *GPS-denied navigation · Low-signature*.
6. **Handover** (35–40 s): drone returns to hover in front of the visitor → "Your turn".

**Mission — Lock-on:** three targets hidden around the booth. Fly the camera cone over each and hold 2 s to lock. Timer + result card → CTA.

### Ranger — "Map it. Twin it." (~40 s)
1. **Lock** (0–4 s): scan sweep; HUD tag `RANGER · VAS-03`.
2. **Launch** (4–10 s): take-off. Callout: *Long-endurance mapping & persistent ISR*.
3. **Survey** (10–20 s): lawnmower pass in front of the booth; the floor paints into a survey tile grid as it flies. Callout: *RGB / multispectral / LiDAR → survey-grade maps*.
4. **Twin** (20–30 s): a miniature terrain digital twin rises out of the grid. Callout: *Vortex Enterprise — digital twin & geospatial intelligence*.
5. **Fleet** (30–35 s): two ghost drones join in formation. Callout: *Multi-fleet coordination · Vortex FlightControl · tethered option*.
6. **Handover** (35–40 s): "Your turn".

**Mission — Survey the zone:** paint a 2.7 × 1.2 m floor grid to 90% in 60 s. Cells only count on steady passes under 1 m/s at 0.5–2.6 m altitude (a first playtest mapped it in 9 s, so it now rewards careful flying) → coverage % result card → CTA.

## Go-live checklist

- [x] Meshy exports, dimensions (Sentinel 950 mm / Ranger 850 mm diagonal), standee prints (75 × 180 cm), specs, Sentinel 5,000 m+
- [ ] **Google Sheet** — follow [docs/google-apps-script/README.md](google-apps-script/README.md); add `LEADS_WEBHOOK_URL` + `LEADS_WEBHOOK_SECRET` on Vercel. Until then the demo form shows a "use WhatsApp/email" fallback in production.
- [ ] **Deploy**, then test on one iPhone and one Android at the booth: standee lock from ~1.5–2.5 m, drone sits on the floor, sticks feel right.
- [ ] **QR codes** (qrfy): `https://vortexsystem.org/ar/sentinel?src=booth-qr` and `https://vortexsystem.org/ar/ranger?src=booth-qr`.
- [ ] Optional: a straight-on phone photo of each standee under hall lighting, to check recognition against glare.

## Explore hotspots

| # | Sentinel | Ranger |
|---|---|---|
| 1 | Onboard AI tracking — target appears and locks | RGB · Multispectral · LiDAR — drone sweeps and maps a floor patch |
| 2 | Built for thin air (5,000 m+) — full-thrust spool-up | High-endurance — spool-up |
| 3 | Man-portable airframe — X-ray scan | Vortex FlightControl — X-ray scan |
| 4 | GPS-denied navigation — VIO feature points, GNSS jammed | Multi-fleet coordination — wingmen join |
| 5 | Low-signature — drone fades out and quietens | Tethered option — tether to a ground unit |

Content lives in `src/ar/config/drones.ts` (`hotspots`).

## Real-device test checklist (do this at the booth after deploying)

- [ ] **Android (Chrome)**: Launch AR → Chrome's AR permission → point at the QR on the standee → lock in 1–3 s. Drone sits on the floor; walk behind the standee — the drone should be hidden by it (depth occlusion, on supported phones).
- [ ] **iPhone (Safari)**: Launch AR → camera + motion prompts → point at the standee (whole poster or spec panel) → lock. Also try "Place in your space · native AR" (Quick Look) from the intro.
- [ ] Glare test: stand where the spotlights reflect on the print; it should still lock (or offer manual placement after 6 s).
- [ ] Explore: tap all five hotspots; Fly it; run the mission; submit the demo form; take a photo.
- [ ] Landscape and a small phone (SE/mini) — HUD must not cover the drone.
- [ ] Debug: add `?mode=3d` to force the phone UI onto the 3D stand-in (e.g. for demoing on a phone without camera access).

## Testing on a phone before deploying

Camera access needs HTTPS. Either push a Vercel preview deployment, or run `npx next dev --experimental-https`
and open the `Network` URL on a phone on the same Wi-Fi (accept the self-signed certificate). Desktop browsers
get the 3D preview automatically (keyboard: W/S climb, A/D turn, arrows move).

## Risks

- 8th Wall is community-maintained now with a closed SLAM binary; no vendor support. Mitigation: prove it on a current iPhone and a mid-range Android first; MindAR backup.
- First load is several MB (engine + model). Hall networks are often poor; keep models lean, show a progress screen, and cache aggressively.
- Glossy standee under spotlights can defeat image recognition. Test against the real photos; crop targets to high-texture regions (drone image + title), away from glare.
- Meshy geometry is fused and approximate; thin carbon arms may be lumpy. Acceptable at phone scale; props are replaced procedurally.
