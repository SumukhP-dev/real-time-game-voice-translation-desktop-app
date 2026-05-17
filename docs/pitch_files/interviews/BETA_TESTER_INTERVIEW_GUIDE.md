# Beta Tester Interview Guide (30 minutes)

**Purpose:** Collect evidence for incubator applications (problem validation, ICP, willingness to pay, retention, differentiation, and quotable stories).

**Interviewer:** _______________  
**Tester:** _______________  
**Date:** _______________  
**Build/version tested:** _______________  
**Recording consent (Y/N):** _______________

---

## Before the call (5 min prep)

- [ ] Confirm they used the app at least **2–3 sessions** (not only install).
- [ ] Ask which **MVP features** they tried (incoming subtitles minimum; note if they skipped outgoing voice, overlay tweaks, or Help).
- [ ] Note their games, rank/role if relevant, languages, and setup (headset, Discord vs in-game VC).
- [ ] Have this doc open for notes; optional screen share only if they offer to demo.

**Incubator mapping (what each block feeds):**

| Block | Incubator narrative |
|-------|---------------------|
| A — Context | ICP, market segment, “who hurts most” |
| B — Problem | Problem/solution fit, severity, frequency |
| C — Product | Solution quality, activation, retention drivers, **per-MVP-feature feedback** |
| D — Business | WTP, pricing, alternatives, GTM |
| E — Close | Testimonials, referrals, permission to follow up |

---

## Minute-by-minute flow

| Time | Section | Goal |
|------|---------|------|
| 0:00–2:00 | Warm-up | Rapport, consent to quote (anonymized or named) |
| 2:00–7:00 | **A — Player context** | Define beachhead user |
| 7:00–20:00 | **B — Problem** + **C — Product** (incl. MVP features) | Pain before you; did the app remove it |
| 20:00–25:00 | **D — Business & market** | WTP, competitors, growth loops |
| 25:00–30:00 | **E — Close** | Quotes, referrals, next steps |

---

## A — Player context (5 min)

*Goal: sharpen “who is the customer” for your application.*

1. **Walk me through your typical gaming week** — which games, how many hours, solo vs stack?
2. **Voice chat:** In-game only, Discord, or both? How often do you play with people who don’t speak your primary language?
3. **Languages:** What do you speak fluently? What languages do teammates use most often?
4. **Competitive context:** Ranked/competitive or casual? Does language ever affect whether you queue or accept invites?
5. **Setup today:** PC specs rough sense, Windows version, headset/mic — anything that affected install?

**Capture:**

- Primary game(s): _______________
- Hours/week: _______________
- Cross-language frequency (never / sometimes / often / every session): _______________
- Persona tag (pick one): competitive ranked / casual social / expat / content creator / other: _______________

---

## B — Problem validation (5 min, overlaps with C)

*Goal: prove the problem is real, urgent, and recurring — not “nice to have.”*

6. **Before this app**, what happened when a teammate spoke another language? (mute, guess, Google Translate, leave, etc.)
7. **Worst recent example** — one match or moment where language cost you something (round, toxicity, exclusion, missed callout). *Listen for emotion and specificity.*
8. **How often** does language friction affect your experience? (per session / weekly / rare)
9. **What did you try instead?** (Discord bots, phone translate, typing, other apps like LiveTranslate/EzDubs, nothing)
10. **If this disappeared tomorrow**, what would you go back to? What would you miss most?

**Capture:**

- Pain severity (1–10): _______________
- Frequency: _______________
- Current workaround: _______________
- Cost of problem (social / competitive / time): _______________

**Incubator line to draft later:**  
> “[Name] plays [game] [X] hrs/week; language issues [frequency]; before us they [workaround]; one incident: [quote].”

---

## C — Product experience (13 min)

*Goal: activation, core value, blockers, retention — what investors call “do they come back.”*

**MVP scope for this build** (ask about what they actually used; skip what they didn’t touch):

