# PRISM TRAVELS — Website Source

A complete, responsive, static information and enquiry website for **Prism Travels**, using the existing Prism logo, a chromatic blue identity, and the tagline **“Each Mile With A Smile.”** The site's editorial structure is inspired by high-end destination-management websites, but all copy, layout treatment, colours and branding are independent.

## Files

| File/folder | Purpose |
|---|---|
| `index.html` | Homepage |
| `about.html` | Company story and values |
| `services.html` | 8 travel service categories |
| `destinations.html` | Destination gallery with India/international filters and search |
| `experiences.html` | 6 travel experience categories with filters |
| `contact.html` | Google Form enquiry button, optional copyable trip brief, and FAQs |
| `privacy.html`, `terms.html` | General website privacy and terms pages — review before publishing |
| `404.html` | Custom not-found page |
| `css/styles.css` | Design system and responsive stylesheet |
| `js/site.js` | Mobile menu, filters, accessibility, scroll effects and trip brief |
| `assets/` | Original Prism logo assets, favicon and offline-friendly illustration fallback |
| `scripts/build_pages.py` | Optional Python generator for regenerating all pages |

## Local preview — no setup or build required

**Option 1:** Double-click `index.html`. The HTML, CSS and JavaScript work directly in a browser. The photo CDN and web font require an internet connection. If a travel photo cannot load, a bundled local illustration is used instead.

**Option 2 (recommended):** With Terminal open inside the project folder:

```bash
python3 -m http.server 8000
```

Visit **http://localhost:8000**. Stop the server with **Ctrl+C**. On a Mac, `python3` is normally the correct command.

No Node.js, npm, framework, API keys or payment setup is required.

## Deploy to Hostinger (static hosting)

1. Obtain a Hostinger **web hosting plan** for the domain. Buying a domain alone does **not** include hosting. Connect the domain to that hosting account and enable its SSL certificate.
2. Open Hostinger **hPanel → Websites → Dashboard → Files → File Manager** (labels can vary).
3. Open the website's **`public_html`** folder. Remove or back up any default placeholder `index.html` there first.
4. Upload the **contents** of this project folder (all root `.html` files plus the `css/`, `js/`, and `assets/` directories). Do **not** upload just the ZIP without extracting it. You can omit `scripts/`, `.gitignore`, and documentation from production.
5. Open your domain over HTTPS and test each navigation item, image, filter and enquiry link on desktop and mobile.
6. In Hostinger's SSL settings, ensure HTTPS is enabled and (where supported) HTTPS redirection is on.

**Important:** Upload the *contents*, so the live `index.html` is directly at `public_html/index.html`, not nested under another folder.

## Edit branding, copy, or content

- **Colours and typography:** `css/styles.css`, starting at `:root`.
- **Google enquiry form:** Replace `FORM = 'https://forms.gle/KLPB9NCuSUFpSni97'` inside `scripts/build_pages.py`, then regenerate the pages. This is the form link you previously provided.
- **Logo:** The agency-provided logo files live in `assets/prism-symbol.png` and `assets/prism-logo-original.png`. The header uses the symbol paired with a text wordmark to keep it aligned and legible.
- **Page wording:** Edit the HTML directly, or change the corresponding content in `scripts/build_pages.py` and run:

```bash
python3 scripts/build_pages.py
```

**Warning:** Running the generator overwrites the root `.html` files. If you edit generated HTML manually, do not regenerate without transferring your edits into the script first.

## Images and licensing

- Live travel photographs are pulled directly from `images.unsplash.com` and are **not packaged locally**. This keeps the ZIP small. The website has bundled local SVG fallbacks when images cannot load.
- Images may be replaced with your own licensed photography by changing `src` in HTML or the photo IDs in `scripts/build_pages.py`, then regenerating. The two large CSS background photos are set in `css/styles.css`.
- Review the licensing and availability of individual photographs before commercial publication. For maximum reliability, replace the CDN photos with owned, properly licensed files placed in `assets/`.
- The Prism logo used here was recovered from your earlier Prism logo asset. No SITA logos, written content, photos, facts or business claims are used.

## Before going public — business details still needed

The source is technically deployable, but you should confirm the following operational facts rather than publish guesses:

- **Office address**, business phone, opening hours and business email, if you want those publicly listed. They were not supplied; the site currently directs visitors to your Google Form instead of inventing them.
- **Legal entity and jurisdiction**, privacy contact, data retention practices, refund/cancellation policy and any applicable registration details. Have the privacy and terms pages reviewed and adapted to your actual policies.
- **Current travel services and capabilities**. Remove or alter any service you do not offer.
- **Photographic licensing and accessibility** on the final production domain.
- **Google Form access**: ensure it accepts responses from the public and notifications are enabled for your team. The provided link could not be independently verified in this environment.

This is a **lead-generation and information site**, not a flight/hotel booking engine. There are no fabricated testimonials, awards, accreditations, hotel inventories, payment buttons or fake prices.

## Quality / accessibility

- Semantic HTML with descriptive page titles, meta descriptions and main landmarks.
- Responsive layouts from narrow mobile screens to desktops.
- Accessible mobile navigation with `aria-expanded` and Escape handling.
- Keyboard-operated filters, native FAQ accordions and helpful empty states.
- `prefers-reduced-motion` support and visible content when JavaScript is disabled.
- No analytics, trackers, cookies set by our JavaScript, build dependencies or hidden backend.
- Local imagery fallback; live photos and fonts benefit from internet access.

## Quick smoke-test checklist

- [ ] Home / About / Services / Destinations / Experiences / Contact open correctly
- [ ] Mobile hamburger opens, Escape closes it, and links navigate
- [ ] Destination filter and search work
- [ ] Experience category filter works
- [ ] Contact trip brief creates text and copies it when browser permissions allow
- [ ] Enquiry buttons open your own Google Form in a new tab
- [ ] Check `privacy.html`, `terms.html` and office details before launch
- [ ] SSL and domain DNS are correctly configured in Hostinger

© Prism Travels. This is original source code supplied for your project.
