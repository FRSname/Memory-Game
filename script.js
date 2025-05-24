document.addEventListener("DOMContentLoaded", () => {
  const nicknameInput = document.getElementById("nicknameInput");
  const setSelect = document.getElementById("cardSetSelect");
  const gameModeSelect = document.getElementById("gameModeSelect");
  const startButton = document.getElementById("startButton");
  const gameBoard = document.getElementById("gameBoard");
  const moveCounter = document.getElementById("moveCounter");
  const timerDisplay = document.getElementById("timer");
  const restartButton = document.getElementById("restartButton");
  const scoreList = document.getElementById("scoreList");
  const controls = document.getElementById("controls");

  let cards = [];
  let flippedCards = [];
  let matchedCards = 0;
  let moves = 0;
  let timer;
  let secondsElapsed = 0;
  let playerName = "";
  let currentSet = "";
  let gameMode = "classic";
  let totalPairs = 36; // Change if you have a different number of pairs

  // Two Players mode
  let currentPlayer = 1;
  let player1Score = 0;
  let player2Score = 0;

  // --- CELEBRATION EFFECTS ---
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let confetti = [];
    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 100 + 10,
        color: `hsl(${Math.floor(Math.random()*360)},70%,60%)`,
        tilt: Math.random() * 10 - 10
      });
    }

    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      confetti.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
        ctx.fillStyle = c.color;
        ctx.fill();
      });
      update();
    }

    let angle = 0;
    function update() {
      angle += 0.01;
      confetti.forEach((c,i) => {
        c.y += (Math.cos(angle + c.d) + 3 + c.r/2)/2;
        c.x += Math.sin(angle) * 2;
        if (c.y > canvas.height) {
          c.x = Math.random() * canvas.width;
          c.y = -10;
        }
      });
    }

    let frame = 0;
    function animate() {
      if (frame++ < 150) {
        draw();
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }
    animate();
  }

  function cardCascadeAnimation() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      // Randomize direction and rotation
      const dx = (Math.random() - 0.5) * 600; // px
      const dy = (Math.random() - 0.5) * 200; // px
      const rot = (Math.random() - 0.5) * 360; // deg
      card.style.setProperty('--dx', `${dx}px`);
      card.style.setProperty('--dy', `${dy}px`);
      card.style.setProperty('--rot', `${rot}deg`);
      card.classList.add('celebrate');
    });
  }
  // --- END CELEBRATION EFFECTS ---

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function updateMoveCounter() {
    moveCounter.textContent = moves;
  }

  function startTimer(duration) {
    stopTimer();
    if (gameMode === "timeClash") {
      secondsElapsed = duration || 120; // 2 minutes
      updateTimerDisplay();
      timer = setInterval(() => {
        secondsElapsed--;
        updateTimerDisplay();
        if (secondsElapsed <= 0) {
          endGame();
        }
      }, 1000);
    } else {
      secondsElapsed = 0;
      updateTimerDisplay();
      timer = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
      }, 1000);
    }
  }

  function updateTimerDisplay() {
    if (gameMode === "timeClash") {
      const min = Math.floor(secondsElapsed / 60);
      const sec = String(secondsElapsed % 60).padStart(2, '0');
      timerDisplay.textContent = `${min}:${sec}`;
    } else {
      timerDisplay.textContent = `${secondsElapsed}`;
    }
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
  }

  function startGame(name, set) {
    playerName = name;
    currentSet = set;
    gameMode = gameModeSelect.value;
    gameBoard.innerHTML = "";
    moves = 0;
    matchedCards = 0;
    flippedCards = [];
    currentPlayer = 1;
    player1Score = 0;
    player2Score = 0;
    updateMoveCounter();
    stopTimer();

    // Remove old player scores if present
    document.querySelectorAll(".player-score").forEach(el => el.remove());

    // Show player scores for Two Players mode
    if (gameMode === "twoPlayers") {
      controls.appendChild(createPlayerScoreElement(1));
      controls.appendChild(createPlayerScoreElement(2));
      updatePlayerScores();
    }

    // Set totalPairs based on set (optional: adjust if you want per-set)
    totalPairs = 36;

    // Start timer
    if (gameMode === "timeClash") {
      startTimer(120);
    } else {
      startTimer(0);
    }

    generateCards(set);
  }

  function generateCards(set) {
    cards = [];
    for (let i = 1; i <= totalPairs; i++) {
      cards.push(`images/${set}/pair${i}_a.png`);
      cards.push(`images/${set}/pair${i}_b.png`);
    }
    shuffle(cards);

    const backImagePath = `images/${set}/back.png`;

    cards.forEach((src, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.index = index;

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const front = document.createElement("div");
      front.classList.add("card-front");
      front.style.backgroundImage = `url('${src}')`;

      const back = document.createElement("div");
      back.classList.add("card-back");
      back.style.backgroundImage = `url('${backImagePath}')`;

      cardInner.appendChild(front);
      cardInner.appendChild(back);
      card.appendChild(cardInner);

      card.addEventListener("click", () => handleCardClick(card, src));
      gameBoard.appendChild(card);
    });
  }

  function getPairNumber(imagePath) {
    const match = imagePath.match(/pair(\d+)_([ab])\.png$/);
    return match ? parseInt(match[1], 10) : null;
  }

  function createPlayerScoreElement(playerNumber) {
    const el = document.createElement("span");
    el.className = `player-score${playerNumber === currentPlayer ? " active" : ""}`;
    el.id = `player${playerNumber}Score`;
    el.textContent = `P${playerNumber}: 0`;
    return el;
  }

  function updatePlayerScores() {
    const p1 = document.getElementById("player1Score");
    const p2 = document.getElementById("player2Score");
    if (p1) p1.textContent = `P1: ${player1Score}`;
    if (p2) p2.textContent = `P2: ${player2Score}`;
    document.querySelectorAll(".player-score").forEach(el => {
      el.classList.remove("active");
    });
    if (currentPlayer === 1 && p1) p1.classList.add("active");
    if (currentPlayer === 2 && p2) p2.classList.add("active");
  }

  function handleCardClick(card, image) {
    if (
      card.classList.contains("flipped") ||
      card.classList.contains("matched") ||
      flippedCards.length >= 2
    ) {
      return;
    }

    card.classList.add("flipped");
    flippedCards.push({ card, image });

    if (flippedCards.length === 2) {
      moves++;
      updateMoveCounter();
      const [first, second] = flippedCards;

      if (getPairNumber(first.image) === getPairNumber(second.image)) {
        first.card.classList.add("matched");
        second.card.classList.add("matched");
        flippedCards = [];
        matchedCards++;

        // Two Players: update score, allow another turn
        if (gameMode === "twoPlayers") {
          if (currentPlayer === 1) player1Score++;
          else player2Score++;
          updatePlayerScores();
        }

        // End game conditions
        if (
          (gameMode === "classic" || gameMode === "twoPlayers") &&
          matchedCards === totalPairs
        ) {
          setTimeout(endGame, 800);
        } else if (gameMode === "timeClash" && matchedCards === totalPairs) {
          setTimeout(endGame, 800);
        }
      } else {
        setTimeout(() => {
          first.card.classList.remove("flipped");
          second.card.classList.remove("flipped");
          flippedCards = [];

          // Two Players: switch turn
          if (gameMode === "twoPlayers") {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerScores();
          }
        }, 1000);
      }
    }
  }

  function endGame() {
    stopTimer();

    // Celebration effects!
    cardCascadeAnimation();
    launchConfetti();

    let resultText = "";
    switch (gameMode) {
      case "classic":
        resultText = `${playerName} - Moves: ${moves}, Time: ${secondsElapsed}s`;
        break;
      case "timeClash":
        resultText = `${playerName} - Pairs Found: ${matchedCards}`;
        break;
      case "twoPlayers":
        resultText = `P1: ${player1Score} vs P2: ${player2Score}`;
        break;
    }
    const scoreItem = document.createElement("div");
    scoreItem.textContent = resultText;
    scoreList.appendChild(scoreItem);
  }

  startButton.addEventListener("click", () => {
    const name = nicknameInput.value.trim();
    const selectedSet = setSelect.value;
    if (!name || !selectedSet) {
      alert("Please enter your nickname and select a card set.");
      return;
    }
    startGame(name, selectedSet);
  });

  restartButton.addEventListener("click", () => {
    if (!playerName || !currentSet) return;
    startGame(playerName, currentSet);
  });
});
