// Security Crossfire blog: progress bar, table of contents tracking, copy buttons, category filter.
(() => {
  // Reading progress
  const bar = document.querySelector(".progress span");
  const prose = document.querySelector(".prose");
  if (bar && prose) {
    const update = () => {
      const r = prose.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      bar.style.transform = `scaleX(${p})`;
    };
    let queued = false;
    addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  // Highlight current section in the table of contents
  const tocLinks = [...document.querySelectorAll(".toc a")];
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const targets = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          tocLinks.forEach((a) => a.removeAttribute("aria-current"));
          byId.get(e.target.id)?.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-90px 0px -70% 0px" }
    );
    targets.forEach((t) => io.observe(t));
  }

  // Copy buttons on code blocks and IOC tables
  const addCopy = (host, getText, label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "copy";
    b.setAttribute("aria-live", "polite");
    b.textContent = label;
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(getText());
        b.textContent = "Copied";
        b.dataset.done = "";
      } catch {
        b.textContent = "Copy failed";
      }
      setTimeout(() => { b.textContent = label; delete b.dataset.done; }, 1800);
    });
    host.appendChild(b);
  };
  document.querySelectorAll(".prose pre").forEach((pre) => {
    // Wrap so the button stays put while long lines scroll sideways
    const wrap = document.createElement("div");
    wrap.className = "code";
    pre.before(wrap);
    wrap.appendChild(pre);
    addCopy(wrap, () => pre.querySelector("code")?.innerText ?? pre.innerText, "Copy");
  });
  document.querySelectorAll("[data-ioc]").forEach((box) =>
    addCopy(box, () => [...box.querySelectorAll("tbody tr")].map((tr) => tr.cells[0].innerText.trim()).join("\n"), "Copy indicators")
  );

  // Category filter on the index
  const filters = document.querySelector(".filters");
  if (filters) {
    const rows = [...document.querySelectorAll(".rows li")];
    const present = new Set(rows.map((r) => r.dataset.cat));
    filters.querySelectorAll("[data-filter]").forEach((b) => {
      if (b.dataset.filter !== "all" && !present.has(b.dataset.filter)) b.remove();
    });
    if (filters.querySelectorAll("[data-filter]").length > 2) filters.hidden = false;
    const apply = (key, push) => {
      const b = filters.querySelector(`[data-filter="${key}"]`) || filters.querySelector('[data-filter="all"]');
      filters.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      rows.forEach((r) => (r.hidden = b.dataset.filter !== "all" && r.dataset.cat !== b.dataset.filter));
      if (push) {
        const url = new URL(location.href);
        b.dataset.filter === "all" ? url.searchParams.delete("category") : url.searchParams.set("category", b.dataset.filter);
        history.replaceState(null, "", url);
      }
    };
    filters.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (b) apply(b.dataset.filter, true);
    });
    apply(new URLSearchParams(location.search).get("category") || "all", false);
  }
})();
