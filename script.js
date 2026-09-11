/* ─── Script de Sequência de Imagens Controlado por Scroll ─── */
(function () {
  'use strict';

  const canvas      = document.getElementById('video-canvas');
  const ctx         = canvas.getContext('2d');
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loader-bar');
  const loaderLabel = document.getElementById('loader-label');

  const FRAME_COUNT = 240;
  const images      = new Array(FRAME_COUNT);
  let   loadedCount = 0;
  let   ready       = false;
  let   rafId       = null;

  // ── 1. Definir dimensões do canvas ao carregar o 1.º frame ──
  function setCanvasSize(img) {
    canvas.width  = img.naturalWidth  || img.width  || window.innerWidth;
    canvas.height = img.naturalHeight || img.height || window.innerHeight;
  }

  // ── 2. Pré-carregamento de todos os frames ──
  function preloadFrames() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const idx = i; // captura por closure

      img.onload = () => {
        if (idx === 0) {
          setCanvasSize(img);
          ctx.drawImage(img, 0, 0);
        }
        loadedCount++;
        const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.width   = pct + '%';
        loaderLabel.textContent = `Carregando frames… ${pct}%`;

        if (loadedCount === FRAME_COUNT) {
          onAllLoaded();
        }
      };

      img.onerror = () => {
        // conta mesmo se falhar para não travar
        loadedCount++;
        if (loadedCount === FRAME_COUNT) onAllLoaded();
      };

      img.src = `frames/frame_${String(i).padStart(4, '0')}.jpg`;
      images[idx] = img;
    }
  }

  // ── 3. Quando tudo carregou ──
  function onAllLoaded() {
    ready = true;
    loader.classList.add('hidden');
    drawFrame(0);
    // Renderiza o frame correto caso o usuário já tenha rolado
    renderCurrentFrame();
  }

  // ── 4. Desenhar um frame no canvas ──
  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // ── 5. Calcular e renderizar o frame conforme o scroll ──
  function renderCurrentFrame() {
    if (!ready) return;
    const scrollTop    = window.scrollY;
    const maxScroll    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFrac   = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const frameIndex   = Math.min(FRAME_COUNT - 1, Math.floor(scrollFrac * FRAME_COUNT));
    drawFrame(frameIndex);
  }

  // ── 6. Listener de scroll com rAF para suavidade ──
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      renderCurrentFrame();
      rafId = null;
    });
  }, { passive: true });

  // ── 7. Resize: reajustar canvas ──
  window.addEventListener('resize', () => {
    if (images[0] && images[0].complete) setCanvasSize(images[0]);
    renderCurrentFrame();
  });

  // ── 8. Intersection Observer: revelar seções ──
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.25,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const panel = entry.target.querySelector('.animate-in');
      if (!panel) return;
      if (entry.isIntersecting) {
        panel.classList.add('visible');
      } else {
        // Remove para repetir o fade ao voltar
        panel.classList.remove('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.story-section').forEach((section) => {
    observer.observe(section);
  });

  // ── 9. Iniciar ──
  preloadFrames();
})();
