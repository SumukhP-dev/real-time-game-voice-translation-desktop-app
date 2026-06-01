#!/usr/bin/env python3
"""Reorganize flat docs/ into categorized subfolders and update repo links."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DOCS = REPO / "docs"

# target subpath under docs/ -> list of filenames (only files currently in docs root or stale dirs)
MOVES: dict[str, list[str]] = {
    "guides/setup": [
        "INSTALLATION.md",
        "MACOS_SETUP.md",
        "QUICKSTART.md",
        "QUICKSTART_FREE.md",
        "QUICK_SETUP_GUIDE.md",
        "SETUP_GUIDE_VISUAL.md",
        "SETUP_COMPLETE.md",
        "START_APP.md",
        "FREE_VERSION_README.md",
        "VENV311_SETUP.md",
        "VOICE_TRANSLATION_SETUP.md",
        "VOICE_CLONING_SETUP.md",
        "LICENSE_ACTIVATION.md",
    ],
    "guides/audio": [
        "AUDIO_DEVICE_GUIDE.md",
        "AUDIO_SETUP_GUIDE.md",
        "AUDIO_RECORDING_GUIDE.md",
        "AUDIO_CAPTURE_DEBUG.md",
        "FIX_AUDIO_ROUTING.md",
        "VB_AUDIO_LICENSING.md",
    ],
    "guides/troubleshooting": ["SOLUTIONS.md"],
    "guides/demo": ["README_DEMO.md", "VIDEO_TUTORIALS.md", "video_recording_guide.md"],
    "product": [
        "FEATURES_LIST.md",
        "FEATURES_IMPLEMENTATION_COMPLETE.md",
        "IMPLEMENTATION_STATUS.md",
        "CHANGELOG.md",
        "RELEASE_NOTES.md",
        "VERSIONS.md",
        "APP_COMPARISON.md",
        "MIGRATION_COMPLETE.md",
    ],
    "testing": [
        "MANUAL_TESTING_GUIDE.md",
        "TESTING_README.md",
        "TEST_CHECKLIST.md",
        "TEST_COVERAGE.md",
        "TEST_RESULTS.md",
        "TEST_SETUP_STEPS.md",
        "QUICK_TEST_CHECKLIST.md",
    ],
    "debugging": [
        "DEBUGGING_SUMMARY.md",
        "DEBUG_SUMMARY.md",
        "TERMINAL_AND_TRANSLATION_DEBUG.md",
        "TERMINAL_DEBUG_FIXES.md",
        "TERMINAL_DEBUG_GUIDE.md",
        "TERMINAL_OUTPUT_FIX.md",
        "TERMINAL_TRANSLATION_LOGS_FINAL_STATUS.md",
        "TERMINAL_TRANSLATION_LOGS_STATUS.md",
        "TRANSLATION_DEBUG.md",
        "TRANSLATION_FIX_SUMMARY.md",
        "TRANSLATION_LOG_DEBUG.md",
        "FIX_DUPLICATE_TITLE_BAR.md",
        "CONNECTION_RESET_FIX.md",
        "THREAD_SAFETY_FIX.md",
        "FINAL_DEBUG_COMPLETE.md",
        "FINAL_DEBUG_SUMMARY.md",
        "FINAL_TERMINAL_TRANSLATION_DEBUG.md",
        "LOGGING_VERIFICATION.md",
    ],
    "development": [
        "BUILD_INSTRUCTIONS.md",
        "PROJECT_STRUCTURE.md",
        "QUICK_START_INTEGRATIONS.md",
        "GIT_DEBUG_REPORT.md",
        "GIT_PUSH_FIX_COMPLETE.md",
        "GIT_TIMEOUT_FIX.md",
    ],
    "marketing": [
        "ANALYTICS_SETUP.md",
        "PRICING_STRATEGY.md",
        "LAUNCH_STRATEGY.md",
        "REVENUE_MAXIMIZATION_SUMMARY.md",
        "GUMROAD_DESCRIPTION.md",
        "ITCH_IO_DESCRIPTION.md",
        "ITCH_IO_BUILD.md",
        "KICKSTARTER_PROJECT_OVERVIEW.md",
        "TRACKING_TEMPLATE.csv",
        "Marketing Data Report 1.csv",
    ],
    "competitive": [
        "COMPETITIVE_ANALYSIS.md",
        "COMPETITIVE_FEATURES_IMPLEMENTATION.md",
        "COMPETITIVE_GRADING_ASSESSMENT.md",
        "PRODUCT_COMPETITIVENESS_ASSESSMENT.md",
        "UI_GRADING_ASSESSMENT.md",
    ],
    "legal": [
        "ANTICHEAT_COMPATIBILITY.md",
        "ANTICHEAT_CERTIFICATION.md",
        "PRIVACY_POLICY.md",
    ],
    "pitch/interviews/set_1": [
        "BETA_TESTER_INTERVIEW_GUIDE.md",
        "interview_set1_Ric_C_interview_1.docx",
        "interview_set1_samika_paspuleti_interview_1.docx",
        "Ric_C_interview_1.docx",
        "samika_paspuleti_interview_1 copy.docx",
    ],
    "pitch/interviews/set_2": [
        "BETA_TESTER_INTERVIEW_GUIDE_set2.md",
        "BETA_TESTER_INTERVIEW_GUIDE_set2.docx",
        "Ric_C_interview_1_completed_notes.md",
    ],
    "pitch/accelerator": ["fall_2026_accelerator_readiness_cf0760a9.plan.md"],
    "pitch/pre_accelerator/meeting_1": [
        "CREATE-X_Pre-Accelerator_Session_meeting_1.docx",
        "CREATE-X Pre-Accelerator Session (1).docx",
    ],
    "pitch/assets": [
        "presentation.pdf",
        "demo_script.md",
        "resume_entry.md",
    ],
}

# Legacy paths -> new paths (for link rewrites)
LEGACY_PATHS: dict[str, str] = {}
for sub, names in MOVES.items():
    for name in names:
        LEGACY_PATHS[name] = f"{sub}/{name}"
        LEGACY_PATHS[f"pitch_files/{name}"] = f"{sub}/{name}"
        LEGACY_PATHS[f"pitch_files/interviews/set_1/{name}"] = f"{sub}/{name}"
        LEGACY_PATHS[f"pitch_files/interviews/set_2/{name}"] = f"{sub}/{name}"
        LEGACY_PATHS[f"pre_accelerator_sessions/meeting_1/{name}"] = f"{sub}/{name}"

LEGACY_PATHS["pitch_files/BETA_TESTER_INTERVIEW_GUIDE.md"] = (
    "pitch/interviews/set_1/BETA_TESTER_INTERVIEW_GUIDE.md"
)
LEGACY_PATHS["pitch_files/Marketing Data Report 1.csv"] = (
    "marketing/Marketing Data Report 1.csv"
)
LEGACY_PATHS[
    "pre_accelerator_sessions/meeting_1/CREATE-X Pre-Accelerator Session (1).docx"
] = "pitch/pre_accelerator/meeting_1/CREATE-X Pre-Accelerator Session (1).docx"


def find_file(name: str) -> Path | None:
    """Find a doc by basename anywhere under docs/."""
    matches = list(DOCS.rglob(name))
    if not matches:
        return None
    # Prefer shallowest path (likely canonical)
    return sorted(matches, key=lambda p: len(p.parts))[0]


def move_all() -> list[tuple[Path, Path]]:
    moved: list[tuple[Path, Path]] = []
    for sub, names in MOVES.items():
        dest_dir = DOCS / sub
        dest_dir.mkdir(parents=True, exist_ok=True)
        for name in names:
            src = find_file(name)
            if src is None:
                continue
            dest = dest_dir / name
            if dest.resolve() == src.resolve():
                continue
            if dest.exists():
                print(f"SKIP exists: {dest}")
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dest))
            moved.append((src, dest))
            print(f"MOVE {src.relative_to(DOCS)} -> {dest.relative_to(DOCS)}")
    return moved


def remove_empty_dirs() -> None:
    for d in sorted(DOCS.rglob("*"), reverse=True):
        if d.is_dir() and d != DOCS:
            try:
                d.rmdir()
            except OSError:
                pass


def build_rewrite_map() -> dict[str, str]:
    """docs/old -> docs/new for all moved files."""
    rewrites: dict[str, str] = {}
    for old_rel, new_rel in LEGACY_PATHS.items():
        rewrites[f"docs/{old_rel}"] = f"docs/{new_rel}"
        rewrites[f"docs/{old_rel.replace(' ', '%20')}"] = f"docs/{new_rel.replace(' ', '%20')}"
    # Also rewrite bare docs/FILENAME for root-flat files
    for new_rel in set(LEGACY_PATHS.values()):
        fname = Path(new_rel).name
        rewrites[f"docs/{fname}"] = f"docs/{new_rel}"
    return rewrites


def update_file(path: Path, rewrites: dict[str, str]) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return False
    original = text
    # Longest paths first
    for old in sorted(rewrites, key=len, reverse=True):
        text = text.replace(old, rewrites[old])
    # Markdown links without docs/ prefix for same-folder refs - skip
    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def update_repo_links(rewrites: dict[str, str]) -> int:
    count = 0
    exts = {".md", ".py", ".ts", ".tsx", ".json", ".yml", ".yaml", ".txt", ".iss", ".bat", ".ps1"}
    for path in REPO.rglob("*"):
        if not path.is_file():
            continue
        if ".git" in path.parts or "node_modules" in path.parts or "dist" in path.parts:
            continue
        if path.suffix.lower() not in exts and path.name != ".gitignore":
            continue
        if update_file(path, rewrites):
            count += 1
            print(f"UPDATED {path.relative_to(REPO)}")
    return count


def write_docs_readme() -> None:
    readme = DOCS / "README.md"
    content = """# Documentation index

