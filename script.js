const image = document.getElementById('heroImage');
const portal = document.getElementById('portal');
const clock = document.getElementById('clock');
const chapterIndicator = document.getElementById('chapterIndicator');
const cityIndicator = document.getElementById('cityIndicator');
const topbar = document.querySelector('.topbar');
const heroContent = document.querySelector('.hero-content');
const bridgeSection = document.getElementById('origin');
const bridgeCanvas = document.getElementById('bridgeCanvas');
const bridgePhoto = document.getElementById('bridgePhoto');
const bridgeHeading = document.getElementById('bridgeHeading');
const bridgeStatus = document.getElementById('bridgeStatus');
const bridgeCaption = document.getElementById('bridgeCaption');
const bridgeLocation = document.getElementById('bridgeLocation');
const bridgeStatusText = document.getElementById('bridgeStatusText');
const bridgeProgressBar = document.getElementById('bridgeProgress');
const originFormation = document.getElementById('originFormation');

let mx = innerWidth / 2, my = innerHeight / 2, px = mx, py = my, lastX = px, lastY = py;
let heroHeight = 0, heroTop = 0, bridgeParticles = [], bridgeWidth = 0, bridgeHeight = 0, bridgeContext;
let activeTimeZone = 'Europe/Paris';
// Toggle to completely disable canvas-based particle effects
const DISABLE_PARTICLES = true;
// Scrub speed multiplier: 1 = normal, 2 = twice as fast relative to scroll
const SCRUB_SPEED = 2;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const remap = (value, start, end) => clamp((value - start) / (end - start));
const easeOut = (value) => 1 - Math.pow(1 - value, 3);

function updateClock() {
  if (!clock) return;
  clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: activeTimeZone, hour: '2-digit', minute: '2-digit' });
}

function resizeHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  heroHeight = hero.offsetHeight;
  heroTop = hero.offsetTop;
}
function heroProgress() {
  return heroHeight > 0 ? clamp((scrollY - heroTop) / Math.max(1, heroHeight - innerHeight)) : 0;
}

function updateHero(progress) {
  if (!chapterIndicator || !image || !portal || !heroContent) return;
  chapterIndicator.textContent = '01';
  const fade = remap(progress, .45, .96);
  // Keep hero visuals steady; let the next section fade in instead.
  image.style.opacity = `1`;
  image.style.transform = `translate(${(px - innerWidth / 2) * .006}px, ${(py - innerHeight / 2) * .006}px) scale(1.02)`;
  portal.style.opacity = `1`;
}

function animatePortal() {
  if (!portal || !image) return;
  if (!reducedMotion) { px += (mx - px) * .055; py += (my - py) * .055; }
  const vx = px - lastX, vy = py - lastY; lastX = px; lastY = py;
  const speed = Math.min(Math.hypot(vx, vy), 60);
  const wobble = reducedMotion ? 0 : Math.sin(performance.now() * .002) * 18 + Math.cos(performance.now() * .0032) * 10;
  const radius = 200 + wobble + speed * 1.1, stretchX = 1 + Math.abs(vx) * .009, stretchY = 1 + Math.abs(vy) * .009;
  portal.style.left = `${px}px`;
  portal.style.top = `${py}px`;
  portal.style.transform = `translate(-50%,-50%) scale(${stretchX},${stretchY})`;
  image.style.clipPath = `ellipse(${radius * stretchX}px ${radius * stretchY}px at ${px}px ${py}px)`;
}

function bridgeLines() {
  const lines = [[.04,.62,.98,.46,.9],[.04,.64,.98,.48,.7],[.18,.13,.98,.06,.85],[.18,.4,.98,.28,.7],[.21,.07,.14,.62,1],[.245,.07,.36,.62,1]];
  for (let i = 0; i <= 18; i += 1) {
    const a = i / 18, b = Math.min(1, (i + 1) / 18), point = (t, upper) => [.21 + t * .77, (upper ? .13 : .4) - t * (upper ? .07 : .12)];
    const [ux,uy] = point(a,true), [lx,ly] = point(a,false); lines.push([ux,uy,lx,ly,.45]);
    if (i < 18) { const [nx,ny] = point(b,false), [tx,ty] = point(b,true); lines.push([ux,uy,nx,ny,.36],[lx,ly,tx,ty,.36]); }
  } return lines;
}