| Area | In MVP | Out of scope (note if they ask) |
|------|--------|----------------------------------|
| Incoming subtitles (teammate → you) | ✅ | |
| Outgoing voice translation (you → teammates) | ✅ | |
| On-screen overlay (size, position, auto-hide) | ✅ | |
| WASAPI loopback audio capture + setup wizard | ✅ | |
| Local/offline AI (Whisper + on-device translation) | ✅ | |
| Virtual mic output + TTS playback options | ✅ | |
| 15+ translation languages + auto-detect | ✅ | |
| Help Center / in-app setup guidance | ✅ | |
| Anti-cheat compatibility messaging | ✅ | |
| macOS, Discord bot, team licenses, cloud sync | | ❌ roadmap only |

### Setup & first run

11. **First 15 minutes** with the app — what was confusing? What was easy? Did you finish setup without help?
12. **Audio setup** (WASAPI / devices / wizard) — time to working state? Any step you’d skip or that almost made you quit?
13. **Time to first subtitle** — from install/open to seeing a real translation in a match. How many minutes? Any moment you almost quit before it worked?

### MVP features — activation build

*Probe each feature they used; note “didn’t try” vs “tried and failed.”*

14. **First launch / ML ready state:** On cold start, was it clear when the app was ready to use (model load, progress, status)? How long did you wait? Would clearer “ready” messaging have changed whether you stayed?
15. **Setup wizard:** Which steps did you complete? Did the device list match your real headset/speakers? Anything feel like a placeholder or wrong device?
16. **Audio capture (WASAPI):** Did you use WASAPI loopback (or fall back to Stereo Mix)? Did in-game voice chat actually get captured — or only Discord/desktop audio?
17. **Subtitle overlay:** Could you read subtitles during gameplay? Did you change size or position? Was auto-hide helpful or did you miss lines?
18. **Incoming translation (teammate → you):** Accuracy, latency, readability — rate 1–10 each. Wrong language or missed speech? Which teammate languages worked or failed?
19. **Language settings:** Did you set a target language, rely on auto-detect, or change mid-session? Did auto-detect match your lobby?
20. **Outgoing voice translation (you → teammates):** Did you turn it on? If yes, did teammates hear/react to translated voice? If no, why not (setup, privacy, not needed)?
21. **Virtual microphone output:** If you used outgoing voice, how did you route it (virtual mic vs speakers vs both)? Any game or Discord setting you had to change?
22. **Text-to-speech playback:** Did you listen to translations as spoken audio, subtitles only, or both? Which mode would you use in ranked?
23. **Help Center / docs:** When stuck, did you open in-app help or an external guide? What was missing?
24. **Anti-cheat / trust:** Did you see compatibility or safety messaging (Vanguard, ACE, etc.)? Did it ease concern about running capture software alongside the game?
25. **Install trust:** Any Windows SmartScreen, antivirus, or “unknown publisher” warning? What did you do — and would a short in-app note have helped?

### Core loop & reliability

26. **Compared to expectation**, what surprised you (good or bad) across the MVP features above?
27. **Reliability:** Crashes, silence, wrong language, CPU/GPU fan noise, model download or license issues?
28. **Offline/privacy:** Did “no cloud / local AI” matter to you? Would you pay more for that vs a cloud app?

### Habit & retention

29. **How many sessions** did you use it? Would you open it again next time you queue — why or why not?
30. **What would make you use it every ranked game?** (one MVP feature polish or one fix)

### MVP features they wanted but aren’t shipped

31. **Deferred features:** Did you expect macOS, Discord integration, team pricing, mobile, or translation history? How much did missing any of those block you vs nice-to-have?

**Capture:**

| Metric | Score / note |
|--------|----------------|
| Time to first subtitle (min) | |
| Setup difficulty (1–10) | |
| ML ready-state clarity (1–10) | |
| Incoming accuracy / latency / UX | /10 each |
| Outgoing voice used (Y/N) | |
| Virtual mic / TTS used (Y/N) | |
| MVP features tried (list) | |
| MVP feature #1 blocker | |
| Would use again (Y/N/Maybe) | |
| # sessions | |
| Top blocker | |
| Top delight | |

---

## D — Business, competition, GTM (8 min)

*Goal: WTP, positioning vs alternatives, word-of-mouth, channel hints.*

