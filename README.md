# Blurly — Privacy Screen for WhatsApp Web

Blurs your WhatsApp Web chat list and open conversation so nobody beside you — or
watching your screen share — can read them. Hover to reveal the one thread you're
actually reading. One shortcut hides everything instantly.

**[Privacy policy](https://aviation-ai-engineer.github.io/blurly/)**

## Why the source is here

Blurly is a privacy tool, so "trust me" isn't good enough. The whole free extension is
in this repo. You can confirm for yourself that it:

- makes **zero network requests** — no analytics, no telemetry, no crash reporting
- ships **no remote code** — every line of JS and CSS is in this package
- stores only two booleans (blur on, presenting on) in `chrome.storage.local`
- runs on `web.whatsapp.com` and nowhere else

## Shortcuts

| Shortcut | What it does |
|---|---|
| `Ctrl+Shift+Y` | Toggle blur |
| `Ctrl+Shift+U` | Presenting mode — hides everything, hover can't reveal |

## Install from source

1. `git clone` this repo
2. Open `chrome://extensions`, enable **Developer mode**
3. **Load unpacked** → select the repo folder

## Blurly Pro

Pro adds *Spotlight this chat* (show one thread, hide every other) and *Alias names*
(contacts become "Client A", "Client B"). It's a separate build, one-time INR 199, no
subscription and no account — the link is in the extension popup. Pro is not in this
repo.

## Licence

MIT — see [LICENSE](LICENSE).

Built by Anshit.
