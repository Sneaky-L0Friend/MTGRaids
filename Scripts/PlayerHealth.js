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
                                  <div class="display-box">Health: ${playerHealth[player]}</div>
                                </div>`;
}

function createPlayerHealthBoxes(numberOfPlayers) {
  const playerHealthContainer = document.getElementById(
    "playerHealthContainer",
  );
  const playerHealthNamesContainer = document.getElementById(
    "playerHealthNamesContainer",
  );

  // Clear existing player health boxes
  playerHealthContainer.innerHTML = "";
  playerHealthNamesContainer.innerHTML = "";

  // Dynamically create player health boxes
  for (let i = 1; i <= numberOfPlayers; i++) {
    const playerHealthNamesBox = document.createElement("div");
    const playerHealthBox = document.createElement("div");
    playerHealthBox.className = "player-health-box";
    playerHealthBox.id = `player${i}Health`;
    playerHealthNamesBox.id = `player${i}HealthNames`;
    playerHealthNamesBox.innerHTML = `<div class="controls2">
                                              <input
                                                  class="display-box"
                                                  type="text"
                                                  style="text-align: center; width: 115px; font-size: 20px;"
                                                  placeholder="Player ${i}"
                                                />
                                            </div>
                                            `;
    playerHealthBox.innerHTML = `<div class="controls2">
                                  <div class="button-wrapper">
                                    <button style="cursor: pointer;"onclick="increasePlayerHealth(${i}, 10)">+10</button>
                                    <button style="cursor: pointer;"onclick="increasePlayerHealth(${i}, 1)">+</button>
                                    <button style="cursor: pointer;"onclick="decreasePlayerHealth(${i}, 1)">-</button>
                                    <button style="cursor: pointer;"onclick="decreasePlayerHealth(${i}, 10)">-10</button>
                                  </div>
                                  <div class="display-box">Health: 40</div>
                                </div>
                                `;

    playerHealthContainer.appendChild(playerHealthBox);
    playerHealthNamesContainer.appendChild(playerHealthNamesBox);

    // Initialize player health object
    playerHealth[i] = 40;
  }

}
function modifyPlayerHealthFromMonster(monsterDamage) {
  for (let i = 1; i <= numberOfPlayersGlobal; i++) {
    decreasePlayerHealth(i, monsterDamage);
  }
}
