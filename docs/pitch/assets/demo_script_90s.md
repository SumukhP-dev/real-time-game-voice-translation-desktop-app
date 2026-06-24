# SquadSpeak — 90-Second Demo (Production Run Sheet)

**Goal:** 1 unlisted YouTube URL, **≤90 seconds**  
**Prompt:** *What is it, why did you build it, and how?*  
**One line:** SquadSpeak turns in-game voice into live translated subtitles — offline, under a second, for ranked PC games.

---

## Fast path (do this order)

1. **Prep** (15 min) — checklist below  
2. **Record clips** (30 min) — 6 short clips, no VO needed yet (see [Clips to capture](#clips-to-capture))  
3. **Record VO** (10 min) — read [Teleprompter](#teleprompter) once or twice in OBS/phone  
4. **Edit** (45 min) — drop clips on timeline, lay VO, add end card  
5. **Upload** — unlisted YouTube, paste URL in form

**Tip:** Record clips first, VO second. You can trim dead air in the demo beats; VO timing is easier when you already have visuals.

---

## Prep checklist

- [ ] SquadSpeak + ML backend running; subtitles work on a test MP3
- [ ] Valorant or CS2 in **windowed** mode behind the overlay
- [ ] `demo_callouts_combined.mp3` ready (**5s lead-in**, **10s gaps** between callouts)
- [ ] OBS or screen recorder: **1920×1080**, 30fps
- [ ] Mic for VO (or phone voice memo)
- [ ] End card image or simple text slide ready

**Don't show:** mock analytics, fake user counts, IBM/watsonx branding.

---

## Master timeline (edit to this)

| Time | Clip | On screen | Audio |
|------|------|-----------|-------|
| **0:00–0:12** | A — Problem | Ranked gameplay, **no** subtitles. Text overlay: *Missed callout. Lost round.* | VO block 1 |
| **0:12–0:22** | B — App | Launch SquadSpeak; game + overlay visible. Quick flash: Audio settings → loopback device (1–2s). | VO block 2 |
| **0:22–0:45** | C — Proof | Capture on. Play **`demo_callouts_combined.mp3`** once (3 Spanish callouts — **no Rush B**). Best single test: **`04_last_site.mp3`** (*Último en sitio* → *Last on site*). | *"Spanish in, English on screen."* |
| **0:55–1:08** | D — Credibility | Wide: game + overlay. Bullets: **Offline · local AI** · **Valorant / CS2 / Apex** · **v1.0 shipped** | VO block 3 |
| **1:08–1:22** | E — End card | Logo, tagline, Windows v1.0.0, contact URL | VO block 4 |

*Proof audio is ~35s (5s lead-in + ~8s speech + ~21s gaps). Pre-start SquadSpeak before playback. Trim in edit to ~20s if needed.*

*VO is ~125 words (~50s). Hard cap: trim end card or credibility if over 90s.*

---

## Clips to capture

Record each as a **separate file** — no need for one continuous take.

| Clip | What to do | Length to capture |
|------|------------|-------------------|
| **A** | Ranked game running. Play one Spanish MP3 **without** SquadSpeak (or hide overlay). Add text in editor. | ~12s |
| **B** | Open SquadSpeak from desktop. Show game behind overlay. Open Settings → pick WASAPI loopback → close. | ~10s |
| **C** | Capture on. VLC → **`demo_callouts_combined.mp3`** once (Last on site → Planting → Rotate). **One-callout cut:** play **`04_last_site.mp3`** only. | ~35s or ~8s |
| **D** | Wide: game + overlay + bullet text (add bullets in editor if easier). | ~13s |
| **E** | End card (Canva, PowerPoint export, or text in editor). | ~13s |

**MP3 playback:** VLC → system output → WASAPI loopback → SquadSpeak captures it (same as real in-game voice).

---

## Teleprompter

Read at a natural pace. Pause during Proof clips (C, D) — those can be mostly silent.

```
I play ranked with randoms who don't speak my language. A teammate calls the rotate in Spanish — I miss it, we lose the round, and it's not a skill gap. It's a comms gap. I built SquadSpeak because that shouldn't decide ranked games.

SquadSpeak is a Windows desktop app. It captures in-game voice from your audio output, runs Whisper and local translation on your PC — no cloud — and paints live subtitles on screen during the match.

Spanish in, English on screen.

Discord bots and phone translators are too slow for a one-second callout. SquadSpeak is built for ranked: offline, low latency, and on your machine. I shipped v1.0 solo — Electron, FastAPI, and a real audio pipeline — and I'm validating with competitive players through Georgia Tech's CREATE-X program.

If you queue ranked in mixed-language lobbies, I'd love your feedback. SquadSpeak — break the language barrier, one callout at a time.
```

---

## Audio files

### Combined file (use this when recording)

Play **`demo_callouts_combined.mp3`** once in VLC. **Excludes Rush B** — gaming slang looks the same in both languages.

| File | Spanish | English subtitle | Good for demo? |
|------|---------|------------------|----------------|
| `02_planting.mp3` | ¡Plantan! | Planting | ✓ |
| `03_rotate.mp3` | ¡Rotar, rotar! | Rotate | ✓ |
| `04_last_site.mp3` | ¡Último en sitio! | Last on site | ✓ **best single clip** |
| `01_rush_b.mp3` | ¡Rush B! | Rush B! | ✗ skip — reads as English |

| Part | Duration |
|------|----------|
| Lead-in | **5s** |
| 3 callouts | ~6s speech |
| Gaps (2 × 10s) | **20s** |
| **Total** | **~32s** |

**Single-callout proof (simplest):** `04_last_site.mp3` — clearly Spanish → English.

Rebuild:

```powershell
python scripts/combine_demo_callouts.py
# include Rush B (not recommended for pitch):  python scripts/combine_demo_callouts.py --include-rush-b
```

### Individual files

| File | Say this | Subtitle should read |
|------|----------|----------------------|
| `02_planting.mp3` | ¡Plantan! | Planting |
| `03_rotate.mp3` | ¡Rotar, rotar! | Rotate |
| `04_last_site.mp3` | ¡Último en sitio! | Last on site |
| `01_rush_b.mp3` | ¡Rush B! | Rush B! *(spare — poor translation demo)* |

Generate fresh clips:

```powershell
pip install edge-tts imageio-ffmpeg
python scripts/generate_demo_callouts.py
```

### ElevenLabs one-shot split

```powershell
python scripts/split_elevenlabs_demo.py "ElevenLabs_....mp3"
python scripts/combine_demo_callouts.py
```

---

## End card (copy-paste)

```
SquadSpeak
Real-time voice translation for competitive PC gaming
Windows · v1.0.0
sumukhdev [Kickstarter / itch.io / site URL]
Sumukh Paspuleti · Georgia Tech
```

---

## Upload

- [ ] Duration ≤ 90s
- [ ] **Unlisted** on YouTube
- [ ] Title: `SquadSpeak — 90s Demo (Real-time ranked voice subtitles)`
- [ ] Description: 2 sentences (problem + waitlist link)
- [ ] URL → accelerator form / `docs/pitch/accelerator/techstars_apply.md`

---

## Appendix

### What the video must answer

| Question | Covered in |
|----------|------------|
| What is it? | Clip B + C/D |
| Why build it? | Clip A + VO block 1 |
| How? | Clip B + VO block 2 + E |

### Cover notes (paste when sharing)

**Players:** Ranked PC players: live subtitles from in-game voice, offline. Feedback welcome if you play Valorant/CS2 in mixed-language lobbies.

**Investors / accelerators:** Shipped v1.0 Windows app — offline in-game voice → subtitles for competitive gaming. Solo-built; structured customer discovery. [URL]

**Form paste:**  
**What:** Offline real-time voice → on-screen subtitles for ranked PC games.  
**Why:** Mixed-language callouts cost rounds; existing tools are too slow in-match.  
**How:** Electron + FastAPI: WASAPI capture → Whisper → local translation → overlay. v1.0.0 shipped.

### Related

- `docs/pitch/accelerator/techstars_apply.md`
- `docs/pitch/assets/version-1/demo_script.md` (legacy 3-min, outdated)

*Last updated: June 2026*
