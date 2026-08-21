const chapterNumber = document.getElementById('chapterNumber');
const chapterName = document.getElementById('chapterName');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const revealItems = [...document.querySelectorAll('.reveal')];
const movingVideo = document.querySelector('.moving-video');
const heroImage = document.getElementById('heroImage');
const portal = document.getElementById('portal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let px = mx;
let py = my;
let lastX = px;
let lastY = py;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.18,
  rootMargin: '0px 0px -8% 0px',
});

revealItems.forEach((item) => revealObserver.observe(item));

const chapterObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible || !chapterNumber || !chapterName) return;

  chapterNumber.textContent = visible.target.dataset.chapter;
  chapterName.textContent = visible.target.dataset.name;
}, {
  threshold: [0.2, 0.42, 0.66],
});

chapters.forEach((chapter) => chapterObserver.observe(chapter));

function animatePortal() {
  if (!portal || !heroImage) return;

  if (!reducedMotion) {
    px += (mx - px) * 0.055;
    py += (my - py) * 0.055;
  }

  const vx = px - lastX;
  const vy = py - lastY;
  lastX = px;
  lastY = py;

  const speed = Math.min(Math.hypot(vx, vy), 60);
  const wobble = reducedMotion ? 0 : Math.sin(performance.now() * 0.002) * 18 + Math.cos(performance.now() * 0.0032) * 10;
  const radius = 200 + wobble + speed * 1.1;
  const stretchX = 1 + Math.abs(vx) * 0.009;
  const stretchY = 1 + Math.abs(vy) * 0.009;

  portal.style.left = `${px}px`;
  portal.style.top = `${py}px`;
  portal.style.transform = `translate(-50%, -50%) scale(${stretchX}, ${stretchY})`;
  heroImage.style.clipPath = `ellipse(${radius * stretchX}px ${radius * stretchY}px at ${px}px ${py}px)`;
  heroImage.style.transform = `translate(${(px - window.innerWidth / 2) * 0.006}px, ${(py - window.innerHeight / 2) * 0.006}px) scale(1.04)`;

  requestAnimationFrame(animatePortal);
}

if (portal && heroImage) {
  window.addEventListener('pointermove', (event) => {
    mx = event.clientX;
    my = event.clientY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    mx = window.innerWidth / 2;
    my = window.innerHeight / 2;
  });

  requestAnimationFrame(animatePortal);
}

function updateMovingVideo() {
  if (!movingVideo || reducedMotion || !movingVideo.duration) return;

  const section = document.getElementById('moving');
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const progress = total > 0 ? clamp((rect.top * -1) / total) : 0;
  const targetTime = progress * movingVideo.duration;

  if (Math.abs(movingVideo.currentTime - targetTime) > 0.04) {
    movingVideo.currentTime = targetTime;
  }
}

if (movingVideo) {
  movingVideo.pause();

  if (reducedMotion) {
    movingVideo.controls = true;
  } else {
    movingVideo.addEventListener('loadedmetadata', updateMovingVideo);
    window.addEventListener('scroll', () => requestAnimationFrame(updateMovingVideo), { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(updateMovingVideo));
  }
}
