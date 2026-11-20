#!/usr/bin/env python3
"""Make SIA Voice deterministic on every HTML page, even for previously cached JS.

Run at the Prism repository root AFTER applying the SIA Voice maintenance patch:
    python3 scripts/refresh_sia_voice_assets.py

Safe to rerun: replaces prior voice static asset tags and versions in-place.
No runtime requests or credentials are used.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "sia-voice-stable-20261121"
MAIN_SCRIPT = re.compile(
    r'<script\s+src="(?P<path>(?:\.\./)*js/porter-chatbot\.js)(?:\?[^\"]*)?"\s+defer></script>',
    re.IGNORECASE,
)
VOICE_SCRIPT = re.compile(
    r'<script\b(?=[^>]*\bsrc="(?:\.\./)*js/sia-voice-lite\.js(?:\?[^\"]*)?")[^>]*></script>',
    re.IGNORECASE,
)
VOICE_STYLESHEET = re.compile(
    r'<link\b(?=[^>]*\bhref="(?:\.\./)*css/sia-voice-lite\.css(?:\?[^\"]*)?")[^>]*>',
    re.IGNORECASE,
)


def update_page(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    # Direct script with data-sia-voice-lite also prevents the legacy dynamic
    # loader from fetching a second/stale voice implementation.
    content = VOICE_SCRIPT.sub("", original)
    content = VOICE_STYLESHEET.sub("", content)
    matches = list(MAIN_SCRIPT.finditer(content))
    if len(matches) != 1:
        if "porter-chatbot.js" in content:
            raise ValueError(f"Expected one standard Porter script tag in {path}, got {len(matches)}")
        return False

    main = matches[0]
    main_path = main.group("path")
    prefix = main_path.removesuffix("js/porter-chatbot.js")
    replacement = (
        f'<link rel="stylesheet" href="{prefix}css/sia-voice-lite.css?v={VERSION}">'
        f'<script src="{main_path}?v={VERSION}" defer></script>'
        f'<script data-sia-voice-lite="true" src="{prefix}js/sia-voice-lite.js?v={VERSION}" defer></script>'
    )
    content = content[:main.start()] + replacement + content[main.end():]
    if content != original:
        path.write_text(content, encoding="utf-8")
        return True
    return False


def main() -> None:
    pages = sorted(ROOT.glob("*.html")) + sorted((ROOT / "packages").glob("*.html"))
    if not pages:
        raise SystemExit("No HTML pages found; run this from a Prism repository with site files.")
    updated = 0
    seen = 0
    for page in pages:
        if "porter-chatbot.js" in page.read_text(encoding="utf-8"):
            seen += 1
            updated += int(update_page(page))
    if not seen:
        raise SystemExit("No pages with SIA detected. Has the pilot patch been applied?")
    print(f"SIA Voice script and CSS references verified on {seen} pages; updated {updated}.")
    print("Voice script is now an explicit defer dependency with a new cache version.")


if __name__ == "__main__":
    main()
