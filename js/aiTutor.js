(function () {
  function format(value, digits = 1) {
    return Number(value).toFixed(digits);
  }

  function projectileRange(state) {
    const angle = state.angle * Math.PI / 180;
    return (state.velocity * state.velocity * Math.sin(2 * angle)) / state.gravity;
  }

  function projectileDiagnosis(state) {
    const range = state.range ?? projectileRange(state);
    const target = state.target;
    const error = range - target;
    const tolerance = 7;

    if (Math.abs(error) <= tolerance) {
      return {
        status: "hit",
        message: "Great job! You balanced velocity and angle to reach the target zone.",
        misconception: "You used both variables together instead of treating one setting as the only answer."
      };
    }

    if (error < 0) {
      return {
        status: "short",
        message: "Your projectile landed before the target. Try increasing the velocity or using a launch angle closer to 45 degrees.",
        misconception: "Possible misconception: the projectile needs enough horizontal range, not only a higher arc."
      };
    }

    return {
      status: "far",
      message: "Your projectile went too far. Try reducing the velocity or lowering the launch angle.",
      misconception: "Possible misconception: more speed is not always better when the target distance is fixed."
    };
  }

  window.AITutor = {
    projectile: {
      hint(state) {
        return projectileDiagnosis(state).message;
      },
      explain(state) {
        const diagnosis = projectileDiagnosis(state);
        const range = state.range ?? projectileRange(state);
        return `The predicted range is ${format(range)} m while the target is ${format(state.target)} m. Projectile range depends on initial velocity, launch angle, and gravity. ${diagnosis.misconception}`;
      },
      quiz(state) {
        const angle = Math.min(75, Number(state.angle) + 10);
        return `Quiz: If velocity stays at ${format(state.velocity)} m/s and the angle changes from ${format(state.angle, 0)} degrees to ${format(angle, 0)} degrees, what do you predict will happen to the range? Explain your reason before testing it.`;
      }
    },
    pendulum: {
      hint(state) {
        if (state.length >= 2.8) {
          return "This pendulum is long, so it should swing more slowly. Try shortening it and compare the period.";
        }
        if (state.gravity <= 7) {
          return "Gravity is low, so the pendulum takes longer to complete a swing. Increase gravity and observe the period.";
        }
        return "Change one variable at a time. Length usually has the clearest effect on the period.";
      },
      explain(state) {
        return `The estimated period is ${format(state.period, 2)} s. A longer pendulum usually has a longer period because the bob travels through a larger arc and accelerates back more slowly. Stronger gravity makes the period shorter.`;
      },
      quiz(state) {
        return `Quiz: If the pendulum length increases from ${format(state.length)} m to ${format(Math.min(4, state.length + 1))} m while gravity stays the same, should the period increase or decrease?`;
      }
    },
    field: {
      hint(state) {
        if (state.positive === 0 || state.negative === 0) {
          return "Try placing both positive and negative charges. Compare how arrows leave positive charges and point toward negative charges.";
        }
        if (state.total > 4) {
          return "You have a complex field. Focus on one point and ask which nearby charge has the strongest influence.";
        }
        return "Move charges closer together to see the vectors become stronger between them.";
      },
      explain(state) {
        return `This field has ${state.positive} positive charge(s) and ${state.negative} negative charge(s). Electric field vectors point away from positive charges and toward negative charges. The arrows become stronger near charges and weaker farther away.`;
      },
      quiz() {
        return "Quiz: If you place two positive charges near each other, what direction should the field arrows point between them, and why?";
      }
    }
  };
})();
