# Techstars Apply — SquadSpeak

Copy-paste answers for the Techstars application, based on repo materials (`README.md`, pitch deck, accelerator readiness plan, product website, customer discovery notes). Update placeholders marked **[TODO]** before submitting.

**Application flow (from Techstars):**
1. Founder Profile
2. Accelerator Application — Startup Details → Startup Team → Startup Progress → Startup Strategy → Connections & Referrals
3. Program Selection

---

## Step 1: Founder Profile

Complete in the Techstars portal with your personal LinkedIn, bio, and contact info. Suggested bio (adapt to field limits):

> Solo founder, Georgia Tech CS. Built SquadSpeak end-to-end—Electron frontend, FastAPI ML backend, real-time audio pipeline. Shipped v1.0.0 desktop app for offline, in-game voice translation. Previously led the project from prototype (April 2024) to commercial release; running customer discovery via CREATE-X CX Pre-Accelerator.

---

## Step 2: Accelerator Application

### Section 1 — Startup Details

| Field | Answer |
|-------|--------|
| **Startup name** | SquadSpeak |
| **Startup URL** | https://www.kickstarter.com/projects/sumukhdev/real-time-game-voice-translation |
| **What year was your company founded?** | 2024 |
| **Is your company incorporated?** | No, my company is not yet incorporated |
| **Russia / NK / Iran / Syria / Cuba / Venezuela / Crimea / Donetsk / Luhansk business?** | No |
| **Product demo video URL** | **[TODO]** — Record 90s screen capture per `docs/pitch/assets/demo_script_90s.md`; upload unlisted to YouTube |
| **Team introduction video URL (~2 min)** | **[TODO]** — Founder + any advisors; upload unlisted to YouTube |
| **Pitch deck (PDF)** | Upload `docs/pitch/assets/presentation.pdf` (max 10 MB) |

#### What problem are you looking to solve? * (500 characters max)

**Copy-paste (464 chars):**

```
Competitive PC gamers in global matchmaking (CS2, Valorant, Apex, Dota 2) queue with teammates who don't share their language. Voice callouts—rotations, positions, economy—get lost; ranked rounds are lost to coordination gaps, not skill. No major title ships native real-time voice translation. Workarounds (Discord bots, phone translators, pings) are too slow or clunky for sub-second competitive play. Players mute, type, or leave—hurting teamwork and retention.
```

#### What is your company going to make to solve this problem? * (500 characters max)

**Copy-paste (460 chars):**

```
SquadSpeak: a Windows desktop app that captures in-game voice chat, transcribes with Whisper, translates locally across 15+ languages, and shows live on-screen subtitles in under one second—fully offline after first-run model download. Optional bidirectional mode routes translated speech to teammates via virtual mic. Built for ranked play (Electron + FastAPI, WASAPI loopback). v1.0.0 shipped; one-time license ($7.99 launch / $12 regular) on itch.io and Gumroad.
```

#### Which vertical networks are relevant to your company? * (select up to 5)

Recommended selections (pick the closest labels Techstars shows):

1. **Gaming** (or Gaming & Esports)
2. **Artificial Intelligence / Machine Learning**
3. **Consumer**
4. **Entertainment & Media**
5. **Software** (or B2C Software)

*Rationale: voice AI for competitive gaming; consumer desktop product; esports/community GTM in deck.*

---

### Section 2 — Startup Team (draft answers)

Use these when you reach the team section. Adjust names/roles to match the live form.

| Typical field | Draft |
|---------------|-------|
| **Team size** | 1 (solo founder) |
| **Full-time on startup** | 1 |
| **Founder(s) background** | Sumukh Paspuleti — Georgia Tech CS; built full stack solo (Electron, React, FastAPI, Whisper, local translation models, WASAPI audio). Project lead since April 2024. |
| **Why this team** | Deep AI/ML + shipped product, not slideware. End-to-end ownership of capture → transcribe → translate → overlay pipeline. |
| **Co-founder / hiring** | Solo today; open to technical or GTM co-founder with gaming distribution experience. |
| **Location** | Atlanta, GA, United States (Georgia Tech) |
| **Commitment** | Ready to go full-time with accelerator support; CX Pre-Accelerator (CREATE-X) in progress. |

---

### Section 3 — Startup Progress (draft answers)

