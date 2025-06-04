// MultiplayerSync.js - Handles multiplayer synchronization

let socket = null;
let roomCode = null;
let isHost = false;
let lastSyncedState = null;
let syncEnabled = false;

// Connect to WebSocket server
function connectToServer() {
  // Replace with your Glitch URL (change from https:// to wss://)
  const serverUrl = 'https://picayune-tricky-clerk.glitch.me';
  
  socket = new WebSocket(serverUrl);
  
  socket.onopen = () => {
    console.log('Connected to sync server');
    showMessage('Connected to multiplayer server');
  };
  
  socket.onclose = () => {
    console.log('Disconnected from sync server');
    showMessage('Disconnected from multiplayer session');
    syncEnabled = false;
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    showMessage('Error connecting to multiplayer server');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleServerMessage(data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
}

// Handle incoming messages from server
function handleServerMessage(data) {
  switch (data.type) {
    case 'room_created':
      roomCode = data.roomCode;
      isHost = true;
      syncEnabled = true;
      displayRoomCode(roomCode);
      showMessage(`Room created: ${roomCode}`);
      break;
      
    case 'room_joined':
      roomCode = data.roomCode;
      syncEnabled = true;
      displayRoomCode(roomCode);
      showMessage(`Joined room: ${roomCode}`);
      
      // Apply received game state
      if (data.gameState) {
        applyGameState(data.gameState);
      }
      
      // Hide the starting screen
      const startingScreen = document.querySelector(".starting-screen");
      if (startingScreen) {
        startingScreen.style.display = "none";
      }
      
      // Hide the multiplayer container
      const multiplayerContainers = document.querySelectorAll('.multiplayer-container');
      multiplayerContainers.forEach(container => {
        container.style.display = 'none';
      });
      
      // Show the top section container
      const topSectionContainer = document.querySelector(".top-section-container");
      if (topSectionContainer) {
        topSectionContainer.style.display = "flex";
      }
      
      // Show dice log
      const diceLog = document.getElementById("diceLog");
      if (diceLog) {
        diceLog.style.display = "block";
      }
      
      // Show game action buttons
      const gameActionButtons = document.getElementById("gameActionButtons");
      if (gameActionButtons) {
        gameActionButtons.style.display = "block";
      }
      
      // Show monster controls
      const monsterControls = document.getElementById("monsterControls");
      if (monsterControls) {
        monsterControls.style.display = "flex";
      }
      
      // Show turn and infect controls
      const turnInfectControls = document.getElementById("turnInfectControls");
      if (turnInfectControls) {
        turnInfectControls.style.display = "flex";
      }
      
      // Show monster stats container
      const monsterStatsContainer = document.querySelector(".monster-stats-container");
      if (monsterStatsContainer) {
        monsterStatsContainer.style.display = "flex";
      }
      
      // Set game started flag
      window.startedGame = true;
      break;
      
    case 'client_joined':
      showMessage(`Another player joined (${data.clientCount} total)`);
      break;
      
    case 'client_left':
      showMessage(`A player left (${data.clientCount} remaining)`);
      break;
      
    case 'game_update':
      if (!isHost) {
        // Apply received game state
        applyGameState(data.gameState);
        
        // Show action notification
        if (data.action) {
          showMessage(`Remote action: ${data.action}`);
        }
      }
      break;
      
    case 'error':
      showMessage(`Error: ${data.message}`);
      break;
      
    case 'request_sync':
      if (isHost) {
        // Send full game state to all clients
        const fullState = captureFullGameState();
        socket.send(JSON.stringify({
          type: 'game_update',
          gameState: fullState,
          action: 'Full state sync'
        }));
      }
      break;
  }
}

// Create a new room when starting a game
function createRoom() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    connectToServer();
    
    // Wait for connection to establish before creating room
    const checkInterval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        clearInterval(checkInterval);
        
        socket.send(JSON.stringify({
          type: 'create_room',
          gameState: captureGameState()
        }));
      }
    }, 100);
  } else {
    socket.send(JSON.stringify({
      type: 'create_room',
      gameState: captureGameState()
    }));
  }
}

// Join an existing room
function joinRoom(code) {
  if (!code) return;
  
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    connectToServer();
    
    // Wait for connection to establish before joining room
    const checkInterval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        clearInterval(checkInterval);
        
        socket.send(JSON.stringify({
          type: 'join_room',
          roomCode: code
        }));
      }
    }, 100);
  } else {
    socket.send(JSON.stringify({
      type: 'join_room',
      roomCode: code
    }));
  }
}

