const image = document.getElementById("heroImage");
const portal = document.getElementById("portal");

let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;

let px = mx;
let py = my;

let vx = 0;
let vy = 0;

let lastX = px;
let lastY = py;

window.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});

function animate() {

  px += (mx - px) * 0.055;
  py += (my - py) * 0.055;

  vx = px - lastX;
  vy = py - lastY;

  lastX = px;
  lastY = py;

  const speed = Math.min(
    Math.sqrt(vx * vx + vy * vy),
    60
  );

  const time =
    performance.now() * 0.002;

  const wobble =
    Math.sin(time) * 18 +
    Math.cos(time * 1.6) * 10;

  const radius =
    240 +
    wobble +
    speed * 1.5;

  const stretchX =
    1 + Math.abs(vx) * 0.01;

  const stretchY =
    1 + Math.abs(vy) * 0.01;

  portal.style.left =
    px + "px";

  portal.style.top =
    py + "px";

  portal.style.transform =
    `
    translate(-50%,-50%)
    scale(${stretchX},${stretchY})
    `;

  image.style.clipPath =
    `
    ellipse(
      ${radius * stretchX}px
      ${radius * stretchY}px
      at
      ${px}px
      ${py}px
    )
    `;

  image.style.transform =
    `
    translate(
      ${(px - window.innerWidth / 2) * 0.01}px,
      ${(py - window.innerHeight / 2) * 0.01}px
    )
    scale(1.06)
    `;

  requestAnimationFrame(animate);
}

animate();