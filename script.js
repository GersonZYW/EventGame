// =======================
// 🎮 CONTROLE DO JOGO
// =======================
let gameStarted = false;
let isGameOver = false;
let spawnTimeout;

let score = 0;
let speed = 2;
let distance = 0;
let record = parseFloat(localStorage.getItem("record")) || 0;

// =======================
// 📌 ELEMENTOS
// =======================
const player = document.getElementById("player");
const gameOverScreen = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const saveBtn = document.getElementById("save-score");
const nameInput = document.getElementById("player-name");
const rankingDiv = document.getElementById("ranking");

const gameBoard = document.querySelector(".game-board");

// =======================
// 🖥️ HUD
// =======================
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "10px";
scoreElement.style.right = "20px";
scoreElement.style.color = "white";
scoreElement.innerText = "Obstáculos: 0";

const distanceElement = document.createElement("div");
distanceElement.style.position = "absolute";
distanceElement.style.top = "40px";
distanceElement.style.right = "20px";
distanceElement.style.color = "white";
distanceElement.innerText = "KM: 0.00";

const recordElement = document.createElement("div");
recordElement.style.position = "absolute";
recordElement.style.top = "70px";
recordElement.style.right = "20px";
recordElement.style.color = "yellow";
recordElement.innerText = "Recorde: " + record.toFixed(2) + " KM";

gameBoard.appendChild(scoreElement);
gameBoard.appendChild(distanceElement);
gameBoard.appendChild(recordElement);

// Deixa apenas a tela de início visível no começo de tudo
startScreen.style.display = "flex";
gameOverScreen.style.display = "none";

// =======================
// 🏃 BACKGROUND BOLHAS
// =======================
function createBolhas() {
  const bodyContainer = document.body;
  if (!bodyContainer) return;

  const bubble = document.createElement('span');
  const size = Math.random() * 60;

  bubble.className = 'bubble-externa';
  bubble.style.width = 20 + size + 'px';
  bubble.style.height = 20 + size + 'px';
  bubble.style.left = Math.random() * window.innerWidth + 'px';

  bodyContainer.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 4000);
}
setInterval(createBolhas, 100);

// =======================
// 🏃 ANIMAÇÃO DO PLAYER
// =======================
let frame = 0;
const totalFrames = 16;
const frameWidth = 96;

setInterval(() => {
  if (!gameStarted || isGameOver) return;

  frame = (frame + 1) % totalFrames;
  player.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
}, 80);

// =======================
// 🦘 PULO
// =======================
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();

    if (!gameStarted && !isGameOver) {
      startGame();
      return;
    }

    if (!player.classList.contains("jump") && !isGameOver) {
      player.classList.add("jump");

      setTimeout(() => {
        player.classList.remove("jump");
      }, 500);
    }
  }
});

// =======================
// ▶️ START
// =======================
function startGame() {
  gameStarted = true;
  isGameOver = false;
  
  // Esconde todas as telas para limpar o tabuleiro
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  
  player.style.filter = "none"; // Remove o preto e branco caso estivesse em Game Over
  
  spawnLoop();
}

startBtn.addEventListener("click", startGame);

// =======================
// 🔄 RESTART (CORRIGIDO: Sem dar reload na página inteira)
// =======================
restartBtn.addEventListener("click", () => {
  // 1. Limpa todos os obstáculos antigos que ficaram travados na tela
  document.querySelectorAll(".obstacle").forEach(obs => obs.remove());

  // 2. Reseta as variáveis do estado do jogo
  score = 0;
  distance = 0;
  speed = 2;
  isGameOver = false;
  gameStarted = false;

  // 3. Reseta os textos da HUD para o valor inicial
  scoreElement.innerText = "Obstáculos: 0";
  distanceElement.innerText = "KM: 0.00";
  
  // Atualiza o recorde visual caso o jogador tenha batido a meta anterior
  record = parseFloat(localStorage.getItem("record")) || 0;
  recordElement.innerText = "Recorde: " + record.toFixed(2) + " KM";

  // 4. Habilita o botão de salvar novamente para a próxima partida
  saveBtn.disabled = false;
  nameInput.value = "";

  // 5. Esconde o Game Over e volta para a Tela de Início limpa
  gameOverScreen.style.display = "none";
  startScreen.style.display = "flex";
});

