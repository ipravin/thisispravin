const blob =
document.getElementById(
  "blob"
);

let mouseX = 0;
let mouseY = 0;

let blobX = 0;
let blobY = 0;

let velocityX = 0;
let velocityY = 0;

const zone =
document.querySelector(
  ".image-zone"
);

window.addEventListener(
  "mousemove",
  (e)=>{

    const rect =
      zone.getBoundingClientRect();

    mouseX =
      e.clientX -
      rect.left;

    mouseY =
      e.clientY -
      rect.top;

  }
);

function animate(){

  velocityX =
    (mouseX - blobX)
    * 0.08;

  velocityY =
    (mouseY - blobY)
    * 0.08;

  blobX += velocityX;
  blobY += velocityY;

  const speed =
  Math.min(
    Math.sqrt(
      velocityX*velocityX +
      velocityY*velocityY
    ),
    40
  );

  const stretch =
    1 + speed * 0.03;

  const squash =
    1 - speed * 0.01;

  blob.style.left =
    blobX + "px";

  blob.style.top =
    blobY + "px";

  blob.style.transform =
  `
  translate(-50%,-50%)
  scale(${stretch},${squash})
  rotate(${speed*2}deg)
  `;

  requestAnimationFrame(
    animate
  );
}

blobX =
zone.offsetWidth/2;

blobY =
zone.offsetHeight/2;

animate();