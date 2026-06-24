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
- [ ] 4 Spanish MP3s in a folder, VLC ready (see [Audio files](#audio-files))
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
| **0:22–0:42** | C — Proof | Play `01_rush_b.mp3` then `03_planting.mp3`. Hold each subtitle ~2s. | Silence or *"Spanish in, English on screen."* |
| **0:42–1:02** | D — Proof | Play `04_rotate.mp3` then `05_last_site.mp3`. Small caption: *Simulated callouts for demo*. | Silence |
| **1:02–1:15** | E — Credibility | Wide: game + overlay. Bullets: **Offline · local AI** · **Valorant / CS2 / Apex** · **v1.0 shipped** | VO block 3 |
| **1:15–1:30** | F — End card | Logo, tagline, Windows v1.0.0, contact URL | VO block 4 |

*VO is ~125 words (~50s). Demo beats fill the rest. Hard cap: cut Proof clip D short if you're over 90s.*

---

## Clips to capture

Record each as a **separate file** — no need for one continuous take.

| Clip | What to do | Length to capture |
|------|------------|-------------------|
| **A** | Ranked game running. Play one Spanish MP3 **without** SquadSpeak (or hide overlay). Add text in editor. | ~12s |
| **B** | Open SquadSpeak from desktop. Show game behind overlay. Open Settings → pick WASAPI loopback → close. | ~10s |
| **C** | SquadSpeak on. VLC → play `01_rush_b.mp3`, wait for subtitle, hold. Repeat for `03_planting.mp3`. | ~20s |
| **D** | Same setup. Play `04_rotate.mp3`, then `05_last_site.mp3`. | ~20s |
| **E** | Static or slow pan: game + overlay + bullet text (add bullets in editor if easier). | ~13s |
| **F** | End card (Canva, PowerPoint export, or text in editor). | ~15s |

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

You need **one MP3 per callout** — not one file with every line. If you paste all lines into TTS at once, they run together as a single clip.

### Option A — script (easiest)

From the repo root:

```powershell
pip install edge-tts
python scripts/generate_demo_callouts.py
```

Outputs to `docs/pitch/assets/demo_audio/` — one file per row below.

### Option B — ElevenLabs / edge-tts manually

**One generation per line.** Do not paste the whole list.

| Step | Text to paste (only this) | Save as |
|------|---------------------------|---------|
| 1 | `¡Rush B!` | `01_rush_b.mp3` |
| 2 | `¡Plantan!` | `03_planting.mp3` |
| 3 | `¡Rotar, rotar!` | `04_rotate.mp3` |
| 4 | `¡Último en sitio!` | `05_last_site.mp3` |

edge-tts CLI example (run **four times**, change text and filename each time):

```powershell
edge-tts --text "¡Rush B!" --voice es-MX-DaliaNeural --write-media 01_rush_b.mp3
```

### Already have one long MP3? (e.g. ElevenLabs Jorge voice)

If you generated **all lines in one ElevenLabs take**, split automatically:

```powershell
pip install imageio-ffmpeg
python scripts/split_elevenlabs_demo.py "ElevenLabs_....mp3"
```

Writes `01_rush_b.mp3`, `03_planting.mp3`, `04_rotate.mp3`, `05_last_site.mp3` to `docs/pitch/assets/demo_audio/`.

**Check the splits** in VLC — phrase order must match what you pasted into ElevenLabs (Rush B → Plantan → Rotar → Último en sitio). If order differs, rename files or re-generate one line at a time.

Manual option: **Audacity** → select each phrase → **File → Export → Export Selected Audio**.
### Reference

| File | Say this | Subtitle should read |
|------|----------|----------------------|
| `01_rush_b.mp3` | ¡Rush B! | Rush B! |
| `03_planting.mp3` | ¡Plantan! | Planting |
| `04_rotate.mp3` | ¡Rotar, rotar! | Rotate |
| `05_last_site.mp3` | ¡Último en sitio! | Last on site |

*`02_one_short.mp3` (`¡Uno en corta!`) is optional spare; not in the 90s cut.*

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