// =======================
// ⚡ VELOCIDADE
// =======================
function increaseSpeed() {
  speed -= 0.1;
  if (speed < 0.8) speed = 0.8;
}

// =======================
// 🛣️ DISTÂNCIA
// =======================
setInterval(() => {
  if (!gameStarted || isGameOver) return;

  distance += 0.05;
  distanceElement.innerText = "KM: " + distance.toFixed(2);
}, 100);

// =======================
// 🧱 OBSTÁCULOS
// =======================
const obstaclesList = [
  "images/rock.png",
  "images/espinho.png",
  "images/passaro.png",
];

function createObstacle() {
  if (!gameStarted || isGameOver) return;

  const obstacle = document.createElement("img");
  const random = Math.floor(Math.random() * obstaclesList.length);
  const type = obstaclesList[random];

  obstacle.src = type;
  obstacle.dataset.type = type;
  obstacle.classList.add("obstacle");
  obstacle.style.position = "absolute";
  obstacle.style.right = "-80px";
  obstacle.style.width = "80px";

  if (type.includes("passaro")) {
    obstacle.style.bottom = "120px";
  } else if (type.includes("espinho")) {
    obstacle.style.bottom = "-15px";
  } else {
    obstacle.style.bottom = "-10px";
  }

  obstacle.style.animation = `rock-animation ${speed}s linear`;
  gameBoard.appendChild(obstacle);

  setTimeout(() => {
    obstacle.remove();
  }, speed * 1000);
}

function spawnLoop() {
  if (!gameStarted || isGameOver) return;

  createObstacle();
  const tempo = 1000 + Math.random() * 1500;
  spawnTimeout = setTimeout(spawnLoop, tempo);
}

// =======================
// 🏆 RANKING
// =======================
function getRanking() {
  return JSON.parse(localStorage.getItem("ranking")) || [];
}

function saveRanking(ranking) {
  localStorage.setItem("ranking", JSON.stringify(ranking));
}

function renderRanking() {
  const ranking = getRanking();
  rankingDiv.innerHTML = "<h2>TOP 3</h2>";

  ranking.forEach((p, i) => {
    rankingDiv.innerHTML += `<p>${i + 1}º - ${p.name} (${parseFloat(p.score).toFixed(2)} KM)</p>`;
  });
}

saveBtn.addEventListener("click", () => {
  const name = nameInput.value.trim() || "Player";
  let ranking = getRanking();

  if (ranking.length === 3 && distance <= parseFloat(ranking.score)) {
    alert("Pontuação muito baixa para TOP 3!");
    return;
  }

  ranking = ranking.filter(p => p.name !== name);
  ranking.push({ name, score: distance });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 3);

  saveRanking(ranking);
  renderRanking();

  saveBtn.disabled = true;
});

// =======================
// 🔁 LOOP PRINCIPAL (COLISÃO)
// =======================
setInterval(() => {
  if (!gameStarted || isGameOver) return;

  const playerPosition = +window.getComputedStyle(player).bottom.replace('px', '');
  const playerTop = playerPosition + 96;
  const obstacles = document.querySelectorAll(".obstacle");

  obstacles.forEach((obs) => {
    const obsPosition = obs.offsetLeft;

    if (obs.dataset.type.includes("passaro")) {
      if (obsPosition < 65 && obsPosition > 0 && playerTop > 100) {
        gameOver();
      }
      return;
    }

    let hitboxX = 60;
    let hitboxY = 65;

    if (obs.dataset.type.includes("espinho")) {
      hitboxY = 55;
    }

    if (obsPosition < hitboxX && obsPosition > 0 && playerPosition < hitboxY) {
      gameOver();
    }

    if (obsPosition < 0 && !obs.passed) {
      score++;
      obs.passed = true;
      scoreElement.innerText = "Obstáculos: " + score;

      if (score % 3 === 0) {
        increaseSpeed();
      }
    }
  });
}, 10);

// =======================
// 💥 GAME OVER
// =======================
function gameOver() {
  isGameOver = true;
  clearTimeout(spawnTimeout);

  document.querySelectorAll(".obstacle").forEach(o => {
    o.style.animation = "none";
  });

  player.style.filter = "grayscale(100%)";

  if (distance > record) {
    localStorage.setItem("record", distance);
  }

  gameOverScreen.style.display = "flex";
  renderRanking();
}