32. **Alternatives:** Have you paid for or would you pay for voice translation elsewhere? How much per month feels fair for *your* use?
33. **This product:** At **$7.99 launch / $12 regular** — too cheap, fair, or too expensive? What would you pay for **lifetime** vs **monthly**?
34. **Who else needs this?** Friends, communities, esports orgs, stream audiences — would you recommend it? To whom exactly?
35. **Discovery:** Where do you learn about gaming tools? (Reddit, Discord, YouTube, Steam, friend, etc.) Where would *you* expect to find this app?
36. **Trust:** Hardware license, download from itch/Gumroad, “local AI” — anything that made you hesitant?
37. **Dealbreakers:** What would make you uninstall or refund? (Windows-only, setup, accuracy, ban risk perception, etc.)
38. **Feature priority:** Rank top 3 from: easier setup, better incoming subtitles, better outgoing voice, lower latency, more languages, overlay UX, macOS, mobile companion, team license, Discord integration, anti-cheat safety messaging.

**Capture:**

- WTP (monthly $): _______________  
- WTP (lifetime $): _______________  
- vs competitors: better / same / worse because: _______________  
- Referral likelihood (1–10): _______________  
- Best acquisition channel hypothesis: _______________

---

## E — Close (5 min)

*Goal: assets for deck, application, and follow-up cohort.*

39. **One sentence:** How would you describe this app to a teammate?
40. **Permission:** Can we use a **short quote** (with or without your name) in our pitch? Can we follow up after the next build?
41. **Intro ask (optional):** Know 1–2 players with the same problem we should talk to?

**Quotable moments (verbatim if possible):**

- Problem quote: “____________________________________________”
- Value quote: “____________________________________________”
- Objection quote: “____________________________________________”

---

## Post-interview synthesis (10 min, solo)

Fill immediately while memory is fresh.

### Incubator one-pager bullets

1. **ICP hypothesis:**  
2. **Problem (frequency × severity):**  
3. **Solution proof (behavior, not opinion):** They used it ___ times; would return: Y/N because ___  
4. **Differentiation vs ___:**  
5. **WTP signal:**  
6. **Retention risk #1:**  
7. **GTM channel test:**  
8. **Roadmap priority from this interview:**  

### Traction counters (update your spreadsheet)

| Signal | This interview |
|--------|----------------|
| Activated (successful subtitles) | Y/N |
| Time to first subtitle under 15 min | Y/N |
| Outgoing voice tried | Y/N |
| Repeat use (2+ sessions) | Y/N |
| Would pay / did pay | |
| NPS-style (“recommend 0–10”) | |
| Referral offered | Y/N |

### Red flags for incubator narrative

- [ ] Only tried install, never in a real match  
- [ ] Problem is rare for this person (weak ICP)  
- [ ] Would not pay; free-only mindset  
- [ ] Setup blocked value entirely  
- [ ] Prefers existing competitor with no unmet need  

---

## Question bank (if you have extra time)

Use only if a section finishes early — do not skip **B8, C13, C18, D32–33, E39**.

**MVP quick-picks** (if short on time, ask one per pillar):

- **Activation:** C13, C14, C15  
- **Incoming value:** C18, C17  
- **Outgoing value:** C20, C21  
- **Trust:** C24, C25  

- **“Why now”:** More international lobbies lately, or same as always?  
- **Team play:** Do you play with a fixed stack — would *team* pricing make sense?  
- **Accessibility:** Hearing impaired, reading speed, subtitle size — overlay UX.  
- **Streamer:** Would overlays be OBS-friendly?  
- **Anti-cheat:** Any concern about capture software with Vanguard/ACE?  

---

## Interviewer tips

- **Ask for stories, not opinions.** “Tell me about the last time…” beats “Do you like it?”  
- **Silence is fine** — let them finish; the best quotes come after a pause.  
- **Don’t defend the product** — note objections; they become roadmap and pitch honesty.  
- **Separate ICP from noise** — one casual player who wouldn’t pay is data; five competitive players with weekly pain is a segment.  
- **Record metrics in their words** — “I lost the clutch because I didn’t understand the call” beats “accuracy 7/10.”

---

## Consent script (read at start)

> “Thanks for helping us improve the app. I’ll ask about your experience and what you’d pay — there are no wrong answers. This helps our fundraising story. Is it okay if I take notes and use anonymized quotes? If we record, I’ll ask again now.”

---

*Related docs: `COMPETITIVE_GRADING_ASSESSMENT.md`, `KICKSTARTER_PROJECT_OVERVIEW.md`, `MANUAL_TESTING_GUIDE.md`*
