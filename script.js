const image = document.getElementById('heroImage');
const portal = document.getElementById('portal');
const clock = document.getElementById('clock');
const chapterIndicator = document.getElementById('chapterIndicator');
const cityIndicator = document.getElementById('cityIndicator');
const topbar = document.querySelector('.topbar');
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
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const remap = (value, start, end) => clamp((value - start) / (end - start));
const easeOut = (value) => 1 - Math.pow(1 - value, 3);

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: activeTimeZone, hour: '2-digit', minute: '2-digit' });
}

function resizeHero() { heroHeight = document.getElementById('hero').offsetHeight; heroTop = document.getElementById('hero').offsetTop; }
function heroProgress() { return clamp((scrollY - heroTop) / Math.max(1, heroHeight - innerHeight)); }

function updateHero(progress) {
  chapterIndicator.textContent = '01';
  const fade = remap(progress, .45, .96);
  image.style.opacity = `${1 - fade * .95}`;
  image.style.transform = `translate(${(px - innerWidth / 2) * .006}px, ${(py - innerHeight / 2) * .006}px) scale(${1.02 - fade * .08})`;
  portal.style.opacity = `${1 - fade}`;
  document.querySelector('.hero-content').classList.toggle('faded', fade > .08);
}

function animatePortal() {
  if (!reducedMotion) { px += (mx - px) * .055; py += (my - py) * .055; }
  const vx = px - lastX, vy = py - lastY; lastX = px; lastY = py;
  const speed = Math.min(Math.hypot(vx, vy), 60);
  const wobble = reducedMotion ? 0 : Math.sin(performance.now() * .002) * 18 + Math.cos(performance.now() * .0032) * 10;
  const radius = 200 + wobble + speed * 1.1, stretchX = 1 + Math.abs(vx) * .009, stretchY = 1 + Math.abs(vy) * .009;
  portal.style.left = `${px}px`; portal.style.top = `${py}px`;
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
  bridgeWidth = bridgeCanvas.clientWidth; bridgeHeight = bridgeCanvas.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2); bridgeCanvas.width = bridgeWidth * ratio; bridgeCanvas.height = bridgeHeight * ratio;
  bridgeContext = bridgeCanvas.getContext('2d'); bridgeContext.setTransform(ratio,0,0,ratio,0,0); bridgeParticles = [];
  bridgeLines().forEach(([x1,y1,x2,y2,density]) => {
    const ax=x1*bridgeWidth, ay=y1*bridgeHeight, bx=x2*bridgeWidth, by=y2*bridgeHeight, count=Math.max(8,Math.round(Math.hypot(bx-ax,by-ay)*density/3.7));
    for(let i=0;i<count;i+=1) { const t=i/(count-1), ox=ax+(bx-ax)*t+(Math.random()-.5)*1.5, oy=ay+(by-ay)*t+(Math.random()-.5)*1.5, angle=Math.atan2(oy-bridgeHeight*.38,ox-bridgeWidth*.42)+(Math.random()-.5); bridgeParticles.push({ox,oy,order:clamp(.05+t*.62+(Math.random()-.5)*.16),vx:Math.cos(angle)*(.4+Math.random()),vy:Math.sin(angle)*(.4+Math.random()),size:.45+Math.random()*1.05,alpha:.48+Math.random()*.42}); }
  });
}
function bridgeProgress() { return clamp(-bridgeSection.getBoundingClientRect().top / Math.max(1, bridgeSection.offsetHeight - innerHeight)); }
function drawBridge(progress) {
  bridgeContext.clearRect(0,0,bridgeWidth,bridgeHeight); const construct=remap(progress,0,.39), reveal=remap(progress,.38,.59), scatter=remap(progress,.79,1), now=performance.now()*.00045;
  bridgeParticles.forEach((p) => { const built=easeOut(remap(construct,p.order,Math.min(1,p.order+.2))), dissolve=reveal ? 1-easeOut(reveal) : 1, fly=easeOut(remap(scatter,.05+p.order*.5,.5+p.order*.5)), wave=reducedMotion ? 0 : Math.sin(now+p.order*12)*.6, alpha=p.alpha*built*dissolve*(1-fly*.95); if(alpha<.01)return; bridgeContext.beginPath(); bridgeContext.arc(p.ox+p.vx*((1-built)*bridgeWidth*.18+fly*bridgeWidth*.28)+wave,p.oy+p.vy*((1-built)*bridgeHeight*.2+fly*bridgeHeight*.28)+wave,p.size*(1+fly),0,Math.PI*2); bridgeContext.fillStyle=`rgba(230,161,92,${alpha})`; bridgeContext.fill(); });
  bridgePhoto.style.opacity = `${reveal ? (1-scatter)*.92 : 0}`;
  const hud=clamp(remap(progress,.01,.08)*(1-remap(progress,.76,.9))), buildHud=clamp(remap(progress,.01,.07)*(1-remap(progress,.33,.42))), story=clamp(remap(progress,.48,.6)*(1-remap(progress,.86,.98)));
  bridgeHeading.style.opacity=hud; bridgeCaption.style.opacity=hud; bridgeLocation.style.opacity=hud; bridgeStatus.style.opacity=buildHud; bridgeProgressBar.style.width=`${construct*100}%`; bridgeStatusText.textContent=construct<.5?'constructing':'almost there'; originFormation.classList.toggle('is-visible',story>.01); originFormation.style.opacity=story;
  const inKolkata=progress>.015, nextTimeZone=inKolkata?'Asia/Kolkata':'Europe/Paris'; topbar.classList.toggle('is-inverted',inKolkata); cityIndicator.textContent=inKolkata?'KOLKATA, IN':'PARIS, FR'; if(activeTimeZone!==nextTimeZone){activeTimeZone=nextTimeZone;updateClock();} if(inKolkata)chapterIndicator.textContent='02';
}
function loop(){ updateHero(heroProgress()); animatePortal(); drawBridge(bridgeProgress()); requestAnimationFrame(loop); }
addEventListener('mousemove',(event)=>{mx=event.clientX;my=event.clientY;}); addEventListener('resize',()=>{resizeHero();resizeBridge();}); updateClock();setInterval(updateClock,1000);resizeHero();resizeBridge();loop();
