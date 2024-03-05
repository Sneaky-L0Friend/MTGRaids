let playerHealth = {};

function increasePlayerHealth(player, amount) {
  playerHealth[player] = playerHealth[player] + amount;
  updatePlayerHealth(player);
}

function decreasePlayerHealth(player, amount) {
  playerHealth[player] = playerHealth[player] - amount;
  updatePlayerHealth(player);
}

function updatePlayerHealth(player) {
  const playerHealthElement = document.getElementById(`player${player}Health`);
  playerHealthElement.innerHTML = `<div class="controls2">
                                  <div class="button-wrapper">
                                    <button style="cursor: pointer;" onclick="increasePlayerHealth(${player}, 10)">+10</button>
                                    <button style="cursor: pointer;" onclick="increasePlayerHealth(${player}, 1)">+</button>
                                    <button style="cursor: pointer;" onclick="decreasePlayerHealth(${player}, 1)">-</button>
                                    <button style="cursor: pointer;" onclick="decreasePlayerHealth(${player}, 10)">-10</button>
                                  </div>
                                  <div class="display-box">Player ${player} Health: ${playerHealth[player]}</div>
                                </div>`;
}

function createPlayerHealthBoxes(numberOfPlayers) {
  const playerHealthContainer = document.getElementById(
    "playerHealthContainer",
  );

  // Clear existing player health boxes
  playerHealthContainer.innerHTML = "";

  // Dynamically create player health boxes
  for (let i = 1; i <= numberOfPlayers; i++) {
    const playerHealthBox = document.createElement("div");
    playerHealthBox.className = "player-health-box";
    playerHealthBox.id = `player${i}Health`;

    playerHealthBox.innerHTML = `<div class="controls2">
                                  <div class="button-wrapper">
                                    <button style="cursor: pointer;"onclick="increasePlayerHealth(${i}, 10)">+10</button>
                                    <button style="cursor: pointer;"onclick="increasePlayerHealth(${i}, 1)">+</button>
                                    <button style="cursor: pointer;"onclick="decreasePlayerHealth(${i}, 1)">-</button>
                                    <button style="cursor: pointer;"onclick="decreasePlayerHealth(${i}, 10)">-10</button>
                                  </div>
                                  <div class="display-box">Player ${i} Health: 40</div>
                                </div>
                                `;

    playerHealthContainer.appendChild(playerHealthBox);

    // Initialize player health object
    playerHealth[i] = 40;
  }
}
