document.addEventListener('DOMContentLoaded', () => {
  // Configuração dos Vídeos
  const VIDEOS_COUNT = 3;
  const FRAMES_PER_VIDEO = 240; 
  const TOTAL_FRAMES = VIDEOS_COUNT * FRAMES_PER_VIDEO;
  const BASE_PATH = 'kratos/frames/';
  
  // Elementos
  const canvas = document.getElementById('video-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const folds = document.querySelectorAll('.fold');
  
  // Estado
  // images é um array de arrays: images[videoIndex][frameIndex]
  const images = [[], [], []];
  let loadedCount = 0;
  let currentVideoIndex = -1;
  let currentFrameIndex = -1;
  let ticking = false; 
  
  // 1. Pré-carregamento de todos os frames
  function preloadImages() {
    for (let v = 0; v < VIDEOS_COUNT; v++) {
      for (let i = 0; i < FRAMES_PER_VIDEO; i++) {
        const img = new Image();
        const frameNum = i.toString().padStart(4, '0');
        img.src = `${BASE_PATH}v${v}/frame_${frameNum}.jpg`;
        
        img.onload = onImageLoaded;
        img.onerror = () => {
          console.error(`Erro ao carregar frame: ${img.src}`);
          onImageLoaded(); // Incrementa mesmo com erro para não travar
        };
        
        images[v].push(img);
      }
    }
  }

  function onImageLoaded() {
    loadedCount++;
    
    // Atualiza UI do loader
    const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
    loaderBar.style.width = `${percent}%`;
    loaderPercent.textContent = `${percent}%`;
    
    // Quando todos carregarem
    if (loadedCount === TOTAL_FRAMES) {
      initCanvas();
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 800); 
      }, 300);
    }
  }
  
  // 2. Configuração inicial do Canvas
  function initCanvas() {
    resizeCanvas();
    drawFrame(0, 0); // Desenha o frame 0 do vídeo 0 inicialmente
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawFrame(currentVideoIndex, currentFrameIndex);
    });
    
    window.addEventListener('scroll', onScroll, { passive: true });
    // Chama o onScroll uma vez para ajustar ao recarregar a página
    onScroll();
  }
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // 3. Desenhar Frame no Canvas
  function drawFrame(vIndex, fIndex) {
    if (vIndex < 0 || vIndex >= VIDEOS_COUNT) return;
    if (fIndex < 0 || fIndex >= FRAMES_PER_VIDEO) return;
    
    const img = images[vIndex][fIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    
    const cw = canvas.width;
    const ch = canvas.height;
    
    const imgRatio = img.width / img.height;
    const canvasRatio = cw / ch;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      drawHeight = ch;
      drawWidth = img.width * (ch / img.height);
      offsetX = (cw - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = cw;
      drawHeight = img.height * (cw / img.width);
      offsetX = 0;
      offsetY = (ch - drawHeight) / 2;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    currentVideoIndex = vIndex;
    currentFrameIndex = fIndex;
  }
  
  // 4. Lógica de Scroll Multi-Dobra
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // Descobre qual dobra está atualmente ativa
        let activeFoldIndex = 0;
        let scrollFraction = 0;

        // Loop pelas dobras para checar onde estamos
        for (let i = 0; i < folds.length; i++) {
          const fold = folds[i];
          const offsetTop = fold.offsetTop;
          const offsetHeight = fold.offsetHeight;
          const offsetBottom = offsetTop + offsetHeight;
          
          // Se o centro da tela (ou topo) estiver dentro desta dobra
          if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
            activeFoldIndex = i;
            
            // O espaço "rolável" da dobra é a altura dela menos a altura da janela
            const scrollableHeight = offsetHeight - window.innerHeight;
            
            if (scrollableHeight <= 0) {
              scrollFraction = 1; // Se a dobra for muito pequena
            } else {
              scrollFraction = (scrollTop - offsetTop) / scrollableHeight;
            }
            break;
          } else if (scrollTop >= offsetBottom) {
            // Se já passamos por essa dobra completamente, o activeFoldIndex fica sendo o último iterado
            activeFoldIndex = i;
            scrollFraction = 1; 
          }
        }
        
        // Garante limites
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));
        
        const frameIndex = Math.min(
          FRAMES_PER_VIDEO - 1,
          Math.floor(scrollFraction * FRAMES_PER_VIDEO)
        );
        
        // Desenha apenas se mudou de frame ou de vídeo
        if (activeFoldIndex !== currentVideoIndex || frameIndex !== currentFrameIndex) {
          drawFrame(activeFoldIndex, frameIndex);
        }
        
        ticking = false;
      });
      ticking = true;
    }
  }
  
  // 5. Intersection Observer para animações de texto
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.22 
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.animate-in').forEach(el => {
    observer.observe(el);
  });
  
  // Inicia o processo
  preloadImages();
});
