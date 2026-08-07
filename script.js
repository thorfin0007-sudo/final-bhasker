const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const videoElements = Array.from(document.querySelectorAll("main video"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const progressBars = Array.from(document.querySelectorAll(".progress-bar[data-progress]"));
const countItems = Array.from(document.querySelectorAll("[data-count]"));
const videoPosterMap = {
  "images/inauguration-clip.mp4": "images/thumbnails/inauguration-clip.svg",
  "videos/motivational-lecture-clc-sikar-dec-2024.mp4":
    "images/thumbnails/motivational-lecture-clc-sikar-dec-2024.svg",
  "videos/interview-cmda-ironman-india-vikram-dev-dogra-feb-2025.mp4":
    "images/thumbnails/interview-cmda-ironman-india-vikram-dev-dogra-feb-2025.svg",
  "videos/ssb-interview-techniques-aps-sp-marg-lucknow-may-2025.mp4":
    "images/thumbnails/ssb-interview-techniques-aps-sp-marg-lucknow-may-2025.svg",
  "videos/motivational-talk-aps-noida-oct-2025.mp4":
    "images/thumbnails/motivational-talk-aps-noida-oct-2025.svg",
  "videos/leadership-session-warriors-defence-academy-lucknow-may-2026.mp4":
    "images/thumbnails/leadership-session-warriors-defence-academy-lucknow-may-2026.svg",
  "videos/interaction-ssb-aspirants-hq-chetak-corps-jyoti-khanna-may-2026.mp4":
    "images/thumbnails/interaction-ssb-aspirants-hq-chetak-corps-jyoti-khanna-may-2026.svg",
  "videos/interaction-ssb-aspirants-hq-chetak-corps-ruchika-b-gupta-jun-2026.mp4":
    "images/thumbnails/interaction-ssb-aspirants-hq-chetak-corps-ruchika-b-gupta-jun-2026.svg",
  "videos/interaction-ssb-aspirants-hq-chetak-corps-col-bhasker-jun-2026.mp4":
    "images/thumbnails/interaction-ssb-aspirants-hq-chetak-corps-col-bhasker-jun-2026.svg",
  "videos/interaction-students-kv-no1-bhatinda-cantt-jun-2026.mp4":
    "images/thumbnails/interaction-students-kv-no1-bhatinda-cantt-jun-2026.svg",
  "videos/current-affairs-discussion-ssb-guide-def-academy-ambala-jul-2026.mp4":
    "images/thumbnails/current-affairs-discussion-ssb-guide-def-academy-ambala-jul-2026.svg",
};

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

if (videoElements.length) {
  const resolveVideoPoster = (video) => {
    const source = video.querySelector("source")?.getAttribute("src") || video.getAttribute("src");
    return (source && videoPosterMap[source]) || "images/video-poster.svg";
  };

  const capturePosterFrame = async (video) => {
    if (video.dataset.posterReady === "true") {
      return;
    }

    video.setAttribute("poster", resolveVideoPoster(video));

    const ensureMetadata = () =>
      new Promise((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          resolve();
          return;
        }

        video.addEventListener("loadedmetadata", resolve, { once: true });
      });

    await ensureMetadata();

    const targetTime =
      Number.isFinite(video.duration) && video.duration > 1
        ? Math.min(1.5, Math.max(0.25, video.duration * 0.12))
        : 0.25;

    await new Promise((resolve) => {
      const finish = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = video.videoWidth || 1280;
          const height = video.videoHeight || 720;

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");
          if (!context) {
            resolve();
            return;
          }

          context.drawImage(video, 0, 0, width, height);
          const posterDataUrl = canvas.toDataURL("image/jpeg", 0.84);
          video.setAttribute("poster", posterDataUrl);
          video.dataset.posterReady = "true";
        } catch (error) {
          // Keep the fallback poster if frame capture fails.
        }

        resolve();
      };

      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        finish();
      };

      video.addEventListener("seeked", onSeeked);

      try {
        video.currentTime = targetTime;
      } catch (error) {
        video.removeEventListener("seeked", onSeeked);
        finish();
      }
    });
  };

  const buildVideoThumbnails = async () => {
    for (const video of videoElements) {
      await capturePosterFrame(video);
    }
  };

  buildVideoThumbnails();
}
