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
  addLog("Player " + player + ", Health Changed to: " + playerHealth[player]);
  const healthDisplay = document.getElementById(`player${player}HealthDisplay`);
  if (healthDisplay) {
    healthDisplay.textContent = `Health: ${playerHealth[player]}`;
  }
}

function createPlayerHealthBoxes(numberOfPlayers) {
  const playerHealthContainer = document.getElementById("playerHealthContainer");
  if (!playerHealthContainer) {
    console.error("Player health container not found!");
    return;
  }
  
  // Clear existing player health boxes
  playerHealthContainer.innerHTML = "";

  // Dynamically create player health boxes
  for (let i = 1; i <= numberOfPlayers; i++) {
    const playerEntry = document.createElement("div");
    playerEntry.className = "player-entry";
    
    // Create player name input
    const playerName = document.createElement("div");
    playerName.className = "player-name";
    playerName.innerHTML = `<input type="text" placeholder="Player ${i}" />`;
    
    // Create health controls
    const healthControls = document.createElement("div");
    healthControls.className = "player-health-controls";
    
    // Create health buttons
    const healthButtons = document.createElement("div");
    healthButtons.className = "health-buttons";
    healthButtons.innerHTML = `
      <button onclick="window.increasePlayerHealth(${i}, 10)">+10</button>
      <button onclick="window.increasePlayerHealth(${i}, 1)">+</button>
      <button onclick="window.decreasePlayerHealth(${i}, 1)">-</button>
      <button onclick="window.decreasePlayerHealth(${i}, 10)">-10</button>
    `;
    
    // Create health display
    const healthDisplay = document.createElement("div");
    healthDisplay.className = "health-display";
    healthDisplay.id = `player${i}HealthDisplay`;
    healthDisplay.textContent = `Health: 40`;
    
    // Assemble the components
    healthControls.appendChild(healthButtons);
    healthControls.appendChild(healthDisplay);
    playerEntry.appendChild(playerName);
    playerEntry.appendChild(healthControls);
    playerHealthContainer.appendChild(playerEntry);
    
    // Initialize player health object
    playerHealth[i] = 40;
  }
  
  // Make sure the player health container is visible
  playerHealthContainer.style.display = "flex";
}

function modifyPlayerHealthFromMonster(monsterDamage) {
  for (let i = 1; i <= numberOfPlayersGlobal; i++) {
    decreasePlayerHealth(i, monsterDamage);
  }
}








