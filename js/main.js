(() => {
  "use strict";
  const d = document;
  const root = d.documentElement;
  root.classList.add("js-live");
  const revealPage = () => { if (d.body) d.body.classList.add("ready"); };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", revealPage);
  else revealPage();
  setTimeout(revealPage, 900);
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FB = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520"><rect width="800" height="520" fill="#10151C"/><rect x="330" y="238" width="140" height="7" fill="#C62828"/><rect x="330" y="262" width="140" height="7" fill="#B08D57"/><text x="400" y="330" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="8" fill="#8C969F">APEX MOTO WORKS</text></svg>'
  );
  d.addEventListener("error", e => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fb) { t.dataset.fb = "1"; t.src = FB; }
  }, true);

  const applyTheme = t => {
    root.dataset.theme = t;
    store.set("amw-theme", t);
    d.querySelectorAll('[data-toggle="theme"]').forEach(b => b.setAttribute("aria-pressed", String(t === "light")));
  };
  applyTheme(store.get("amw-theme") || "dark");

  const applyDir = dir => {
    root.setAttribute("dir", dir);
    store.set("amw-dir", dir);
    d.querySelectorAll('[data-toggle="dir"]').forEach(b => {
      b.setAttribute("aria-pressed", String(dir === "rtl"));
      const l = b.querySelector(".dir-lbl");
      if (l) l.textContent = dir === "rtl" ? "LTR" : "RTL";
    });
    root.dispatchEvent(new CustomEvent("amw:dir"));
  };
  applyDir(store.get("amw-dir") || "ltr");

  d.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.toggle === "theme") applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
      else applyDir(root.getAttribute("dir") === "rtl" ? "ltr" : "rtl");
    });
  });

  const header = d.getElementById("siteHeader");
  const onScrollHdr = () => header && header.classList.toggle("scrolled", scrollY > 12);
  addEventListener("scroll", onScrollHdr, { passive:true }); onScrollHdr();

  const burger = d.getElementById("navToggle");
  const drawer = d.getElementById("navDrawer");
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove("open");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded","false");
    d.body.classList.remove("lock");
  };
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", String(open));
      d.body.classList.toggle("lock", open);
    });
    drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeDrawer));
  }

  d.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || a.target === "_blank") return;
    a.addEventListener("click", e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduced) return;
      e.preventDefault();
      d.body.classList.add("leave");
      setTimeout(() => location.href = href, 240);
    });
  });
  addEventListener("pageshow", e => { if (e.persisted) d.body.classList.remove("leave"); });

  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold:.14, rootMargin:"0px 0px -40px 0px" });
  d.querySelectorAll(".reveal,.reveal-x").forEach(el => io.observe(el));

  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    if (reduced) { el.textContent = end.toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec}); return; }
    const dur = 1800, t0 = performance.now();
    const fmt = n => n.toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});
    const step = t => {
      const p = Math.min((t - t0)/dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold:.5 });
  d.querySelectorAll("[data-count]").forEach(el => cio.observe(el));

  const toTop = d.getElementById("toTop");
  if (toTop) {
    const fg = toTop.querySelector(".ring-fg");
    const len = 2 * Math.PI * 25;
    if (fg) { fg.style.strokeDasharray = len; fg.style.strokeDashoffset = len; }
    const upd = () => {
      const max = d.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
      if (fg) fg.style.strokeDashoffset = len * (1 - p);
      toTop.classList.toggle("show", scrollY > 480);
    };
    addEventListener("scroll", upd, { passive:true }); upd();
    toTop.addEventListener("click", () => scrollTo({ top:0, behavior: reduced ? "auto" : "smooth" }));
  }

  d.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const heroSlider = s => {
    const slides = [...s.querySelectorAll(".hs-slide")];
    const dotsWrap = s.querySelector("[data-dots]");
    const prog = s.querySelector(".hs-progress span");
    const prev = s.querySelector("[data-prev]");
    const next = s.querySelector("[data-next]");
    let i = 0, timer = null, DUR = 6500;
    if (dotsWrap) slides.forEach((_, n) => {
      const b = d.createElement("button");
      b.className = "hs-dot"; b.setAttribute("aria-label", "Go to slide " + (n+1));
      b.addEventListener("click", () => go(n));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap ? [...dotsWrap.children] : [];
    const runProg = () => {
      if (!prog || reduced) return;
      prog.classList.remove("run"); void prog.offsetWidth;
      s.style.setProperty("--hs-dur", DUR + "ms");
      prog.classList.add("run");
    };
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((sl, k) => sl.classList.toggle("is-active", k === i));
      dots.forEach((dt, k) => dt.classList.toggle("on", k === i));
      const live = s.querySelector(".sr-only");
      if (live) live.textContent = "Slide " + (i+1) + " of " + slides.length;
      restart();
    };
    const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(i+1), DUR); runProg(); };
    prev && prev.addEventListener("click", () => go(i-1));
    next && next.addEventListener("click", () => go(i+1));
    s.addEventListener("mouseenter", () => clearInterval(timer));
    s.addEventListener("mouseleave", restart);
    s.addEventListener("focusin", () => clearInterval(timer));
    let sx = null;
    s.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive:true });
    s.addEventListener("touchend", e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 46) go(i + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive:true });
    go(0);
  };
  d.querySelectorAll("[data-slider]").forEach(heroSlider);

  const tstSlider = s => {
    const track = s.querySelector(".tst-track");
    const slides = track ? track.children : [];
    if (!track || !slides.length) return;
    let i = 0, timer = null, DUR = 6000;
    const render = () => {
      const flip = root.getAttribute("dir") === "rtl" ? 1 : -1;
      track.style.transform = "translateX(" + (flip * i * 100) + "%)";
      const c = s.parentElement.querySelector(".tst-count");
      if (c) c.innerHTML = "<b>0" + (i+1) + "</b> / 0" + slides.length;
    };
    const go = n => { i = (n + slides.length) % slides.length; render(); restart(); };
    const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(i+1), DUR); };
    s.querySelector("[data-prev]") && s.querySelector("[data-prev]").addEventListener("click", () => go(i-1));
    s.querySelector("[data-next]") && s.querySelector("[data-next]").addEventListener("click", () => go(i+1));
    s.addEventListener("mouseenter", () => clearInterval(timer));
    s.addEventListener("mouseleave", restart);
    root.addEventListener("amw:dir", render);
    render(); restart();
  };
  d.querySelectorAll("[data-tslider]").forEach(tstSlider);

  d.querySelectorAll("[data-acc]").forEach(group => {
    group.querySelectorAll(".acc-head").forEach(head => {
      head.addEventListener("click", () => {
        const item = head.closest(".acc-item");
        const open = item.classList.contains("open");
        group.querySelectorAll(".acc-item.open").forEach(o => {
          o.classList.remove("open");
          o.querySelector(".acc-head").setAttribute("aria-expanded","false");
        });
        if (!open) { item.classList.add("open"); head.setAttribute("aria-expanded","true"); }
      });
    });
  });

  d.querySelectorAll("[data-compare]").forEach(tbl => {
    if (!matchMedia("(pointer:fine)").matches) return;
    const apply = (idx, on) => tbl.querySelectorAll("tr").forEach(tr => {
      const c = tr.cells[idx];
      if (c) c.classList.toggle("hl-cell", on);
    });
    tbl.addEventListener("mouseover", e => {
      const cell = e.target.closest("td,th");
      if (cell) [...cell.parentElement.cells].forEach((c,i) => apply(i, i === cell.cellIndex));
    });
    tbl.addEventListener("mouseleave", () => apply(-1, false));
  });

  d.querySelectorAll("[data-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      let firstBad = null;
      form.querySelectorAll("[required]").forEach(f => {
        const bad = !f.checkValidity();
        const host = f.closest(".field, .check") || f;
        host.classList.toggle("invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) { firstBad.focus(); return; }
      form.classList.add("sent");
      const ok = form.querySelector(".form-ok");
      if (ok) ok.setAttribute("tabindex","-1"), ok.focus({ preventScroll:false });
    });
    form.querySelectorAll("[required]").forEach(f => {
      f.addEventListener("input", () => (f.closest(".field, .check") || f).classList.remove("invalid"));
    });
    form.querySelectorAll("[data-reset-form]").forEach(b => b.addEventListener("click", () => {
      form.reset(); form.classList.remove("sent");
    }));
  });

  d.querySelectorAll('input[type="date"][data-mintoday]').forEach(inp => {
    inp.min = new Date().toISOString().split("T")[0];
  });

  const cd = d.querySelector("[data-countdown]");
  if (cd) {
    const T = new Date();
    T.setDate(T.getDate() + 9); T.setHours(9,0,0,0);
    const u = n => String(Math.max(n,0)).padStart(2,"0");
    const tick = () => {
      let diff = Math.max(T - new Date(), 0) / 1000;
      const dd = Math.floor(diff/86400); diff %= 86400;
      const hh = Math.floor(diff/3600); diff %= 3600;
      const mm = Math.floor(diff/60), ss = Math.floor(diff%60);
      cd.querySelector('[data-unit="d"]').textContent = u(dd);
      cd.querySelector('[data-unit="h"]').textContent = u(hh);
      cd.querySelector('[data-unit="m"]').textContent = u(mm);
      cd.querySelector('[data-unit="s"]').textContent = u(ss);
    };
    tick(); setInterval(tick, 1000);
  }

  const nfInput = d.querySelector("[data-filter]");
  if (nfInput) {
    const items = [...d.querySelectorAll("[data-filter-item]")];
    nfInput.addEventListener("input", () => {
      const q = nfInput.value.trim().toLowerCase();
      items.forEach(it => it.classList.toggle("hide", q && !it.textContent.toLowerCase().includes(q)));
    });
  }

  /* Profile / account dropdown (auth integration — additive only). */
  const pWrap = d.querySelector(".profile-wrap");
  const pBtn = d.querySelector(".profile-btn");
  const pMenu = d.querySelector(".profile-menu");
  if (pWrap && pBtn && pMenu) {
    const setOpen = open => {
      pWrap.classList.toggle("open", open);
      pBtn.setAttribute("aria-expanded", String(open));
    };
    pBtn.addEventListener("click", e => { e.stopPropagation(); setOpen(!pWrap.classList.contains("open")); });
    d.addEventListener("click", e => { if (!pWrap.contains(e.target)) setOpen(false); });
    d.addEventListener("keydown", e => {
      if (e.key === "Escape" && pWrap.classList.contains("open")) { setOpen(false); pBtn.focus({ preventScroll:true }); }
    });
    pMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  }
})();
