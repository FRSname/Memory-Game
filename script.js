document.addEventListener("DOMContentLoaded", () => {
  const nicknameInput = document.getElementById("nicknameInput");
  const setSelect = document.getElementById("cardSetSelect");
  const startButton = document.getElementById("startButton");
  const gameBoard = document.getElementById("gameBoard");
  const moveCounter = document.getElementById("moveCounter");
  const timerDisplay = document.getElementById("timer");
  const restartButton = document.getElementById("restartButton");
  const scoreList = document.getElementById("scoreList");

  let cards = [];
  let flippedCards = [];
  let matchedCards = 0;
  let moves = 0;
  let timer;
  let secondsElapsed = 0;
  let playerName = "";
  let currentSet = "";
  const totalPairs = 36; // Change if you have a different number of pairs

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function updateMoveCounter() {
    moveCounter.textContent = moves;
  }

  function startTimer() {
    secondsElapsed = 0;
    timerDisplay.textContent = "0";
    timer = setInterval(() => {
      secondsElapsed++;
      timerDisplay.textContent = `${secondsElapsed}`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function startGame(name, set) {
    playerName = name;
    currentSet = set;
    gameBoard.innerHTML = "";
    moves = 0;
    matchedCards = 0;
    flippedCards = [];
    updateMoveCounter();
    stopTimer();
    startTimer();
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
      if (
        getPairNumber(first.image) !== null &&
        getPairNumber(first.image) === getPairNumber(second.image)
      ) {
        first.card.classList.add("matched");
        second.card.classList.add("matched");
        flippedCards = [];
        matchedCards++;
        if (matchedCards === totalPairs) {
          setTimeout(endGame, 800);
        }
      } else {
        setTimeout(() => {
          first.card.classList.remove("flipped");
          second.card.classList.remove("flipped");
          flippedCards = [];
        }, 1000);
      }
    }
  }

  function endGame() {
    stopTimer();
    const scoreItem = document.createElement("div");
    scoreItem.textContent = `${playerName} - Moves: ${moves}, Time: ${secondsElapsed}s`;
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
