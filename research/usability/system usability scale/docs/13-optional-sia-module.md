# 13 · Optional Exploratory Module — SIA Text and Voice

**Separate from core SUS baseline.** The existing site may have a text assistant (“SIA”) and a browser-based voice feature, but the actual public visibility, permissions, caching, audio behaviour, and live deployment are **not independently verified here**. Only run this module if the exact feature is working reliably in the tested build and a research owner authorises its use.

## Why not include in every core task?

If only some participants have access to SIA, putting it before the standard SUS measures **different systems**. Instead: run core T01–T06 → post-session SUS → optional SIA exploration, and record SIA-specific findings separately. For a future **SIA-focused SUS**, all participants must complete equivalent SIA tasks on a stable build, then answer a separate instrument explicitly defining “system” as the SIA experience.

## Preconditions

- [ ] Verify whether text and voice are visible to the test accounts in normal and private browsing modes.
- [ ] Verify authentication and feature flag state consistently across participants.
- [ ] Obtain separate informed permission before using microphone; default microphone OFF.
- [ ] Use fully fictional prompts, not real names, payment data, passport details or true itineraries.
- [ ] Have a clear stop procedure for unresponsive chat, incorrect claims, audio errors and timeouts.
- [ ] Confirm whether vendor logs store prompts/transcripts; communicate this clearly before the module.

## SIA-T01 — Discoverability (text)

> You want to ask a travel question without looking through all the pages. Find a way to speak to or message the site's digital assistant, if available. Describe what you expect it can help with.

Observer: noticeability of entry point, language indicating AI assistant, privacy clarity, whether the user expects a person, and accessibility of chat UI.

## SIA-T02 — Simple planning prompt (text)

> Ask the assistant: **“I'm considering a four-night leisure trip from Delhi. What information would you need from me to help plan it?”** Tell us whether the response gives you an understandable next step. Do not provide personal information.

Observer: response starts, time to first useful answer, whether it asks relevant questions, acknowledgment of uncertainty, broken links, invented packages and ability to recover.

## SIA-T03 — Package information or safe handoff

> Ask the assistant: **“Do you have any holiday packages I can review, and how could I contact the team for a tailored quote?”** Describe what you would do next.

Observer: transparent package availability, traceable URLs, whether claims match actual visible content, delay/hang, failure fallback, handoff to a real channel.

## SIA-V01 — Voice (only with separate microphone consent)

> Use the site's voice assistant to ask one fictional travel question similar to the text prompt. Tell us whether it understood you, responded appropriately and made the interaction easy to end.

Observer: permissions, start/stop control, audio feedback, interruptions, latency, failed reply after “just checking”, transcript visibility, accessibility and cache/visibility inconsistency. Mark unavailable/technical failure rather than encouraging repeated personal-data disclosures.

## SIA-specific measures (not SUS)

- `visible` yes/no, `open_success` yes/no, `response_received` yes/no.
- `first_response_seconds` measured only if actual stopwatch is used.
- `relevant_next_step` yes/no/uncertain; notes on misleading package claims and handoff.
- `voice_permission_worked` yes/no/NA, `audio_failure` yes/no/NA.
- Open-ended: “What did you think this assistant could do?” and “What would make you comfortable using it?”

**Stop conditions:** 60 seconds with no useful response (pilot-adjustable), technical failure, participant discomfort, or any request for sensitive details. Record the event precisely and return to the researcher; do not log secrets.