All project documentation lives under categorized folders below.

| Folder | Contents |
|--------|----------|
| [`guides/setup/`](guides/setup/) | Installation, quick start, platform setup, licensing |
| [`guides/audio/`](guides/audio/) | WASAPI, devices, routing, VB-Audio |
| [`guides/troubleshooting/`](guides/troubleshooting/) | Common issues and fixes |
| [`guides/demo/`](guides/demo/) | Demo and video tutorial notes |
| [`product/`](product/) | Features, changelog, releases, implementation status |
| [`testing/`](testing/) | Manual testing, checklists, coverage |
| [`debugging/`](debugging/) | Terminal, translation, and debug session notes |
| [`development/`](development/) | Build, git, project structure |
| [`marketing/`](marketing/) | Launch, pricing, store listings, campaign data |
| [`competitive/`](competitive/) | Competitive analysis and grading |
| [`legal/`](legal/) | Privacy, anti-cheat compatibility |
| [`pitch/`](pitch/) | Interviews, accelerator plans, deck assets |

### Pitch materials

- [`pitch/interviews/set_1/`](pitch/interviews/set_1/) — Interview guide v1 and completed interviews
- [`pitch/interviews/set_2/`](pitch/interviews/set_2/) — CREATE-X aligned interview guide
- [`pitch/accelerator/`](pitch/accelerator/) — Accelerator readiness plans
- [`pitch/pre_accelerator/`](pitch/pre_accelerator/) — Workshop notes (e.g. CREATE-X)
- [`pitch/assets/`](pitch/assets/) — Deck PDF, demo script, resume blurb