// Sync game state after an action
function syncGameState(actionDescription) {
  if (!syncEnabled || !socket || socket.readyState !== WebSocket.OPEN) return;
  
  const currentState = captureGameState();
  
  // Only send if state has changed
  if (JSON.stringify(currentState) !== JSON.stringify(lastSyncedState)) {
    socket.send(JSON.stringify({
      type: 'game_update',
      gameState: currentState,
      action: actionDescription
    }));
    
    lastSyncedState = currentState;
  }
}

// Capture current game state
function captureGameState() {
  return {
    monsterHealth: window.monsterHealth,
    monsterInfect: window.monsterInfect,
    cardsInMonsterDeck: window.cardsInMonsterDeck,
    cardsInMonsterGraveyard: window.cardsInMonsterGraveyard,
    monsterHandSize: window.monsterHandSize,
    monsterLandCount: window.monsterLandCount,
    graveyard: window.graveyard,
    currentRound: window.currentRound,
    numberOfPlayersGlobal: window.numberOfPlayersGlobal,
    difficultyLevel: window.difficultyLevel,
    scryfallMonsterColors: window.scryfallMonsterColors,
    playerHealths: Array.from(document.querySelectorAll('.player-health-box')).map(box => ({
      id: box.id,
      health: parseInt(box.querySelector('.health-value').textContent),
      poison: parseInt(box.querySelector('.poison-value').textContent)
    })),
    logEntries: Array.from(document.querySelectorAll('#logContainer .log-entry')).map(entry => ({
      text: entry.querySelector('.log-text').textContent,
      imageUrl: entry.querySelector('.log-image') ? entry.querySelector('.log-image').src : null
    })).slice(-20) // Only sync last 20 log entries
  };
}

