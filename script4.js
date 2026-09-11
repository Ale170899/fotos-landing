/* ─── video-scroll-hero skill — script4.js ─── */
(function () {
  'use strict';

  const canvas      = document.getElementById('video-canvas');
  const ctx         = canvas.getContext('2d');
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loader-bar');
  const loaderLabel = document.getElementById('loader-label');

  const FRAME_COUNT = 192;          // 192 frames | 24fps | 8.0s
  const FRAME_PATH  = 'index4/frames/';
  const images      = new Array(FRAME_COUNT);

  let loadedCount = 0;
  let ready       = false;
  let rafId       = null;

  // ── Dimensiona o canvas ao 1.º frame ──
  function setCanvasSize(img) {
    canvas.width  = img.naturalWidth  || window.innerWidth;
    canvas.height = img.naturalHeight || window.innerHeight;
  }

  // ── Pré-carregamento total ──
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

  // ── Tudo carregado ──
  function onAllLoaded() {
    ready = true;
    loader.classList.add('hidden');
    drawFrame(0);
    renderCurrentFrame();
  }

  // ── Desenha frame no canvas ──
  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // ── Calcula frame pela posição de scroll ──
  function renderCurrentFrame() {
    if (!ready) return;
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fraction  = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
    const idx       = Math.min(FRAME_COUNT - 1, Math.floor(fraction * FRAME_COUNT));
    drawFrame(idx);
  }

  // ── Scroll com rAF (throttle) ──
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      renderCurrentFrame();
      rafId = null;
    });
  }, { passive: true });

  // ── Resize ──
  window.addEventListener('resize', () => {
    if (images[0]?.complete) setCanvasSize(images[0]);
    renderCurrentFrame();
  });

  // ── IntersectionObserver — revela painéis ao entrar na viewport ──
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

  // ── Start ──
  preloadFrames();
})();