### Entry points (most linked from root README)

- [Installation](guides/setup/INSTALLATION.md)
- [Quick start](guides/setup/QUICKSTART.md)
- [macOS setup](guides/setup/MACOS_SETUP.md)
- [Audio device guide](guides/audio/AUDIO_DEVICE_GUIDE.md)
- [Troubleshooting](guides/troubleshooting/SOLUTIONS.md)
- [Beta tester interviews (set 1)](pitch/interviews/set_1/BETA_TESTER_INTERVIEW_GUIDE.md)
- [Beta tester interviews (set 2 / CREATE-X)](pitch/interviews/set_2/BETA_TESTER_INTERVIEW_GUIDE_set2.md)
"""
    readme.write_text(content, encoding="utf-8", newline="\n")


def main() -> None:
    moved = move_all()
    remove_empty_dirs()
    rewrites = build_rewrite_map()
    n = update_repo_links(rewrites)
    write_docs_readme()
    # Refresh PROJECT_STRUCTURE doc section
    ps = DOCS / "development" / "PROJECT_STRUCTURE.md"
    if ps.exists():
        text = ps.read_text(encoding="utf-8")
        text = text.replace(
            "├── docs/                             # Documentation (flat; no subfolders)\n"
            "│   ├── PROJECT_STRUCTURE.md          # This file\n"
            "│   ├── *.md                          # Guides, pitch materials, interview scripts\n"
            "│   ├── presentation.pdf              # Pitch deck\n"
            "│   ├── Marketing Data Report 1.csv   # Campaign metrics\n"
            "│   └── *.docx                        # Local interviews / workshops (gitignored)",
            "├── docs/                             # Documentation (see docs/README.md)\n"
            "│   ├── guides/                       # Setup, audio, troubleshooting\n"
            "│   ├── product/                      # Features, changelog, releases\n"
            "│   ├── testing/                      # Test guides and checklists\n"
            "│   ├── debugging/                    # Debug session notes\n"
            "│   ├── development/                # Build, git, this file\n"
            "│   ├── marketing/                    # Launch, pricing, campaigns\n"
            "│   ├── competitive/                  # Market analysis\n"
            "│   ├── legal/                        # Privacy, anti-cheat\n"
            "│   └── pitch/                        # Interviews, accelerator, assets",
        )
        text = text.replace(
            "### Documentation (`docs/`)\n"
            "- Complete documentation including setup guides, troubleshooting, and API reference\n"
            "- Project structure and development guidelines",
            "### Documentation (`docs/`)\n"
            "- See [`docs/README.md`](../README.md) for the full index\n"
            "- User guides under `guides/`; pitch and interview materials under `pitch/`",
        )
        ps.write_text(text, encoding="utf-8", newline="\n")
    print(f"\nMoved {len(moved)} files; updated {n} files with new paths.")


if __name__ == "__main__":
    main()
