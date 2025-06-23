const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

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

class Player extends Body {
  constructor(x, y) {
    super(x, y, 20, '#ff0');
    this.speed = -2;
  }

  update(gx, gy) {
    this.vx += gx;
    this.vy += gy;
    this.x += this.vx;
    this.y += this.vy + this.speed;

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
}

const bodies = [];
for (let i = 0; i < 5; i++) {
  const r = 15 + Math.random() * 10;
  bodies.push(new Body(Math.random() * width, Math.random() * height, r,
    `hsl(${Math.random() * 360},70%,50%)`));
}

const player = new Player(width / 2, height - 40);

let gx = 0, gy = 0;
const G = 0.2;
const DEG2RAD = Math.PI / 180;

function handleOrientation(e) {
  const beta = e.beta || 0;
  const gamma = e.gamma || 0;
  gy = G * Math.sin(beta * DEG2RAD);
  gx = G * Math.sin(gamma * DEG2RAD);
  if (info) {
    info.textContent = `β: ${beta.toFixed(1)}°  γ: ${gamma.toFixed(1)}°`;
  }
}

window.addEventListener('deviceorientation', handleOrientation);

function loop() {
  ctx.clearRect(0, 0, width, height);
  for (const b of bodies) {
    b.update(gx, gy);
    b.draw();
  }
  player.update(gx, gy);
  player.draw();
  requestAnimationFrame(loop);
}

loop();
