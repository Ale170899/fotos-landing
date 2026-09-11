document.addEventListener('DOMContentLoaded', () => {
  // Configuração do Vídeo
  const FRAME_COUNT = 240; // Total real de frames extraídos pelo script python
  const FRAME_PATH = 'warrior/frames/'; // Pasta onde estão os frames
  
  // Elementos
  const canvas = document.getElementById('video-canvas');
  const ctx = canvas.getContext('2d', { alpha: false }); // Otimização de renderização
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const scrollContainer = document.querySelector('.scroll-container');
  
  // Estado
  const images = [];
  let loadedCount = 0;
  let currentFrameIndex = 0;
  let ticking = false; // Para throttling do scroll
  let maxScroll = 0;
  
  // 1. Pré-carregamento dos Frames
  function preloadImages() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      
      // Formata o número (ex: 0000, 0001)
      const frameNum = i.toString().padStart(4, '0');
      img.src = `${FRAME_PATH}frame_${frameNum}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        
        // Atualiza UI do loader
        const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.width = `${percent}%`;
        loaderPercent.textContent = `${percent}%`;
        
        // Quando todos carregarem
        if (loadedCount === FRAME_COUNT) {
          initCanvas();
          setTimeout(() => {
            loader.classList.add('hidden');
            // Remove o loader do DOM após a transição para poupar memória
            setTimeout(() => loader.remove(), 800); 
          }, 300);
        }
      };
      
      img.onerror = () => {
        console.error(`Erro ao carregar frame: ${img.src}`);
        // Incrementamos para não travar o loader
        loadedCount++;
        if (loadedCount === FRAME_COUNT) initCanvas();
      };
      
      images.push(img);
    }
  }
  
  // 2. Configuração do Canvas e Primeiro Frame
  function initCanvas() {
    resizeCanvas();
    drawFrame(0);
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawFrame(currentFrameIndex);
    });
    
    // Calcula o maxScroll
    updateMaxScroll();
    
    // Inicia listener de scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Re-calcula alturas em caso de redimensionamento
    window.addEventListener('resize', updateMaxScroll);
  }
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function updateMaxScroll() {
    // maxScroll é o quanto a página pode rolar
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    // Evita divisão por zero
    if (maxScroll <= 0) maxScroll = 1;
  }
  
  // 3. Desenhar Frame no Canvas (Cobrindo a tela inteira com aspect ratio correto)
  function drawFrame(index) {
    if (!images[index] || !images[index].complete || images[index].naturalWidth === 0) return;
    
    const img = images[index];
    const cw = canvas.width;
    const ch = canvas.height;
    
    // Calcula proporções para "object-fit: cover"
    const imgRatio = img.width / img.height;
    const canvasRatio = cw / ch;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      // Imagem mais larga que o canvas
      drawHeight = ch;
      drawWidth = img.width * (ch / img.height);
      offsetX = (cw - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Imagem mais alta que o canvas
      drawWidth = cw;
      drawHeight = img.height * (cw / img.width);
      offsetX = 0;
      offsetY = (ch - drawHeight) / 2;
    }
    
    // Desenha
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    // Opcional: Escurecer o vídeo via JS para o texto brilhar mais (se necessário, além do opacity do CSS)
    // ctx.fillStyle = 'rgba(0,0,0,0.3)';
    // ctx.fillRect(0,0,cw,ch);
  }
  
  // 4. Lógica de Scroll (Throttled)
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // Progresso do scroll (0 a 1)
        let scrollFraction = scrollTop / maxScroll;
        
        // Garante que fique entre 0 e 1
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));
        
        // Calcula índice do frame
        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(scrollFraction * FRAME_COUNT)
        );
        
        if (frameIndex !== currentFrameIndex) {
          currentFrameIndex = frameIndex;
          drawFrame(frameIndex);
        }
        
        ticking = false;
      });
      ticking = true;
    }
  }
  
  // 5. Intersection Observer para animações dos painéis glassmorphism
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.22 // Dispara quando 22% do elemento estiver visível
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
