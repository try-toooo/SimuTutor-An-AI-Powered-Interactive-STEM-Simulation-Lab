(function () {
  const canvas = document.getElementById("fieldCanvas");
  const ctx = canvas.getContext("2d");
  const feedback = document.getElementById("fieldFeedback");
  const summary = document.getElementById("fieldSummary");
  const positiveMode = document.getElementById("positiveMode");
  const negativeMode = document.getElementById("negativeMode");

  const state = {
    mode: 1,
    charges: [
      { x: 300, y: 260, q: 1 },
      { x: 600, y: 260, q: -1 }
    ]
  };

  function drawBackground() {
    ctx.fillStyle = "#eef7f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(23, 50, 58, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 45; x < canvas.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 32);
      ctx.lineTo(x, canvas.height - 32);
      ctx.stroke();
    }
    for (let y = 38; y < canvas.height; y += 52) {
      ctx.beginPath();
      ctx.moveTo(34, y);
      ctx.lineTo(canvas.width - 34, y);
      ctx.stroke();
    }
  }

  function fieldAt(x, y) {
    let fx = 0;
    let fy = 0;
    state.charges.forEach((charge) => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const distanceSq = Math.max(900, dx * dx + dy * dy);
      const distance = Math.sqrt(distanceSq);
      const strength = charge.q * 18000 / distanceSq;
      fx += strength * dx / distance;
      fy += strength * dy / distance;
    });
    return { fx, fy };
  }

  function drawArrow(x, y, fx, fy) {
    const magnitude = Math.hypot(fx, fy);
    if (magnitude < 0.01) return;
    const length = Math.min(32, 12 + magnitude * 5);
    const ux = fx / magnitude;
    const uy = fy / magnitude;
    const endX = x + ux * length;
    const endY = y + uy * length;

    ctx.strokeStyle = `rgba(31, 122, 140, ${Math.min(0.85, 0.32 + magnitude / 9)})`;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - ux * length * 0.45, y - uy * length * 0.45);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - ux * 9 - uy * 5, endY - uy * 9 + ux * 5);
    ctx.lineTo(endX - ux * 9 + uy * 5, endY - uy * 9 - ux * 5);
    ctx.closePath();
    ctx.fill();
  }

  function drawCharges() {
    state.charges.forEach((charge) => {
      ctx.fillStyle = charge.q > 0 ? "#e85555" : "#4776d9";
      ctx.beginPath();
      ctx.arc(charge.x, charge.y, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "800 30px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(charge.q > 0 ? "+" : "-", charge.x, charge.y - 1);
    });
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  function counts() {
    const positive = state.charges.filter((charge) => charge.q > 0).length;
    const negative = state.charges.filter((charge) => charge.q < 0).length;
    return { positive, negative, total: state.charges.length };
  }

  function draw() {
    drawBackground();
    for (let x = 74; x < canvas.width - 48; x += 56) {
      for (let y = 70; y < canvas.height - 48; y += 50) {
        const field = fieldAt(x, y);
        drawArrow(x, y, field.fx, field.fy);
      }
    }
    drawCharges();
    const stats = counts();
    summary.textContent = `Positive: ${stats.positive} | Negative: ${stats.negative}`;
  }

  function setMode(mode) {
    state.mode = mode;
    positiveMode.classList.toggle("active", mode > 0);
    negativeMode.classList.toggle("active", mode < 0);
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("click", (event) => {
    const point = getCanvasPoint(event);
    if (state.charges.length >= 8) state.charges.shift();
    state.charges.push({ x: point.x, y: point.y, q: state.mode });
    feedback.textContent = state.mode > 0
      ? "Positive charge added. Field arrows point away from this charge."
      : "Negative charge added. Field arrows point toward this charge.";
    SimuStorage.set("field", counts());
    draw();
  });

  positiveMode.addEventListener("click", () => setMode(1));
  negativeMode.addEventListener("click", () => setMode(-1));
  document.getElementById("clearField").addEventListener("click", () => {
    state.charges = [];
    feedback.textContent = "Field cleared. Add a positive or negative charge to begin.";
    draw();
  });
  document.getElementById("fieldHint").addEventListener("click", () => {
    feedback.textContent = AITutor.field.hint(counts());
  });
  document.getElementById("fieldExplain").addEventListener("click", () => {
    feedback.textContent = AITutor.field.explain(counts());
  });
  document.getElementById("fieldQuiz").addEventListener("click", () => {
    feedback.textContent = AITutor.field.quiz(counts());
  });

  draw();
})();