// Apply received game state
function applyGameState(gameState) {
  try {
    console.log("Applying game state:", gameState);
    
    // Set difficulty if provided
    if (gameState.difficulty) {
      difficulty = gameState.difficulty;
      setDifficultyAtStart(difficulty);
    }
    
    // Set number of players and create player health boxes if needed
    if (gameState.numberOfPlayers) {
      numberOfPlayersGlobal = gameState.numberOfPlayers;
      createPlayerHealthBoxes(numberOfPlayersGlobal);
    }
    
    // Apply monster health
    if (gameState.monsterHealth !== undefined) {
      monsterHealth = gameState.monsterHealth;
      updateMonsterHealth();
    }
    
    // Apply monster infect
    if (gameState.monsterInfect !== undefined) {
      monsterInfect = gameState.monsterInfect;
      updateMonsterInfect();
    }
    
    // Apply monster hand size
    if (gameState.monsterHandSize !== undefined) {
      monsterHandSize = gameState.monsterHandSize;
      monsterStartingHandSize = gameState.monsterStartingHandSize || monsterHandSize;
      modifiedMonsterHandSize = gameState.modifiedMonsterHandSize || monsterHandSize;
      updateMonsterHandSize();
    }
    
    // Apply monster land count
    if (gameState.monsterLandCount !== undefined) {
      currentMonsterLands = gameState.monsterLandCount;
      updateMonsterLandCountByAmount(0); // Just update display
    }
    
    // Apply current round
    if (gameState.currentRound !== undefined) {
      currentRound = gameState.currentRound;
      const roundCounter = document.getElementById('roundCounter');
      if (roundCounter) {
        roundCounter.textContent = currentRound;
      }
    }
    
    // Apply cards in monster deck
    if (gameState.cardsInMonsterDeck !== undefined) {
      cardsInMonsterDeck = gameState.cardsInMonsterDeck;
      const deckSizeElement = document.getElementById('deckSize');
      if (deckSizeElement) {
        deckSizeElement.textContent = cardsInMonsterDeck;
      }
    }
    
    // Apply cards in monster graveyard
    if (gameState.cardsInMonsterGraveyard !== undefined) {
      cardsInMonsterGraveyard = gameState.cardsInMonsterGraveyard;
    }
    
    // Apply graveyard data
    if (gameState.graveyard) {
      graveyard = gameState.graveyard;
      updateGraveyardTable();
    }
    
    // Apply milled card images
    if (gameState.milledCardImages) {
      milledCardImages = gameState.milledCardImages;
    }
    
    // Apply boss monster image if provided
    if (gameState.bossMonsterImageUrl) {
      bossMonsterImageUrl = gameState.bossMonsterImageUrl;
      
      // Find the monster image container
      const monsterImageContainer = document.getElementById("monsterImageContainer");
      if (monsterImageContainer) {
        // Clear any existing content
        monsterImageContainer.innerHTML = "";
        
        // Create image element
        let imgElement = document.createElement("img");
        imgElement.src = bossMonsterImageUrl;
        imgElement.alt = "Boss Monster";
        imgElement.style.maxWidth = "100%";
        imgElement.style.maxHeight = "100%";
        
        // Create anchor element with proper link
        let anchorElement = document.createElement("a");
        if (gameState.monsterScryfallLink) {
          anchorElement.href = gameState.monsterScryfallLink;
        } else {
          // Default link if specific one not found
          anchorElement.href = "https://scryfall.com/search?q=commander%3A" + (gameState.monsterColor || "wubrg");
        }
        anchorElement.target = "_blank";
        anchorElement.appendChild(imgElement);
        
        // Add the anchor element to the container
        monsterImageContainer.appendChild(anchorElement);
      }
    }
    
    // Apply player health values
    if (gameState.playerHealth && Array.isArray(gameState.playerHealth)) {
      gameState.playerHealth.forEach((health, index) => {
        const playerHealthElement = document.getElementById(`player${index + 1}Health`);
        if (playerHealthElement) {
          playerHealthElement.textContent = health;
        }
      });
    }
    
    // Apply player poison values
    if (gameState.playerPoison && Array.isArray(gameState.playerPoison)) {
      gameState.playerPoison.forEach((poison, index) => {
        const playerPoisonElement = document.getElementById(`player${index + 1}Poison`);
        if (playerPoisonElement) {
          playerPoisonElement.textContent = poison;
        }
      });
    }
    
    // Apply minions if available
    if (gameState.minions && Array.isArray(gameState.minions)) {
      const container = document.getElementById("imageContainer");
      if (container) {
        // Clear existing minions
        container.innerHTML = "";
        
        // Add saved minions
        gameState.minions.forEach(minion => {
          const imageContainer = document.createElement("div");
          imageContainer.className = "image-container";
          
          const img = document.createElement("img");
          img.src = `Minions/${minion.number}.jpeg`;
          img.alt = "Minion";
          img.style.width = "12vw";
          img.style.height = "12vh";
          
          const imageText = document.createElement("div");
          imageText.className = "image-text";
          imageText.textContent = minion.health;
          imageText.contentEditable = true;
          
          img.addEventListener("click", function () {
            removeImage(imageContainer);
          });
          
          imageContainer.appendChild(img);
          imageContainer.appendChild(imageText);
          container.appendChild(imageContainer);
        });
      }
    }
    
    // Apply log entries if available
    if (gameState.logEntries && Array.isArray(gameState.logEntries)) {
      // Clear existing log
      const logContainer = document.getElementById('logContainer');
      if (logContainer) {
        logContainer.innerHTML = '';
        
        // Add each log entry
        gameState.logEntries.forEach(entry => {
          addLogWithoutSync(entry.text, entry.imageUrl);
        });
      }
    }
    
    // Display color rectangle if monster color is provided
    if (gameState.monsterColor) {
      scryfallMonsterColors = gameState.monsterColor;
      displayColorRectangle();
    }
    
    // Initialize other game elements
    readActionJsonFiles();
    
    // Show player turn indicator
    showPlayerTurnIndicator();
    
    // Set game as started
    window.startedGame = true;
    
    console.log("Game state applied successfully");
  } catch (error) {
    console.error('Error applying game state:', error);
    showMessage('Error applying game state: ' + error.message);
  }
}

