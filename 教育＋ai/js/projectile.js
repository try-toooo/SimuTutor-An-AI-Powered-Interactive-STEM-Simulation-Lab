(function () {
  const canvas = document.getElementById("projectileCanvas");
  const ctx = canvas.getContext("2d");
  const velocityInput = document.getElementById("velocity");
  const angleInput = document.getElementById("angle");
  const gravityInput = document.getElementById("gravity");
  const targetInput = document.getElementById("target");
  const feedback = document.getElementById("projectileFeedback");
  const progressBar = document.getElementById("projectileProgress");
  const scoreText = document.getElementById("projectileScore");

  const ui = {
    velocity: document.getElementById("velocityValue"),
    angle: document.getElementById("angleValue"),
    gravity: document.getElementById("gravityValue"),
    target: document.getElementById("targetValue")
  };

  const state = {
    velocity: 42,
    angle: 38,
    gravity: 9.8,
    target: 170,
    time: 0,
    running: false,
    path: [],
    lastRange: null,
    attempts: SimuStorage.get("projectile").attempts || 0,
    hits: SimuStorage.get("projectile").hits || 0
  };

  const scale = 3.25;
  const origin = { x: 70, y: 440 };
  const targetWidth = 42;
  let animationId = null;

  function readInputs() {
    state.velocity = Number(velocityInput.value);
    state.angle = Number(angleInput.value);
    state.gravity = Number(gravityInput.value);
    state.target = Number(targetInput.value);
    ui.velocity.textContent = state.velocity;
    ui.angle.textContent = state.angle;
    ui.gravity.textContent = state.gravity.toFixed(1);
    ui.target.textContent = state.target;
  }

  function projectedRange() {
    const angleRad = state.angle * Math.PI / 180;
    return (state.velocity * state.velocity * Math.sin(2 * angleRad)) / state.gravity;
  }

  function positionAt(time) {
    const angleRad = state.angle * Math.PI / 180;
    const x = state.velocity * Math.cos(angleRad) * time;
    const y = state.velocity * Math.sin(angleRad) * time - 0.5 * state.gravity * time * time;
    return { x, y };
  }

  function toCanvas(point) {
    return {
      x: origin.x + point.x * scale,
      y: origin.y - point.y * scale
    };
  }

  function drawGrid() {
    ctx.fillStyle = "#eef7f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(23, 50, 58, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 50; x < canvas.width; x += 65) {
      ctx.beginPath();
      ctx.moveTo(x, 34);
      ctx.lineTo(x, origin.y + 20);
      ctx.stroke();
    }
    for (let y = 40; y < origin.y; y += 52) {
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(canvas.width - 28, y);
      ctx.stroke();
    }
  }

  function drawWorld() {
    drawGrid();
    ctx.strokeStyle = "#24434d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(36, origin.y);
    ctx.lineTo(canvas.width - 28, origin.y);
    ctx.stroke();

    ctx.fillStyle = "#24434d";
    ctx.font = "700 16px Inter, sans-serif";
    ctx.fillText("0 m", origin.x - 18, origin.y + 30);
    ctx.fillText(`${state.target} m`, origin.x + state.target * scale - 26, origin.y + 30);

    const targetX = origin.x + state.target * scale;
    ctx.fillStyle = "rgba(240, 184, 75, 0.84)";
    ctx.fillRect(targetX - targetWidth / 2, origin.y - 56, targetWidth, 56);
    ctx.strokeStyle = "#ad7b1d";
    ctx.strokeRect(targetX - targetWidth / 2, origin.y - 56, targetWidth, 56);
    ctx.fillStyle = "#17323a";
    ctx.fillText("Target", targetX - 28, origin.y - 66);

    const angleRad = state.angle * Math.PI / 180;
    ctx.strokeStyle = "#1f7a8c";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + Math.cos(angleRad) * 78, origin.y - Math.sin(angleRad) * 78);
    ctx.stroke();
    ctx.fillStyle = "#1f7a8c";
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPath() {
    if (state.path.length < 2) return;
    ctx.strokeStyle = "#e85555";
    ctx.lineWidth = 4;
    ctx.beginPath();
    state.path.forEach((point, index) => {
      const screen = toCanvas(point);
      if (index === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    });
    ctx.stroke();

    const last = toCanvas(state.path[state.path.length - 1]);
    ctx.fillStyle = "#e85555";
    ctx.beginPath();
    ctx.arc(last.x, last.y, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPrediction() {
    if (state.running || state.path.length > 1) return;
    const range = projectedRange();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "rgba(31, 122, 140, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const p = i / 80;
      const time = (2 * state.velocity * Math.sin(state.angle * Math.PI / 180) / state.gravity) * p;
      const screen = toCanvas(positionAt(time));
      if (i === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#17323a";
    ctx.font = "700 16px Inter, sans-serif";
    ctx.fillText(`Predicted range: ${range.toFixed(1)} m`, 52, 58);
  }

  function draw() {
    readInputs();
    drawWorld();
    drawPrediction();
    drawPath();
  }

  function updateScore() {
    const progress = state.attempts === 0 ? 0 : Math.min(100, (state.hits / Math.max(1, state.attempts)) * 100);
    progressBar.style.width = `${progress}%`;
    scoreText.textContent = `Attempts: ${state.attempts} | Hits: ${state.hits}`;
  }

  function finishLaunch() {
    state.running = false;
    state.lastRange = projectedRange();
    state.attempts += 1;
    const hit = Math.abs(state.lastRange - state.target) <= 7;
    if (hit) state.hits += 1;
    SimuStorage.set("projectile", { attempts: state.attempts, hits: state.hits });
    updateScore();
    feedback.textContent = AITutor.projectile.hint({ ...state, range: state.lastRange });
  }

  function animate() {
    state.time += 0.035;
    const point = positionAt(state.time);
    state.path.push(point);
    draw();
    if (point.y <= 0 && state.time > 0.2) {
      state.path[state.path.length - 1] = { x: point.x, y: 0 };
      draw();
      finishLaunch();
      return;
    }
    animationId = requestAnimationFrame(animate);
  }

  function launch() {
    cancelAnimationFrame(animationId);
    readInputs();
    state.running = true;
    state.time = 0;
    state.path = [{ x: 0, y: 0 }];
    feedback.textContent = "Running simulation...";
    animate();
  }

  function reset() {
    cancelAnimationFrame(animationId);
    state.running = false;
    state.time = 0;
    state.path = [];
    state.lastRange = null;
    feedback.textContent = "Launch the projectile, then ask the tutor for adaptive guidance.";
    draw();
  }

  function tutorState() {
    return { ...state, range: state.lastRange ?? projectedRange() };
  }

  [velocityInput, angleInput, gravityInput, targetInput].forEach((input) => {
    input.addEventListener("input", draw);
  });

  document.getElementById("launchBtn").addEventListener("click", launch);
  document.getElementById("resetBtn").addEventListener("click", reset);
  document.getElementById("hintBtn").addEventListener("click", () => {
    feedback.textContent = AITutor.projectile.hint(tutorState());
  });
  document.getElementById("explainBtn").addEventListener("click", () => {
    feedback.textContent = AITutor.projectile.explain(tutorState());
  });
  document.getElementById("quizBtn").addEventListener("click", () => {
    feedback.textContent = AITutor.projectile.quiz(tutorState());
  });

  draw();
  updateScore();
})();
