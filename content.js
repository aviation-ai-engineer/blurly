(() => {
  const KEY_ON = "wwbBlurOn";
  const KEY_PRESENT = "wwbPresent";
  const KEY_SPOTLIGHT = "wwbSpotlight";
  const KEY_ALIAS = "wwbAlias";
  const KEY_PRO = "wwbPro";

  // Build flag. false in the free build; the Pro build ships it true.
  const PRO_DEFAULT = false;

  // Both builds drive the same classes, DOM nodes and shortcuts, so with both
  // installed they fight — every keypress toggles twice and cancels out. Pro
  // claims the page; the free copy then stands down and touches nothing.
  const BUILD = PRO_DEFAULT ? "pro" : "free";
  if (BUILD === "pro") document.documentElement.dataset.blurlyBuild = "pro";

  const suppressed = () =>
    BUILD === "free" && document.documentElement.dataset.blurlyBuild === "pro";

  let saved = {
    on: false,
    present: false,
    spotlight: false,
    alias: false,
    pro: false,
  };
  let dirty = false; // user toggled something before storage answered

  // ---- Alias state. In memory only, on purpose: writing real contact names to
  // disk would be a bigger privacy step than showing them on screen. Aliases
  // stay stable for the session, which is all a call needs.
  const aliasMap = new Map();
  let aliasSeq = 0;

  function aliasFor(real) {
    if (!aliasMap.has(real)) {
      const i = aliasSeq++;
      const letter = String.fromCharCode(65 + (i % 26));
      const suffix = i >= 26 ? String(Math.floor(i / 26) + 1) : "";
      aliasMap.set(real, `Client ${letter}${suffix}`);
    }
    return aliasMap.get(real);
  }

  const proOn = (flag) => saved.pro && flag;

  function render() {
    if (suppressed()) return;
    const root = document.documentElement;
    const spotlight = proOn(saved.spotlight) && !saved.present;
    root.classList.toggle("wwb-blur-on", saved.on);
    root.classList.toggle("wwb-present", saved.present);
    root.classList.toggle("wwb-spotlight", spotlight);
    root.classList.toggle("wwb-alias", proOn(saved.alias));
    updateIndicator(saved.present, spotlight);
    observeAlias();
    syncAlias();
  }

  function updateIndicator(present, spotlight) {
    const el = document.getElementById("wwb-indicator");
    if (!el) return;
    let label = "Blur on";
    if (present) label = "Presenting — hidden";
    else if (spotlight) label = "Spotlight — list hidden";
    el.lastChild.textContent = label;
  }

  // ---- Fail-safe: if the panes we target aren't in the DOM, blur the root
  // instead of silently showing everything. Never fail open.
  function checkTargets() {
    if (suppressed()) return;
    const have = !!(document.getElementById("pane-side") || document.getElementById("main"));
    document.documentElement.classList.toggle("wwb-fallback", saved.on && !have);
  }

  // ---- Catch-all for transient overlays: incoming-message toasts and popups
  // render outside the panels we target and leak names plus message text.
  // Enumerating WhatsApp's containers always lags their UI, so instead tag
  // anything positioned inside #app that isn't part of a known panel.
  const KNOWN_PANELS = '#pane-side, #main, [data-testid^="drawer-"]';

  function sweepOverlays() {
    const app = document.getElementById("app");
    if (!app) return;

    const found = [];
    const stack = [...app.children];
    const maxArea = innerWidth * innerHeight * 0.5;

    while (stack.length) {
      const el = stack.pop();
      if (el.id && el.id.startsWith("wwb-")) continue;
      if (el.matches(KNOWN_PANELS)) continue;
      // An ancestor of a panel — descend, never tag, or we'd blur the layout.
      if (el.querySelector(KNOWN_PANELS)) {
        stack.push(...el.children);
        continue;
      }
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const positioned = s.position === "fixed" || s.position === "absolute";
      // Size guard: toasts are small. Anything huge is layout, not an overlay.
      if (positioned && r.width > 100 && r.height > 40 && r.width * r.height < maxArea) {
        found.push(el);
        continue;
      }
      stack.push(...el.children);
    }

    document.querySelectorAll(".wwb-overlay").forEach((el) => {
      if (!found.includes(el)) el.classList.remove("wwb-overlay");
    });
    found.forEach((el) => el.classList.add("wwb-overlay"));
  }

  // Record whether we stood down, so the free popup can say so instead of
  // showing toggles that quietly do nothing.
  let wasSuppressed = null;

  function noteSuppression() {
    const s = suppressed();
    if (s === wasSuppressed) return;
    wasSuppressed = s;
    if (!alive()) return;
    try {
      chrome.storage.local.set({ wwbSuppressed: s });
    } catch {
      /* context gone */
    }
  }

  // ponytail: 1s poll instead of a MutationObserver — WhatsApp churns the DOM
  // constantly and an observer for this costs more than it saves.
  const targetPoll = setInterval(() => {
    if (!alive()) return clearInterval(targetPoll);
    noteSuppression();
    if (suppressed()) return;
    checkTargets();
    if (saved.on) sweepOverlays();
    // The observer can lose a race against WhatsApp's re-renders and leave rows
    // un-aliased. This sweep guarantees convergence within a second.
    if (proOn(saved.alias)) syncAlias();
  }, 1000);

  // ---- Alias: swap contact names for stable pseudonyms. The original is kept
  // on the node so turning alias off restores it.
  // The chat list and drawers carry the name in a title attribute; the thread
  // header does not — it's plain text under a testid. Both must be covered, or
  // the list says "Client A" while the header still names them.
  const NAME_NODES = [
    "#pane-side span[title]",
    "#main header span[title]",
    "[data-testid^='drawer-'] span[title]",
    "[data-testid='conversation-info-header-chat-title']",
  ].join(", ");

  const nameOf = (el) =>
    el.hasAttribute("title") ? el.getAttribute("title") : el.textContent.trim();

  function syncAlias() {
    const on = proOn(saved.alias);
    const nodes = document.querySelectorAll(NAME_NODES);

    nodes.forEach((el) => {
      const current = nameOf(el);

      // The chat list recycles DOM nodes, so a leftover wwbReal may belong to a
      // different person. Only trust it while the node still shows the alias we
      // wrote; otherwise WhatsApp has re-rendered it with a real name again.
      const ours = el.dataset.wwbAlias && current === el.dataset.wwbAlias;

      if (on) {
        const real = ours ? el.dataset.wwbReal : current;
        if (!real) return;
        const alias = aliasFor(real);
        if (current === alias) return;
        el.dataset.wwbReal = real;
        el.dataset.wwbAlias = alias;
        el.textContent = alias;
        if (el.hasAttribute("title")) el.setAttribute("title", alias);
      } else if (el.dataset.wwbReal) {
        if (ours) {
          el.textContent = el.dataset.wwbReal;
          if (el.hasAttribute("title")) el.setAttribute("title", el.dataset.wwbReal);
        }
        delete el.dataset.wwbReal;
        delete el.dataset.wwbAlias;
      }
    });
  }

  // The chat list virtualises and re-renders on every scroll and new message,
  // so aliasing needs an observer to survive. Throttled to one pass per frame.
  let aliasQueued = false;
  const aliasObserver = new MutationObserver(() => {
    if (!proOn(saved.alias) || aliasQueued) return;
    aliasQueued = true;
    requestAnimationFrame(() => {
      aliasQueued = false;
      syncAlias();
    });
  });

  // Only watch the DOM while aliasing is actually on. WhatsApp churns its tree
  // constantly, so an idle observer here costs real CPU for nothing.
  let observing = false;

  function observeAlias() {
    const want = proOn(saved.alias);
    if (want === observing) return;
    const target = document.getElementById("app") || document.body;
    if (!target) return;

    if (want) aliasObserver.observe(target, { childList: true, subtree: true, characterData: true });
    else aliasObserver.disconnect();
    observing = want;
  }

  function mountChrome() {
    const body = document.body;
    if (!body || suppressed()) return;

    if (!document.getElementById("wwb-indicator")) {
      const el = document.createElement("div");
      el.id = "wwb-indicator";
      const dot = document.createElement("span");
      dot.className = "wwb-dot";
      el.appendChild(dot);
      el.appendChild(document.createTextNode("Blur on"));
      body.appendChild(el);
    }

    if (!document.getElementById("wwb-curtain")) {
      const c = document.createElement("div");
      c.id = "wwb-curtain";
      c.textContent = "Hidden — Ctrl+Shift+U to show";
      body.appendChild(c);
    }

    render();
  }

  // After an extension reload or a Web Store auto-update, this script is
  // orphaned and every chrome.* call throws "Extension context invalidated".
  // The injected CSS survives, so the page stays covered — we just stop
  // persisting rather than spraying errors.
  function alive() {
    try {
      return !!(chrome.runtime && chrome.runtime.id);
    } catch {
      return false;
    }
  }

  function save() {
    dirty = true;
    if (!alive()) return;
    try {
      chrome.storage.local.set({
        [KEY_ON]: saved.on,
        [KEY_PRESENT]: saved.present,
        [KEY_SPOTLIGHT]: saved.spotlight,
        [KEY_ALIAS]: saved.alias,
      });
    } catch {
      /* context died between the check and the call */
    }
  }

  // The three modes are independent: each covers the screen on its own, so
  // none of them needs to switch another on. All four are plain, deliberate
  // toggles — nothing here ever fires on its own.
  function toggleBlur() {
    saved.on = !saved.on;
    render();
    save();
  }

  function togglePresent() {
    saved.present = !saved.present;
    render();
    save();
  }

  function toggleSpotlight() {
    if (!saved.pro) return;
    saved.spotlight = !saved.spotlight;
    render();
    save();
  }

  function toggleAlias() {
    if (!saved.pro) return;
    saved.alias = !saved.alias;
    render();
    save();
  }

  // ---- Shortcuts ----
  const ACTIONS = {
    blur: toggleBlur,
    present: togglePresent,
    spotlight: toggleSpotlight,
    alias: toggleAlias,
  };

  // Handled here on the page rather than through chrome.commands: a bound
  // command is consumed by Chrome browser-side, so if the relay to this script
  // misses, the keypress vanishes with nothing to fall back on. Ctrl+Shift also
  // avoids Alt+Shift, which Windows uses to switch keyboard layout and eats
  // before the page ever sees it.
  const KEY_ACTIONS = {
    KeyY: "blur",
    KeyU: "present",
    KeyG: "spotlight",
    KeyK: "alias",
  };

  document.addEventListener(
    "keydown",
    (e) => {
      if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey || suppressed()) return;
      const fn = ACTIONS[KEY_ACTIONS[e.code]];
      if (!fn) return;
      e.preventDefault();
      e.stopPropagation();
      fn();
    },
    true // capture: run before WhatsApp's own handlers can swallow it
  );

  // ---- Boot ----
  const ALL_KEYS = [KEY_ON, KEY_PRESENT, KEY_SPOTLIGHT, KEY_ALIAS, KEY_PRO];

  const boot = (res) => {
    saved.pro = !!res[KEY_PRO] || PRO_DEFAULT;

    if (dirty) {
      // A shortcut fired while WhatsApp was still loading, before storage
      // answered. The user's intent wins — persist it instead of overwriting.
      save();
    } else {
      saved.on = !!res[KEY_ON];
      saved.present = !!res[KEY_PRESENT];
      saved.spotlight = !!res[KEY_SPOTLIGHT];
      saved.alias = !!res[KEY_ALIAS];
    }

    render();
    checkTargets();
  };

  try {
    chrome.storage.local.get(ALL_KEYS, boot);
  } catch {
    boot({}); // orphaned script: run with defaults so the page still responds
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (KEY_ON in changes) saved.on = !!changes[KEY_ON].newValue;
    if (KEY_PRESENT in changes) saved.present = !!changes[KEY_PRESENT].newValue;
    if (KEY_SPOTLIGHT in changes) saved.spotlight = !!changes[KEY_SPOTLIGHT].newValue;
    if (KEY_ALIAS in changes) saved.alias = !!changes[KEY_ALIAS].newValue;
    if (KEY_PRO in changes) saved.pro = !!changes[KEY_PRO].newValue || PRO_DEFAULT;
    render();
    checkTargets();
  });

  if (document.body) mountChrome();
  else document.addEventListener("DOMContentLoaded", mountChrome);
})();
