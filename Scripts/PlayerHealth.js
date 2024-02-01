let playerHealth = {};


function increasePlayerHealth(player) {
  playerHealth[player]++;
  updatePlayerHealth(player);
}

function decreasePlayerHealth(player) {
  playerHealth[player] = Math.max(0, playerHealth[player] - 1);
  updatePlayerHealth(player);
}

function updatePlayerHealth(player) {
  const playerHealthElement = document.getElementById(`player${player}Health`);
  playerHealthElement.innerHTML = `<div class="controls2">
                                  <div class="button-wrapper">
                                    <button onclick="increasePlayerHealth(${player})">+</button>
                                    <button onclick="decreasePlayerHealth(${player})">-</button>
                                  </div>
                                  <div class="display-box">Player ${player} Health: ${playerHealth[player]}</div>
                                </div>`;
}

function createPlayerHealthBoxes(numberOfPlayers) {
  const playerHealthContainer = document.getElementById("playerHealthContainer");

  // Clear existing player health boxes
  playerHealthContainer.innerHTML = "";

  // Dynamically create player health boxes
  for (let i = 1; i <= numberOfPlayers; i++) {
    const playerHealthBox = document.createElement("div");
    playerHealthBox.className = "player-health-box";
    playerHealthBox.id = `player${i}Health`;

    playerHealthBox.innerHTML = `<div class="controls2">
                                  <div class="button-wrapper">
                                    <button onclick="increasePlayerHealth(${i})">+</button>
                                    <button onclick="decreasePlayerHealth(${i})">-</button>
                                  </div>
                                  <div class="display-box">Player ${i} Health: 40</div>
                                </div>
                                `;

    playerHealthContainer.appendChild(playerHealthBox);

    // Initialize player health object
    playerHealth[i] = 40;
  }
}