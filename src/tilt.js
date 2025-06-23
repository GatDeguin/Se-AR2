const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Body {
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
  }

  update(gx, gy) {
    this.vx += gx;
    this.vy += gy;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -0.8;
    }
    if (this.x + this.r > width) {
      this.x = width - this.r;
      this.vx *= -0.8;
    }
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -0.8;
    }
    if (this.y + this.r > height) {
      this.y = height - this.r;
      this.vy *= -0.8;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

const bodies = [
  new Body(width / 2, height / 2, 20, '#f00'),
  new Body(width / 2 + 60, height / 2, 15, '#0f0'),
  new Body(width / 2 - 60, height / 2, 25, '#00f')
];

let gx = 0, gy = 0;
const G = 0.2;
const DEG2RAD = Math.PI / 180;

function handleOrientation(e) {
  gy = G * Math.sin((e.beta || 0) * DEG2RAD);
  gx = G * Math.sin((e.gamma || 0) * DEG2RAD);
}

window.addEventListener('deviceorientation', handleOrientation);

function loop() {
  ctx.clearRect(0, 0, width, height);
  for (const b of bodies) {
    b.update(gx, gy);
    b.draw();
  }
  requestAnimationFrame(loop);
}

loop();
