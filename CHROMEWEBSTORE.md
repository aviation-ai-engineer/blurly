# Blurly — Chrome Web Store Submission Pack

## Single purpose

Blurs the WhatsApp Web chat list and open conversation so people nearby can't
read your messages over your shoulder. Hover any blurred area to reveal it
temporarily; keyboard shortcuts (Ctrl+Shift+Y to blur, Ctrl+Shift+U to hide) toggle
blur on or off instantly. Nothing else.

## Permissions justification

| Permission | Why it's needed |
|---|---|
| `storage` | Remembers whether blur is on/off (per browser, via `chrome.storage.local`) so the state persists across tabs and restarts. |
| `activeTab` | Lets the popup check which site the current tab is on (to show the "wrong site" state) without requesting access to every open tab. |
| `host_permissions: https://web.whatsapp.com/*` | The content script that applies the blur CSS and listens for the panic key only runs on WhatsApp Web. No other site is touched. |

No `<all_urls>`, no background/analytics permissions, no optional permissions.

## Data disclosure

- **Nothing is collected.** No analytics, no telemetry, no crash reporting.
- **Nothing is transmitted.** The extension makes zero network requests of any
  kind. Message content, contact names and photos never leave the device.
  Settings are booleans in local browser storage.
- **No remote code.** All CSS/JS ships in the package; nothing is fetched or
  eval'd at runtime.
- **No accounts, no login, no backend.**

## Listing copy

**Name (≤75 chars):** `Blurly — Privacy Screen for WhatsApp Web`

**Short description (≤132 chars):**
`Blur your WhatsApp Web chats instantly so no one nearby can read them. Hover to reveal. One shortcut to panic-toggle.`

**Full description:**

> Ever had someone glance over at your screen while WhatsApp Web is open on
> your work laptop, in a co-working space, or on a shared monitor? Blurly
> puts a privacy screen over your chat list and open conversation with one
> click — or one keyboard shortcut when you need it instantly.
>
> **How it works**
> - Turn blur on from the popup — your chat list and messages blur immediately.
> - Hover over a blurred area to read it; move away and it blurs again.
> - Hit **Ctrl+Shift+U** any time as a panic key — works
>   whether the popup is open or not.
>
> **Built for privacy, not just looks**
> - Works only on web.whatsapp.com — no other site is touched.
> - 100% local. No accounts, no servers, no analytics, no data collection
>   of any kind. Your messages never leave your browser.
> - Minimal permissions: just enough to remember your on/off state and run
>   on WhatsApp Web.
>
> Made for anyone who reads WhatsApp Web in public: open offices,
> co-working spaces, cafés, shared family computers, or just a desk facing
> a doorway.
>
> Blurly is free and fully usable on its own. If you want the extras —
> spotlighting a single chat and aliasing names to "Client A", "Client B" — Blurly
> Pro is a separate one-time purchase (INR 199, no subscription, no account).
> The link is in the popup. The free version stays free.

**Screenshots to take (1280×800 or 640×400):**
1. WhatsApp Web with blur **on** — chat list and open chat both blurred, popup open showing the toggle switched on.
2. Same view **mid-hover** over the chat list — showing the reveal-on-hover effect (blurred main pane, sharp sidebar).
3. The popup by itself on a clean background — showing the toggle, hint text, and footer, to sell the simplicity.

## Category & audience

- Category: Privacy & Security
- Audience: anyone using WhatsApp Web in a shared or public space


---

# Console field-by-field (copy-paste)

## STORE LISTING tab

**Item name**
```
Blurly — Privacy Screen for WhatsApp Web
```

**Summary** (132 max — this is 116)
```
Blur your WhatsApp Web chats instantly so no one nearby can read them. Hover to reveal. One shortcut to panic-toggle.
```

**Description** — paste the full description block above, as-is.

**Category:** Privacy & Security
**Language:** English

**Store icon:** 128×128 — `icons/icon128.png` (already in the package)

**Screenshots:** 1280×800, at least one, up to five. Take the three listed above.

**Small promo tile (440×280):** optional, skip for v1.
**Marquee (1400×560):** optional, skip.

**Support URL / Homepage URL:** your Razorpay page works, or leave blank if optional.
Better: a one-page GitHub Pages or Gist with a contact email.

**Mature content:** No.
**Google Analytics:** leave off — there is none.

## PRIVACY tab

**Single purpose description**
```
Blurly blurs the WhatsApp Web chat list and open conversation so people nearby
cannot read the user's messages over their shoulder. Hovering a blurred area
reveals it temporarily, and a keyboard shortcut toggles blur instantly.
That is the extension's only function. It does not modify, send, or store
message content, and it runs on no site other than web.whatsapp.com.
```

**Permission justification — `storage`**
```
Stores a small number of booleans (blur on/off, presenting mode on/off) in
chrome.storage.local so the user's chosen state persists across tabs and browser
restarts. No message content, contact data, or identifiers are stored.
```

**Permission justification — `activeTab`**
```
Lets the popup determine whether the current tab is WhatsApp Web, so it can show
the correct state instead of controls that would do nothing. It is used only when
the user clicks the extension icon, and avoids requesting access to all tabs.
```

**Host permission justification — `https://web.whatsapp.com/*`**
```
The content script that applies the blur styling and listens for the panic-key
shortcut must run on WhatsApp Web itself. This is the only site the extension
touches; no other host is requested and <all_urls> is not used.
```

**Are you using remote code?**
```
No, I am not using remote code.
```
(All JS and CSS ship inside the package; nothing is fetched or eval'd.)

**Data usage — what does your item collect?**
Tick **nothing**. Not personally identifiable info, not health, not financial,
not authentication, not personal communications, not location, not web history,
not user activity, not website content. The extension makes zero network requests.

**Certifications** — tick all three:
- I do not sell or transfer user data to third parties, outside of approved use cases
- I do not use or transfer user data for purposes unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** if the console insists on one, host a short page saying
"Blurly collects no data, transmits no data, and makes no network requests." A
GitHub Gist or GitHub Pages file is enough.

## DISTRIBUTION tab

- **Visibility:** Public (or Unlisted if you want to share the link privately first)
- **Distribution:** all regions — there is no country targeting for free items
- **Pricing:** Free (Chrome Web Store payments no longer exist; Pro is sold off-store via Razorpay)

Then **Submit for review**.