function resizeBridge() {
  if (DISABLE_PARTICLES) {
    // keep geometry defaults but skip canvas setup
    bridgeWidth = bridgeCanvas ? bridgeCanvas.clientWidth : 0;
    bridgeHeight = bridgeCanvas ? bridgeCanvas.clientHeight : 0;
    bridgeParticles = [];
    bridgeContext = null;
    return;
  }
  if (!bridgeCanvas) return;
  bridgeWidth = bridgeCanvas.clientWidth;
  bridgeHeight = bridgeCanvas.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  bridgeCanvas.width = bridgeWidth * ratio;
  bridgeCanvas.height = bridgeHeight * ratio;
  bridgeContext = bridgeCanvas.getContext('2d');
  bridgeContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  bridgeParticles = [];
  bridgeLines().forEach(([x1, y1, x2, y2, density]) => {
    const ax = x1 * bridgeWidth;
    const ay = y1 * bridgeHeight;
    const bx = x2 * bridgeWidth;
    const by = y2 * bridgeHeight;
    const count = Math.max(8, Math.round(Math.hypot(bx - ax, by - ay) * density / 3.7));
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const ox = ax + (bx - ax) * t + (Math.random() - 0.5) * 1.5;
      const oy = ay + (by - ay) * t + (Math.random() - 0.5) * 1.5;
      const angle = Math.atan2(oy - bridgeHeight * .38, ox - bridgeWidth * .42) + (Math.random() - 0.5);
      bridgeParticles.push({
        ox,
        oy,
        order: clamp(.05 + t * .62 + (Math.random() - 0.5) * .16),
        vx: Math.cos(angle) * (.4 + Math.random()),
        vy: Math.sin(angle) * (.4 + Math.random()),
        size: .45 + Math.random() * 1.05,
        alpha: .48 + Math.random() * .42,
      });
    }
  });
}
function bridgeProgress() {
  if (!bridgeSection) return 0;
  const rect = bridgeSection.getBoundingClientRect();
  const sectionHeight = bridgeSection.offsetHeight || (rect.bottom - rect.top);
  // Start scrub as soon as any part of the section is visible in the viewport.
  // Map from when the section's top enters the bottom of the viewport (rect.top < innerHeight)
  // through the section's traversal: progress = (viewportHeight - rect.top) / (viewportHeight + sectionHeight)
  const total = innerHeight + sectionHeight;
  const p = clamp((innerHeight - rect.top) / Math.max(1, total));
  return p;
}
function drawBridge(progress) {
  if (!bridgeHeading || !bridgeStatus || !bridgeCaption || !bridgeLocation || !bridgeStatusText || !bridgeProgressBar || !originFormation) return;
  // Skip canvas/particle rendering when disabled
  const construct = remap(progress, 0, .39);
  const reveal = remap(progress, .38, .59);
  const scatter = remap(progress, .79, 1);
  const hud = clamp(remap(progress, .01, .08) * (1 - remap(progress, .76, .9)));
  const buildHud = clamp(remap(progress, .01, .07) * (1 - remap(progress, .33, .42)));
  const story = clamp(remap(progress, .48, .6) * (1 - remap(progress, .86, .98)));
  // If a bridge photo exists, fade it as before
  if (bridgePhoto) bridgePhoto.style.opacity = `${reveal ? (1 - scatter) * .92 : 0}`;
  bridgeHeading.style.opacity = hud;
  bridgeCaption.style.opacity = hud;
  bridgeLocation.style.opacity = hud;
  bridgeStatus.style.opacity = buildHud;
  bridgeProgressBar.style.width = `${construct * 100}%`;
  bridgeStatusText.textContent = construct < .5 ? 'constructing' : 'almost there';
  originFormation.classList.toggle('is-visible', story > .01);
  originFormation.style.opacity = story;
  const inKolkata = progress > .015;
  const nextTimeZone = inKolkata ? 'Asia/Kolkata' : 'Europe/Paris';
  topbar?.classList.toggle('is-inverted', inKolkata);
  if (cityIndicator) cityIndicator.textContent = inKolkata ? 'KOLKATA, IN' : 'PARIS, FR';
  if (activeTimeZone !== nextTimeZone) {
    activeTimeZone = nextTimeZone;
    updateClock();
  }
  // keep chapterIndicator stable (do not switch to '02')
}
function loop(){ updateHero(heroProgress()); animatePortal(); drawBridge(bridgeProgress()); requestAnimationFrame(loop); }
addEventListener('mousemove',(event)=>{mx=event.clientX;my=event.clientY;}); addEventListener('resize',()=>{resizeHero();resizeBridge();}); updateClock();setInterval(updateClock,1000);resizeHero();resizeBridge();loop();

