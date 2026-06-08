(function () {
  const canvas = document.getElementById("pendulumCanvas");
  const ctx = canvas.getContext("2d");
  const lengthInput = document.getElementById("length");
  const angleInput = document.getElementById("startAngle");
  const gravityInput = document.getElementById("pendulumGravity");
  const feedback = document.getElementById("pendulumFeedback");

  const ui = {
    length: document.getElementById("lengthValue"),
    angle: document.getElementById("startAngleValue"),
    gravity: document.getElementById("pendulumGravityValue"),
    period: document.getElementById("periodValue")
  };

  const state = {
    length: 2,
    startAngle: 24,
    gravity: 9.8,
    time: 0
  };

  let animationId = null;

  function readInputs() {
    state.length = Number(lengthInput.value);
    state.startAngle = Number(angleInput.value);
    state.gravity = Number(gravityInput.value);
    ui.length.textContent = state.length.toFixed(1);
    ui.angle.textContent = state.startAngle;
    ui.gravity.textContent = state.gravity.toFixed(1);
    ui.period.textContent = period().toFixed(2);
  }

  function period() {
    return 2 * Math.PI * Math.sqrt(state.length / state.gravity);
  }

  function drawBackground() {
    ctx.fillStyle = "#eef7f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(23, 50, 58, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 50; x < canvas.width; x += 65) {
      ctx.beginPath();
      ctx.moveTo(x, 34);
      ctx.lineTo(x, canvas.height - 36);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 52) {
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(canvas.width - 28, y);
      ctx.stroke();
    }
  }

  function draw() {
    readInputs();
    drawBackground();

    const pivot = { x: canvas.width / 2, y: 82 };
    const lengthPx = 88 + state.length * 82;
    const amplitude = state.startAngle * Math.PI / 180;
    const omega = Math.sqrt(state.gravity / state.length);
    const theta = amplitude * Math.cos(omega * state.time);
    const bob = {
      x: pivot.x + Math.sin(theta) * lengthPx,
      y: pivot.y + Math.cos(theta) * lengthPx
    };

    ctx.fillStyle = "#24434d";
    ctx.fillRect(pivot.x - 130, pivot.y - 18, 260, 16);
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#24434d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivot.x, pivot.y);
    ctx.lineTo(bob.x, bob.y);
    ctx.stroke();

    ctx.fillStyle = "#4776d9";
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#17323a";
    ctx.font = "700 17px Inter, sans-serif";
    ctx.fillText(`Period: ${period().toFixed(2)} s`, 52, 58);
    ctx.fillText(`Length: ${state.length.toFixed(1)} m`, 52, 86);

    ctx.strokeStyle = "rgba(232, 85, 85, 0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, lengthPx, Math.PI / 2 - amplitude, Math.PI / 2 + amplitude);
    ctx.stroke();
  }

  function loop() {
    state.time += 0.018;
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function restart() {
    state.time = 0;
    feedback.textContent = "Simulation restarted. Change one variable and observe how the period changes.";
  }

  function tutorState() {
    readInputs();
    return { ...state, period: period() };
  }

  [lengthInput, angleInput, gravityInput].forEach((input) => {
    input.addEventListener("input", () => {
      draw();
      SimuStorage.set("pendulum", { length: state.length, gravity: state.gravity });
    });
  });

  document.getElementById("restartPendulum").addEventListener("click", restart);
  document.getElementById("pendulumHint").addEventListener("click", () => {
    feedback.textContent = AITutor.pendulum.hint(tutorState());
  });
  document.getElementById("pendulumExplain").addEventListener("click", () => {
    feedback.textContent = AITutor.pendulum.explain(tutorState());
  });
  document.getElementById("pendulumQuiz").addEventListener("click", () => {
    feedback.textContent = AITutor.pendulum.quiz(tutorState());
  });

  loop();
  window.addEventListener("pagehide", () => cancelAnimationFrame(animationId));
})();
