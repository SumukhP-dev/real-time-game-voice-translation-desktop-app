# VB-Audio Virtual Cable — licensing and permission request

SquadSpeak uses VB-Audio Virtual Cable as an **optional** virtual microphone for outgoing
translated voice. The in-app Setup Wizard runs VB-Audio’s own installer only when the user
clicks **Install Virtual Cable** (not inside the SquadSpeak NSIS installer).

## Contacts

| Purpose | Contact |
|--------|---------|
| **Primary (author / licensing)** | **vincent.burel@vb-audio.com** |
| **Website** | https://vb-audio.com/Cable/ |
| **Donation / download account** | https://shop.vb-audio.com (if you need commercial download terms) |

Use **vincent.burel@vb-audio.com** for redistribution, bundling, or combined-install questions.

## What to ask permission for

Be explicit about which of these you need:

1. **Redistribute** `VBCABLE_Setup_x64.exe` inside your app package (offline install).
2. **Launch** that installer from your app when the user clicks Install (current behavior).
3. **Integrate** VB-CABLE into your **own** NSIS/installer as a single setup flow (their readme
   restricts this without agreement).
4. **Branding** — use VB-Audio name/logo in your wizard and docs.

## Email template

**Subject:** SquadSpeak — permission to bundle / launch VB-CABLE Virtual Cable installer

```
Hello Vincent,

I am building SquadSpeak, a Windows desktop app for real-time game voice translation
(subtitles + optional outgoing translated voice for teammates).

We would like to use VB-Audio Virtual Cable (VB-CABLE) so users can route translated speech
into Discord or in-game voice chat. We understand VB-CABLE is donationware.

We request permission for the following (please confirm which are acceptable):

1. Redistribute VBCABLE_Setup_x64.exe (unchanged, from your official driver pack) inside our
   application installer or resources folder for offline use.

2. Launch your setup executable from our in-app Setup Wizard when the user explicitly clicks
   “Install Virtual Cable” (with UAC / driver prompts handled by Windows — not silent).

3. [If applicable] Include a single combined installer flow: our app installer followed by,
   or alongside, your VB-CABLE setup — only if you approve integration in another product’s
   installation procedure.

We will attribute VB-Audio and link to https://vb-cable.com in the app and documentation.
We will not modify your installer binaries.

Distribution: [commercial / Steam / itch / direct download / estimated users per year]
Company / developer name: [your name or company]
Website: [your URL]

Thank you for your time. We are happy to follow donationware terms or any commercial
license you recommend.

Best regards,
[Your name]
[Your email]
```

## Until you have written approval

- Keep VB-Audio install **user-initiated** in the Setup Wizard (current design).
- Do **not** chain silent VB-Audio install inside SquadSpeak’s NSIS without approval.
- Ship attribution text (see `third_party/vb-audio/README.md`).
