// List of friendly morning wishes
const morningQuotes = [
  {
    text: "Dậy thôi cô gái ơi! Chúc cậu một ngày mới thật nhiều năng lượng, học tập và làm việc thật hiệu quả nhé!",
    author: "Hà Nghĩa",
  },
  {
    text: "Chúc em ngày mới ngập tràn niềm vui, gặp nhiều may mắn, mọi việc đều thuận lợi và luôn mỉm cười thật xinh nhé!",
    author: "Hà Nghĩa",
  },
  {
    text: "Hôm nay chắc chắn sẽ là một ngày tuyệt vời. Nhớ ăn sáng đầy đủ, giữ sức khỏe rồi tự tin chinh phục mọi mục tiêu nha!",
    author: "Hà Nghĩa",
  },
  {
    text: "Chúc cô gái của ngày hôm nay luôn được yêu thương, công việc suôn sẻ, học hành thuận lợi và gặp thật nhiều điều tốt đẹp!",
    author: "Hà Nghĩa",
  },
  {
    text: "Một ngày mới lại bắt đầu rồi. Chúc em luôn vui vẻ, mạnh mẽ, tự tin và giữ nụ cười thật rạng rỡ nhé!",
    author: "Hà Nghĩa",
  },
  {
    text: "Mong hôm nay em sẽ có thật nhiều niềm vui, ít áp lực hơn, gặp đúng người tốt và nhận được thật nhiều điều tích cực!",
    author: "Hà Nghĩa",
  },
];

// Elements
const welcomeSection = document.getElementById("welcome-section");
const greetingSection = document.getElementById("greeting-section");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

// State
let animationFrameId = null;
let particles = [];
const colors = [
  "#ff3b7e",
  "#9d4edd",
  "#00f5d4",
  "#ffbe0b",
  "#3a86ff",
  "#ff006e",
];

// Set canvas dimensions
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Confetti Particle Class
class ConfettiParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 6;
    // Radial burst velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 6;
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed - Math.random() * 5; // upward bias

    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.gravity = 0.25;
    this.drag = 0.97;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.opacity = 1;
    this.fadeSpeed = Math.random() * 0.01 + 0.005;
    this.shape = Math.random() > 0.5 ? "circle" : "rect";
  }

  update() {
    this.speedX *= this.drag;
    this.speedY = this.speedY * this.drag + this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.fadeSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    if (this.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    ctx.restore();
  }
}

// Particle system loop
function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  particles = particles.filter(
    (p) =>
      p.opacity > 0 && p.y < canvas.height && p.x > 0 && p.x < canvas.width,
  );

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  // Add continuous slow floating particles if we have active greeting
  if (
    !greetingSection.classList.contains("hidden") &&
    particles.length < 30 &&
    Math.random() < 0.2
  ) {
    // Spawn gentle floating particles from bottom or top
    const gentle = new ConfettiParticle(
      Math.random() * canvas.width,
      canvas.height + 10,
    );
    gentle.speedY = -Math.random() * 3 - 1;
    gentle.speedX = (Math.random() - 0.5) * 2;
    gentle.gravity = -0.02; // rise up gently
    gentle.fadeSpeed = 0.003;
    particles.push(gentle);
  }

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animationFrameId = null;
  }
}

// Trigger Confetti Burst
function burstConfetti() {
  // Cancel existing animation if any
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  particles = [];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Spawn 150 particles for a grand burst
  for (let i = 0; i < 150; i++) {
    particles.push(new ConfettiParticle(centerX, centerY));
  }

  animateConfetti();
}

// Event Listeners
startBtn.addEventListener("click", () => {
  // Choose a random quote
  const randomQuote =
    morningQuotes[Math.floor(Math.random() * morningQuotes.length)];
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteAuthor.textContent = `— ${randomQuote.author}`;

  // Switch sections with smooth fade
  welcomeSection.style.opacity = "0";
  welcomeSection.style.transform = "scale(0.8)";

  setTimeout(() => {
    welcomeSection.classList.add("hidden");
    greetingSection.classList.remove("hidden");

    // Trigger the magical burst
    burstConfetti();
  }, 400);
});

backBtn.addEventListener("click", () => {
  // Reset back
  greetingSection.style.opacity = "0";
  greetingSection.style.transform = "scale(0.8)";

  setTimeout(() => {
    greetingSection.classList.add("hidden");
    welcomeSection.classList.remove("hidden");

    // Let it render then transition in
    setTimeout(() => {
      welcomeSection.style.opacity = "1";
      welcomeSection.style.transform = "scale(1)";
    }, 50);

    // Clear confetti
    particles = [];
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameId = null;
    }
  }, 400);
});
