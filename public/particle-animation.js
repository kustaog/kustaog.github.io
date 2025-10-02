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
const numParticles = 140;
const maxLineDist = 130;
const colors = [
  '#ffffff',
  '#b3c6ff',
  '#aee9f9',
  '#e0e7ff',
  '#c7ffd8'
];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function handleResize() {
  resizeCanvas();
  createParticles();
}
window.addEventListener('resize', handleResize);
handleResize();

function createParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      radius: 0.7 + Math.random() * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        const alpha = 0.18 * (1 - dist / maxLineDist);
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
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.82;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    // Movimiento más fluido y rebote
    if (p.x < 0) { p.x = 0; p.vx *= -1; }
    if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
    if (p.y < 0) { p.y = 0; p.vy *= -1; }
    if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }
  }
}

function animate() {
  updateParticles();
  drawParticles();
  requestAnimationFrame(animate);
}
animate();