| Typical field | Draft |
|---------------|-------|
| **Stage** | Working product / early revenue |
| **What have you built?** | Shipped SquadSpeak v1.0.0 — Windows desktop app (Electron + FastAPI). Bidirectional real-time voice translation, 15+ languages, offline local AI, on-screen subtitles, virtual mic output. Installers in `dist/`. |
| **Users / traction** | 612K+ Reddit ad impressions, 2,214 clicks ($0.31 CPC); 6 waitlist signups; 2 Kickstarter backers. Customer discovery in progress (CX Pre-Accelerator). Beta cohort targeting 15 testers, 12–15 structured interviews. |
| **Revenue** | Pre-revenue / early: Kickstarter backers; launch price $7.99 one-time license (itch.io, Gumroad). |
| **Key metrics to highlight** | Working MVP; sub-second latency offline; 0.36% CTR on problem messaging; early paid interest. |
| **Biggest achievement** | Solo-built and shipped commercial desktop app with full offline voice translation stack—not a mockup. |
| **Biggest challenge** | Activation/setup UX (audio device config); moving from ad clicks to activated users in ranked matches. |

*Honesty note: discovery interviews to date are mostly screeners/non-ICP (`docs/pitch/interviews/set_2/`). Update traction numbers after beta cohort completes.*

---

### Section 4 — Startup Strategy (draft answers)

| Typical field | Draft |
|---------------|-------|
| **Target customer** | Competitive PC players (Valorant, CS2, Apex) in mixed-language ranked stacks; Windows; headset + in-game voice chat; weekly+ language friction. |
| **Market size** | 100M+ players in ranked, voice-enabled team games (CS2, Valorant, Apex, Dota 2); 500M+ PC gamers globally (deck slide 8). |
| **Business model** | One-time license $7.99–$12/user (no subscription); distributed via itch.io, Gumroad. Future: team/esports B2B licenses. |
| **Competition** | LiveTranslate, EzDubs (cloud, latency, privacy tradeoffs). SquadSpeak: offline, gamer-native overlay, lowest latency for in-match use. |
| **Moat** | Local inference stack, game-tuned UX, platform integration roadmap (Steam overlay, Discord). |
| **GTM** | Community beta (r/Valorant, r/GlobalOffensive), micro-creators, esports design partners; pause broad paid ads until activation funnel works. |
| **12-month vision** | 100K users path; esports org pilots; Discord/Steam integrations; improve activation to &lt;15 min median time-to-first-subtitle. |
| **Ask** | Mentorship scaling consumer software; cohort pressure-testing distribution; support to grow from early users to seed-ready ($500K target in readiness plan). |

---

### Section 5 — Connections & Referrals (draft)

| Field | Notes |
|-------|-------|
| **How did you hear about Techstars?** | **[TODO]** — e.g. CREATE-X network, founder referrals, program research |
| **Referral / alumni** | **[TODO]** — add any Techstars alumni or mentor intro |
| **Other accelerators** | CREATE-X CX Pre-Accelerator (Georgia Tech); applied/tracking YC F26 |

---

## Step 3: Program Selection

When choosing cohorts, prioritize programs aligned with **gaming + AI + consumer**:

- Techstars gaming / entertainment verticals (if offered)
- General Techstars cohorts with strong consumer or AI portfolios
- Any Atlanta or Southeast US–friendly programs if location matters

Apply as soon as the fall 2026 window opens (per `fall_2026_accelerator_readiness_cf0760a9.plan.md`).

---

## Pre-submit checklist

- [ ] Replace **[TODO]** demo video URL (90s, real product, no mock analytics)
- [ ] Replace **[TODO]** team video URL (~2 min)
- [ ] Confirm incorporation answer (incorporate before batch if required)
- [ ] Upload `docs/pitch/assets/presentation.pdf`
- [ ] Verify Kickstarter URL loads
- [ ] Update traction stats if beta cohort supersedes waitlist/backer numbers
- [ ] Press **Save & Continue** on each section after required fields are complete

---

## Source references in repo

| Asset | Path |
|-------|------|
| Pitch deck PDF | `docs/pitch/assets/presentation.pdf` |
| Deck outline | `docs/pitch/assets/presentation_text_outline.md` |
| Demo script (90s) | `docs/pitch/assets/demo_script_90s.md` |
| Video recording guide | `docs/guides/demo/video_recording_guide.md` |
| Product README | `README.md` |
| Landing / traction copy | `product-website/app/page.js` |
| Accelerator roadmap | `docs/pitch/accelerator/fall_2026_accelerator_readiness_cf0760a9.plan.md` |
| Competitive positioning | `docs/competitive/COMPETITIVE_GRADING_ASSESSMENT.md` |
| Kickstarter copy | `docs/marketing/KICKSTARTER_PROJECT_OVERVIEW.md` |

---

*Last updated: June 2026 — align with latest traction before submit.*
