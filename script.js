const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const progressBars = Array.from(document.querySelectorAll(".progress-bar[data-progress]"));
const countItems = Array.from(document.querySelectorAll("[data-count]"));

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      const activeId = `#${visibleEntry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === activeId);
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-15% 0px -45% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

if (progressBars.length) {
  requestAnimationFrame(() => {
    progressBars.forEach((bar) => {
      const progress = Number(bar.dataset.progress || 0);
      bar.style.width = `${Math.max(0, Math.min(progress, 100))}%`;
    });
  });
}

if (countItems.length) {
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const target = Number(element.dataset.count || 0);
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          element.textContent = String(Math.round(target * progress));

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        observer.unobserve(element);
      });
    },
    {
      threshold: 0.4,
    }
  );

  countItems.forEach((item) => countObserver.observe(item));
}
