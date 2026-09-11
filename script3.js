/* ─── Scroll-driven frame sequence — Gorilla Turning Head ─── */
(function () {
  'use strict';

  const canvas      = document.getElementById('video-canvas');
  const ctx         = canvas.getContext('2d');
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loader-bar');
  const loaderLabel = document.getElementById('loader-label');

  // Frames em gorilla2/frames/
  const FRAME_COUNT = 192;
  const FRAME_PATH  = 'gorilla2/frames/';
  const images      = new Array(FRAME_COUNT);

  let loadedCount = 0;
  let ready       = false;
  let rafId       = null;

  function setCanvasSize(img) {
    canvas.width  = img.naturalWidth  || window.innerWidth;
    canvas.height = img.naturalHeight || window.innerHeight;
  }

  // ── Pré-carrega todos os frames ──
  function preloadFrames() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const idx = i;

      img.onload = () => {
        if (idx === 0) {
          setCanvasSize(img);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        loadedCount++;
        const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.width   = pct + '%';
        loaderLabel.textContent = `Carregando… ${pct}%`;
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };

      img.src = `${FRAME_PATH}frame_${String(i).padStart(4, '0')}.jpg`;
      images[idx] = img;
    }
  }

  function onAllLoaded() {
    ready = true;
    loader.classList.add('hidden');
    drawFrame(0);
    renderCurrentFrame();
  }

  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // ── Calcula frame pelo scroll ──
  function renderCurrentFrame() {
    if (!ready) return;
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fraction  = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
    const idx       = Math.min(FRAME_COUNT - 1, Math.floor(fraction * FRAME_COUNT));
    drawFrame(idx);
  }

  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      renderCurrentFrame();
      rafId = null;
    });
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (images[0]?.complete) setCanvasSize(images[0]);
    renderCurrentFrame();
  });

  // ── Intersection Observer — revela os painéis ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const panel = e.target.querySelector('.animate-in');
        if (!panel) return;
        if (e.isIntersecting) panel.classList.add('visible');
        else                  panel.classList.remove('visible');
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.22 }
  );

  document.querySelectorAll('.story-section').forEach((s) => observer.observe(s));

  preloadFrames();
})();