// Add log entry without triggering sync
function addLogWithoutSync(text, imageUrl) {
  const logContainer = document.getElementById('logContainer');
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  
  const logText = document.createElement('span');
  logText.className = 'log-text';
  logText.textContent = text;
  logEntry.appendChild(logText);
  
  if (imageUrl) {
    const logImage = document.createElement('img');
    logImage.className = 'log-image';
    logImage.src = imageUrl;
    logImage.alt = 'Card Image';
    logImage.onclick = function() { openPopup(imageUrl); };
    logEntry.appendChild(logImage);
  }
  
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Display room code in the UI
function displayRoomCode(code) {
  const roomCodeDisplay = document.getElementById('roomCodeDisplay');
  if (roomCodeDisplay) {
    roomCodeDisplay.textContent = `Room Code: ${code}`;
  }
  
  // Show multiplayer controls
  const multiplayerControls = document.getElementById('multiplayerControls');
  if (multiplayerControls) {
    multiplayerControls.style.display = 'block';
  }
  
  // Hide sync button for host
  const syncButton = document.getElementById('syncButton');
  if (syncButton) {
    syncButton.style.display = isHost ? 'none' : 'block';
  }
}

// Disconnect from server
function disconnectMultiplayer() {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  roomCode = null;
  isHost = false;
  syncEnabled = false;
  
  // Remove room code display
  const roomCodeDisplay = document.getElementById('roomCodeDisplay');
  if (roomCodeDisplay) {
    roomCodeDisplay.remove();
  }
  
  showMessage('Disconnected from multiplayer');
}

// Add a function to force sync from host
function forceSyncFromHost() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    showMessage("Not connected to a room");
    return;
  }
  
  socket.send(JSON.stringify({
    type: 'request_sync'
  }));
  
  showMessage("Requesting sync from host...");
}

// Capture a more complete game state
function captureFullGameState() {
  try {
    const gameState = {
      // Game configuration
      difficulty: difficulty,
      numberOfPlayers: numberOfPlayersGlobal,
      currentRound: currentRound,
      
      // Monster stats
      monsterHealth: monsterHealth,
      monsterInfect: monsterInfect,
      monsterHandSize: monsterHandSize,
      modifiedMonsterHandSize: modifiedMonsterHandSize,
      monsterStartingHandSize: monsterStartingHandSize,
      monsterLandCount: currentMonsterLands,
      cardsInMonsterDeck: cardsInMonsterDeck,
      cardsInMonsterGraveyard: cardsInMonsterGraveyard,
      
      // Monster appearance
      monsterColor: scryfallMonsterColors,
      bossMonsterImageUrl: bossMonsterImageUrl,
      
      // Game state
      graveyard: graveyard || {},
      milledCardImages: milledCardImages || [],
      
      // Player data
      playerHealth: [],
      playerPoison: [],
      
      // Minions
      minions: [],
      
      // Log entries
      logEntries: []
    };
    
    // Get monster Scryfall link if available
    const monsterImageAnchor = document.querySelector("#monsterImageContainer a");
    if (monsterImageAnchor) {
      gameState.monsterScryfallLink = monsterImageAnchor.href;
    }
    
    // Capture player health values
    for (let i = 1; i <= numberOfPlayersGlobal; i++) {
      const healthElement = document.getElementById(`player${i}Health`);
      if (healthElement) {
        gameState.playerHealth.push(parseInt(healthElement.textContent || "20"));
      } else {
        gameState.playerHealth.push(20); // Default health
      }
      
      const poisonElement = document.getElementById(`player${i}Poison`);
      if (poisonElement) {
        gameState.playerPoison.push(parseInt(poisonElement.textContent || "0"));
      } else {
        gameState.playerPoison.push(0); // Default poison
      }
    }
    
    // Get minion data
    const minionContainers = document.querySelectorAll('#imageContainer .image-container');
    minionContainers.forEach(container => {
      const img = container.querySelector('img');
      const healthText = container.querySelector('.image-text');
      
      if (img && healthText) {
        const imgSrc = img.src;
        const minionNumber = imgSrc.split('/').pop().split('.')[0];
        
        gameState.minions.push({
          number: minionNumber,
          health: healthText.textContent
        });
      }
    });
    
    // Capture all log entries
    const logEntries = document.querySelectorAll('#logContainer .log-entry');
    Array.from(logEntries).forEach(entry => {
      gameState.logEntries.push({
        text: entry.textContent,
        imageUrl: entry.dataset.imageUrl
      });
    });
    
    return gameState;
  } catch (error) {
    console.error('Error capturing full game state:', error);
    return {};
  }
}

// Export functions
window.createMultiplayerRoom = createRoom;
window.joinMultiplayerRoom = joinRoom;
window.disconnectMultiplayer = disconnectMultiplayer;
window.syncGameState = syncGameState;
window.forceSyncFromHost = forceSyncFromHost;










