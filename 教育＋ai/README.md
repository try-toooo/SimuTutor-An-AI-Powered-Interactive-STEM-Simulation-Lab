# SimuTutor

An AI-Powered Interactive STEM Simulation Lab.

## Pitch

SimuTutor helps students learn STEM concepts through interactive Canvas simulations, adaptive hints, and real-time visual explanations.

## Problem

STEM concepts are often difficult for students because formulas can feel abstract, formula-heavy, and disconnected from visual intuition.

## Solution

SimuTutor turns STEM learning into an interactive experiment cycle:

Change parameters -> run simulation -> observe the result -> get an adaptive hint -> try again -> understand the concept.

## Key Features

- Real-time Canvas 2D simulations
- Rule-based adaptive AI tutoring engine
- Personalized hints based on simulation outcomes
- Concept explanations and generated quiz prompts
- Fully browser-based experience with no backend or API key required
- Responsive English UI for hackathon demos

## Labs

- Projectile Motion Lab: velocity, launch angle, gravity, target distance, hit detection, adaptive feedback
- Pendulum Lab: pendulum length, initial angle, gravity, period visualization
- Electric Field Lab: clickable positive and negative charges with field vector visualization

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Canvas 2D
- LocalStorage

## AI Tutor Design

Instead of relying on external APIs, SimuTutor runs entirely in the browser with a deterministic tutoring engine. The engine analyzes simulation states and generates adaptive hints, explanations, misconception feedback, and quiz prompts.

## Demo Flow

1. Open SimuTutor.
2. Choose Projectile Motion Lab.
3. Change velocity and angle.
4. Launch the projectile.
5. Observe whether it misses or hits the target.
6. Click Ask for Hint.
7. Adjust parameters based on the tutor feedback.
8. Launch again and hit the target.
9. Click Explain Result.
10. Briefly show Pendulum Lab and Electric Field Lab.

## Run Locally

Open `index.html` in a browser.
