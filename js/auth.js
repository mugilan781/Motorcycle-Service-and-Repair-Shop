/* ==========================================================================
   ApexMoto — Authentication behaviour (Login / Signup)
   Frontend-only: mirrors the validation pattern used in js/main.js
   ([required] + .field.invalid + .f-err). No backend, no fake OAuth.
   ========================================================================== */
(() => {
  "use strict";
  const d = document;
  const root = d.documentElement;

  /* Re-apply persisted theme / direction (same keys as js/main.js). */
  try {
    const t = localStorage.getItem("amw-theme");
    if (t) root.dataset.theme = t;
    const dr = localStorage.getItem("amw-dir");
    if (dr) root.setAttribute("dir", dr);
  } catch (e) { /* storage unavailable — defaults from markup apply */ }

  if (d.body) d.body.classList.add("ready");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setBad = (input, bad) => {
    const host = input.closest(".field") || input;
    host.classList.toggle("invalid", bad);
    input.classList.toggle("invalid", bad);
    return !bad;
  };

  const note = (form, kind, msg) => {
    let el = form.querySelector(".auth-note");
    if (!el) {
      el = d.createElement("p");
      el.className = "auth-note";
      el.setAttribute("role", kind === "is-err" ? "alert" : "status");
      form.prepend(el);
    }
    el.className = "auth-note " + kind;
    el.setAttribute("role", kind === "is-err" ? "alert" : "status");
    el.textContent = msg;
  };

  /* ---- Password visibility toggles ---- */
  d.querySelectorAll(".auth-eye").forEach(btn => {
    const input = d.getElementById(btn.getAttribute("data-target"));
    if (!input) return;
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.classList.toggle("showing", show);
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      btn.setAttribute("aria-pressed", String(show));
      input.focus({ preventScroll: true });
    });
  });

  /* ---- Clear invalid state while typing ---- */
  d.querySelectorAll(".auth-form [required]").forEach(f => {
    f.addEventListener("input", () => setBad(f, false));
    f.addEventListener("change", () => setBad(f, false));
  });

  /* ---- “Registered” banner on the login page (after signup) ---- */
  const params = new URLSearchParams(location.search);
  const loginForm = d.getElementById("loginForm");
  if (loginForm && params.get("registered") === "1") {
    note(loginForm, "is-ok", "Account created — sign in with your new credentials to continue.");
  }

  /* ---- Login ---- */
  if (loginForm) {
    const email = d.getElementById("loginEmail");
    const pass = d.getElementById("loginPassword");
    const remember = d.getElementById("rememberMe");

    /* Pre-fill remembered email (frontend-only convenience). */
    try {
      const saved = localStorage.getItem("amw-remember");
      if (saved && email && !email.value) { email.value = saved; if (remember) remember.checked = true; }
    } catch (e) {}

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      let firstBad = null;

      if (!email.value.trim() || !EMAIL_RE.test(email.value.trim())) {
        ok = setBad(email, true); firstBad = firstBad || email;
      }
      if (!pass.value) {
        ok = setBad(pass, true) && ok; firstBad = firstBad || pass;
      }
      if (!ok) {
        note(loginForm, "is-err", "Please check the highlighted fields and try again.");
        if (firstBad) firstBad.focus();
        return;
      }

      /* Frontend-only session (no backend in this project). */
      try {
        const profile = { email: email.value.trim(), at: new Date().toISOString() };
        sessionStorage.setItem("amw-user", JSON.stringify(profile));
        if (remember && remember.checked) localStorage.setItem("amw-remember", profile.email);
        else localStorage.removeItem("amw-remember");
      } catch (err) {}

      note(loginForm, "is-ok", "Welcome back — taking you to ApexMoto…");
      setTimeout(() => { location.href = "index.html"; }, 1100);
    });
  }

  /* ---- Signup ---- */
  const signupForm = d.getElementById("signupForm");
  if (signupForm) {
    const name = d.getElementById("suName");
    const email = d.getElementById("suEmail");
    const phone = d.getElementById("suPhone");
    const pass = d.getElementById("suPassword");
    const confirm = d.getElementById("suConfirm");
    const terms = d.getElementById("suTerms");

    signupForm.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      let firstBad = null;
      const fail = input => { ok = false; setBad(input, true); firstBad = firstBad || input; };

      if (!name.value.trim() || name.value.trim().length < 2) fail(name);
      if (!email.value.trim() || !EMAIL_RE.test(email.value.trim())) fail(email);

      /* Phone is how the workshop confirms bookings — digits only check. */
      const digits = phone.value.replace(/\D/g, "");
      if (!phone.value.trim() || digits.length < 7 || digits.length > 15) fail(phone);

      if (!pass.value || pass.value.length < 8) fail(pass);
      if (!confirm.value || confirm.value !== pass.value) fail(confirm);

      const termsHost = terms.closest(".auth-terms");
      if (!terms.checked) {
        ok = false;
        termsHost.style.color = "var(--accent-2)";
        firstBad = firstBad || terms;
      } else {
        termsHost.style.color = "";
      }

      if (!ok) {
        note(signupForm, "is-err", "Please check the highlighted fields and try again.");
        if (firstBad) firstBad.focus();
        return;
      }

      /* Frontend-only: stash the profile, continue on the login page. */
      try {
        sessionStorage.setItem("amw-pending", JSON.stringify({
          name: name.value.trim(), email: email.value.trim(), phone: phone.value.trim()
        }));
      } catch (err) {}

      note(signupForm, "is-ok", "Account created — taking you to sign in…");
      setTimeout(() => { location.href = "login.html?registered=1"; }, 1100);
    });
  }

  /* ---- Social buttons: UI only — no OAuth backend in this project ---- */
  d.querySelectorAll("[data-social]").forEach(btn => {
    btn.addEventListener("click", () => {
      const form = btn.closest(".auth-card").querySelector(".auth-form");
      if (form) note(form, "is-err", "Social sign-in is not connected yet — please continue with email.");
    });
  });
})();
