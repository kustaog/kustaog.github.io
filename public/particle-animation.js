// particle-animation.js
// Fondo profesional: puntos suaves, líneas sutiles, movimiento fluido y gradiente

const canvas = document.createElement('canvas');
canvas.id = 'particles-bg';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.minWidth = '100vw';
canvas.style.minHeight = '100vh';
canvas.style.zIndex = '0';
canvas.style.pointerEvents = 'none';
canvas.style.display = 'block';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let particles = [];
// Responsive settings (computed in resize)
let numParticles = 0;
let maxLineDist = 130;
let particleScale = 1; // scales radius and speed
let devicePixelRatioUsed = 1;
const colors = [
  '#ffffff',
  '#b3c6ff',
  '#aee9f9',
  '#e0e7ff',
  '#c7ffd8'
];

function resizeCanvas() {
  // Support high DPI for crisp particles
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  devicePixelRatioUsed = dpr;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  // reset transform then scale for DPR
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Compute responsive parameters based on viewport area
  const area = w * h;
  // density tuned so typical desktop ~120-160 particles
  const density = 0.00013;
  numParticles = Math.max(18, Math.min(160, Math.round(area * density)));

  // scale factors based on smaller screens (reduce visuals)
  const minDim = Math.min(w, h);
  particleScale = Math.max(0.6, Math.min(1.25, minDim / 800));
  maxLineDist = Math.round(Math.max(60, Math.min(160, minDim * 0.16)));
}

// Debounced resize to avoid thrashing
let resizeTimer = null;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCanvas();
    createParticles();
  }, 120);
}
window.addEventListener('resize', handleResize);
// initial setup
resizeCanvas();
createParticles();

function createParticles() {
  particles = [];
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (let i = 0; i < numParticles; i++) {
    // position in CSS pixels (canvas is scaled already)
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * (0.32 * particleScale),
      vy: (Math.random() - 0.5) * (0.32 * particleScale),
      radius: (0.6 + Math.random() * 0.9) * particleScale,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function drawParticles() {
  // clear in CSS pixels (ctx is scaled to DPR), use CSS size because ctx is scaled
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  // Líneas sutiles entre partículas cercanas
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxLineDist) {
        const grad = ctx.createLinearGradient(
          particles[i].x, particles[i].y, particles[j].x, particles[j].y
        );
        grad.addColorStop(0, particles[i].color);
        grad.addColorStop(1, particles[j].color);
        // Opacidad suave según distancia
        // Reduce line alpha on small screens for clarity and perf
        const screenFactor = Math.min(1, particleScale + 0.1);
        const alpha = 0.18 * (1 - dist / maxLineDist) * screenFactor;
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
  // Puntos suaves y coloridos
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    // reduce shadow on small screens for performance
    ctx.shadowBlur = Math.max(2, Math.round(6 * particleScale));
    ctx.globalAlpha = Math.min(0.92, 0.82 * (1 + (particleScale - 1) * 0.5));
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

function updateParticles() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    // Movimiento más fluido y rebote dentro de CSS pixel bounds
    if (p.x < 0) { p.x = 0; p.vx *= -1; }
    if (p.x > w) { p.x = w; p.vx *= -1; }
    if (p.y < 0) { p.y = 0; p.vy *= -1; }
    if (p.y > h) { p.y = h; p.vy *= -1; }
  }
}

// Respect user preference for reduced motion
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate() {
  if (!prefersReduced) {
    updateParticles();
    drawParticles();
  } else {
    // Minimal static rendering when reduced motion is requested
    drawParticles();
  }
  requestAnimationFrame(animate);
}
animate();
