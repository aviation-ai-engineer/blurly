const KEY_ON = "wwbBlurOn";
const KEY_PRESENT = "wwbPresent";
const KEY_SPOTLIGHT = "wwbSpotlight";
const KEY_ALIAS = "wwbAlias";
const KEY_PRO = "wwbPro";
const WA_HOST = "web.whatsapp.com";

// Build flag — must match content.js. false in the published build.
const PRO_DEFAULT = false;

const els = {
  ready: document.getElementById("wwb-state-ready"),
  wrongsite: document.getElementById("wwb-state-wrongsite"),
  superseded: document.getElementById("wwb-state-superseded"),
  error: document.getElementById("wwb-state-error"),
  toggle: document.getElementById("wwb-toggle"),
  present: document.getElementById("wwb-present"),
  spotlight: document.getElementById("wwb-spotlight"),
  alias: document.getElementById("wwb-alias"),
  proSection: document.getElementById("wwb-pro-section"),
  proBadge: document.getElementById("wwb-pro-badge"),
  unlock: document.getElementById("wwb-unlock"),
  openWa: document.getElementById("wwb-open-wa"),
  toast: document.getElementById("wwb-toast"),
};

function show(panel) {
  [els.ready, els.wrongsite, els.superseded, els.error].forEach((p) =>
    p.classList.add("wwb-hidden")
  );
  panel.classList.remove("wwb-hidden");
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove("wwb-hidden");
  setTimeout(() => els.toast.classList.add("wwb-hidden"), 1400);
}

els.openWa.addEventListener("click", () => {
  chrome.tabs.create({ url: `https://${WA_HOST}/` });
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab || !tab.url) {
    show(els.error);
    return;
  }

  let host;
  try {
    host = new URL(tab.url).hostname;
  } catch {
    show(els.error);
    return;
  }

  if (host !== WA_HOST) {
    show(els.wrongsite);
    return;
  }

  chrome.storage.local.get(
    [KEY_ON, KEY_PRESENT, KEY_SPOTLIGHT, KEY_ALIAS, KEY_PRO, "wwbSuppressed"],
    (res) => {
      if (chrome.runtime.lastError) {
        show(els.error);
        return;
      }
      // The content script stood down because Pro is installed — say so rather
      // than offering toggles that would do nothing.
      if (res.wwbSuppressed && PRO_DEFAULT === false) {
        show(els.superseded);
        return;
      }
      els.toggle.checked = !!res[KEY_ON];
      els.present.checked = !!res[KEY_PRESENT];
      els.spotlight.checked = !!res[KEY_SPOTLIGHT];
      els.alias.checked = !!res[KEY_ALIAS];
      setPro(!!res[KEY_PRO] || PRO_DEFAULT);
      show(els.ready);
    }
  );
});

function setPro(pro) {
  els.proSection.classList.toggle("wwb-locked", !pro);
  els.proBadge.textContent = pro ? "PRO ✓" : "PRO";
}

// The three modes are independent — each covers the screen on its own, so
// switching one must never flip another.
els.toggle.addEventListener("change", () => {
  const on = els.toggle.checked;
  chrome.storage.local.set({ [KEY_ON]: on }, () =>
    toast(on ? "Blur turned on" : "Blur turned off")
  );
});

els.present.addEventListener("change", () => {
  const on = els.present.checked;
  chrome.storage.local.set({ [KEY_PRESENT]: on }, () =>
    toast(on ? "Presenting mode on — safe to share" : "Presenting mode off")
  );
});

els.spotlight.addEventListener("change", () => {
  const on = els.spotlight.checked;
  chrome.storage.local.set({ [KEY_SPOTLIGHT]: on }, () =>
    toast(on ? "Spotlight on — only this chat shows" : "Spotlight off")
  );
});

els.alias.addEventListener("change", () => {
  const on = els.alias.checked;
  chrome.storage.local.set({ [KEY_ALIAS]: on }, () =>
    toast(on ? "Names aliased" : "Real names restored")
  );
});

// Pro is a separate build, delivered after purchase — there is no in-app
// unlock, no key to validate, and no network call anywhere in this extension.
// Razorpay collects the buyer's email at checkout; that's how the Pro build
// gets sent. ponytail: no email field here, the payment page already asks.
const BUY_URL = "https://rzp.io/rzp/SRLCfoV";

els.unlock.addEventListener("click", () => {
  chrome.tabs.create({ url: BUY_URL });
});