// Scroll-driven scrubbing for the bridge assembly video.
(function setupBridgeVideoScrub(){
  // Ensure a bridge video element exists in the DOM (inject if missing).
  function ensureBridgeVideo() {
    let bv = document.getElementById('bridgeVideo');
    if (bv) return bv;
    const host = document.querySelector('.bridge-sticky') || document.querySelector('.origin-image-wrap') || document.getElementById('origin');
    if (!host) return null;
    bv = document.createElement('video');
    bv.id = 'bridgeVideo';
    bv.className = 'origin-image bridge-video';
    bv.src = 'assets/Howrahbridgeassembling_scrub.mp4';
    bv.setAttribute('playsinline', '');
    bv.muted = true;
    bv.preload = 'auto';
    // Make the scrub video accessible: provide a label and make it keyboard-focusable.
    bv.setAttribute('aria-label', 'Howrah Bridge assembly video');
    bv.setAttribute('tabindex', '0');
    // ensure the video fills its host visually
    bv.style.width = '100%';
    bv.style.height = '100%';
    bv.style.objectFit = 'cover';
    bv.style.display = 'block';
    bv.style.borderRadius = '28px';
    host.insertBefore(bv, host.firstChild);
    return bv;
  }

  const bridgeVideo = ensureBridgeVideo();
  if (!bridgeVideo) {
    console.warn('bridgeVideo: could not find host to inject into');
    return;
  }
  console.info('bridgeVideo: injected or found', bridgeVideo);
  bridgeVideo.pause();
  bridgeVideo.muted = true;
  bridgeVideo.playsInline = true;
  bridgeVideo.preload = 'auto';

  // Respect user's reduced motion preference: enable controls and skip auto-scrub
  if (reducedMotion) {
    bridgeVideo.controls = true;
    bridgeVideo.pause();
    console.info('bridgeVideo: reduced-motion enabled, controls shown, auto-scrub disabled');
  } else {
    bridgeVideo.controls = false;
  }

  // Smooth scrub: map scroll -> target time, then lerp currentTime toward target to reduce stutter.
  let bridgeTargetTime = 0;
  let bridgeLerpedTime = 0;
  const SMOOTH_FACTOR = 0.18; // lerp factor (0..1)
  const MIN_SEEK_DELTA = 0.02; // seconds threshold to perform a seek

  function updateVideoByBridgeProgress() {
    if (reducedMotion) return; // do not auto-scrub when reduced motion is requested
    const p = typeof bridgeProgress === 'function' ? bridgeProgress() : 0;
    if (bridgeVideo.duration && !isNaN(bridgeVideo.duration)) {
      const targetProgress = Math.min(1, Math.max(0, p * SCRUB_SPEED));
      bridgeTargetTime = targetProgress * bridgeVideo.duration;
    }
  }

  function smoothBridgeScrub() {
    if (!bridgeVideo || reducedMotion) { requestAnimationFrame(smoothBridgeScrub); return; }
    if (bridgeVideo.duration && !isNaN(bridgeVideo.duration)) {
      // initialize lerped time if it's the first run
      if (bridgeLerpedTime === 0) bridgeLerpedTime = bridgeVideo.currentTime || 0;
      // lerp toward target
      bridgeLerpedTime += (bridgeTargetTime - bridgeLerpedTime) * SMOOTH_FACTOR;
      const diff = Math.abs((bridgeVideo.currentTime || 0) - bridgeLerpedTime);
      if (diff > MIN_SEEK_DELTA) {
        try { bridgeVideo.currentTime = bridgeLerpedTime; } catch (e) { /* ignore seek errors */ }
      }
    }
    requestAnimationFrame(smoothBridgeScrub);
  }

  addEventListener('scroll', () => requestAnimationFrame(updateVideoByBridgeProgress), { passive: true });
  addEventListener('resize', () => requestAnimationFrame(updateVideoByBridgeProgress));
  bridgeVideo.addEventListener('loadedmetadata', () => {
    console.info('bridgeVideo: loadedmetadata, duration=', bridgeVideo.duration);
    updateVideoByBridgeProgress();
  });
  bridgeVideo.addEventListener('error', (e) => console.error('bridgeVideo error', e));

  // start the smoothing loop
  requestAnimationFrame(smoothBridgeScrub);
  // update the slim section progress bar (width) on scroll
  const sectionProgressEl = document.querySelector('.section-progress');
  function updateSectionProgressBar() {
    const p = bridgeProgress();
    if (sectionProgressEl) sectionProgressEl.style.setProperty('--progress', `${Math.round(p * 100)}%`);
  }
  addEventListener('scroll', () => requestAnimationFrame(updateSectionProgressBar), { passive: true });
  addEventListener('resize', () => requestAnimationFrame(updateSectionProgressBar));
  // initial fill
  requestAnimationFrame(updateSectionProgressBar);
})();

// Origin section transition: fade/slide in when scrolled into view
(function setupOriginTransition(){
  const origin = document.getElementById('origin');
  const transitionEl = document.getElementById('sectionTransition');
  if (!origin) return;
  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          origin.classList.add('is-visible');
          if (transitionEl && !reducedMotion) {
            transitionEl.classList.add('is-active');
            // remove after animation finishes to allow replay
            setTimeout(() => transitionEl.classList.remove('is-active'), 900);
          }
        } else {
          origin.classList.remove('is-visible');
          if (transitionEl) transitionEl.classList.remove('is-active');
        }
      });
    }, { threshold: 0.12 });
    io.observe(origin);
  } catch (e) {
    // fallback: set visible immediately
    origin.classList.add('is-visible');
  }
})();
