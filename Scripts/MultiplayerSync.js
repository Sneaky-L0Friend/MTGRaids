// MultiplayerSync.js - Handles multiplayer synchronization

let socket = null;
let roomCode = null;
let isHost = false;
let lastSyncedState = null;
let syncEnabled = false;

// Set up periodic sync
let syncInterval = null;

function startPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Sync every 5 seconds
  syncInterval = setInterval(() => {
    if (syncEnabled && socket && socket.readyState === WebSocket.OPEN) {
      // Only sync if we're the host
      if (isHost) {
        forceFullSync();
      }
    } else {
      // Stop syncing if we're not connected
      stopPeriodicSync();
    }
  }, 5000);
  
  console.log("Started periodic sync");
}

function stopPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log("Stopped periodic sync");
  }
}

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
        createRoomWithGameState();
      }
    }, 100);
  } else {
    createRoomWithGameState();
  }
}

// Helper function to create room with game state
function createRoomWithGameState() {
  // Make sure the game is started
  if (!window.startedGame) {
    console.warn("Game not started, initializing with defaults");
    window.startedGame = true;
    window.monsterHealth = 100;
    window.numberOfPlayersGlobal = 4;
  }
  
  // Force initialize player health if needed
  if (!window.playerHealth) {
    console.warn("Player health not initialized, creating defaults");
    window.playerHealth = {};
    for (let i = 1; i <= (window.numberOfPlayersGlobal || 4); i++) {
      window.playerHealth[i] = 40;
    }
  }
  
  // Capture the current game state
  const initialState = captureGameState();
  
  // Add fallback values for critical fields
  if (!initialState.playerHealths || initialState.playerHealths.length === 0) {
    console.warn("No player health values found, adding defaults");
    initialState.playerHealths = [];
    for (let i = 0; i < (window.numberOfPlayersGlobal || 4); i++) {
      initialState.playerHealths.push(40);
    }
  }
  
  // Add a log entry if none exist
  if (!initialState.logEntries || initialState.logEntries.length === 0) {
    console.warn("No log entries found, adding default");
    initialState.logEntries = [{
      text: `Game started with ${window.numberOfPlayersGlobal || 4} players`,
      imageUrl: null
    }];
  }
  
  console.log("Sending game state to server:", initialState);
  
  // Send the game state to create a room
  socket.send(JSON.stringify({
    type: 'create_room',
    gameState: initialState
  }));
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
  
  // Force refresh the current state before capturing
  ensureGameInitialized();
  
  // Capture the current state with the latest values
  const currentState = captureGameState();
  
  // Log the current monster health for debugging
  console.log("Current monster health before sync:", window.monsterHealth);
  console.log("Monster health in state to sync:", currentState.monsterHealth);
  
  // Only send if state has changed
  if (JSON.stringify(currentState) !== JSON.stringify(lastSyncedState)) {
    socket.send(JSON.stringify({
      type: 'game_update',
      gameState: currentState,
      action: actionDescription
    }));
    
    lastSyncedState = JSON.parse(JSON.stringify(currentState)); // Deep copy
    console.log("Game state synced with action:", actionDescription);
  } else {
    console.log("No changes detected, skipping sync");
  }
}

// Capture current game state for initial room creation
function captureGameState() {
  try {
    // Get the latest values directly from the DOM where possible
    const monsterHealthElement = document.getElementById("number");
    const currentMonsterHealth = monsterHealthElement ? 
      parseInt(monsterHealthElement.innerText.replace("Monster Health: ", "")) : 
      window.monsterHealth || 100;
    
    const monsterInfectElement = document.getElementById("numberInfect");
    const currentMonsterInfect = monsterInfectElement ? 
      parseInt(monsterInfectElement.innerText.replace("Infect: ", "")) : 
      window.monsterInfect || 0;
    
    // Create a comprehensive game state object
    const gameState = {
      // Game configuration
      difficulty: window.difficulty || "medium",
      numberOfPlayers: window.numberOfPlayersGlobal || 4,
      currentRound: window.currentRound || 1,
      
      // Monster stats - use DOM values when possible
      monsterHealth: currentMonsterHealth,
      monsterInfect: currentMonsterInfect,
      monsterHandSize: window.monsterHandSize || 8,
      modifiedMonsterHandSize: window.modifiedMonsterHandSize || 8,
      monsterStartingHandSize: window.monsterStartingHandSize || 8,
      monsterLandCount: window.currentMonsterLands || 1,
      cardsInMonsterDeck: window.cardsInMonsterDeck || 99,
      cardsInMonsterGraveyard: window.cardsInMonsterGraveyard || 0,
      
      // Monster appearance
      monsterColor: window.scryfallMonsterColors || "wubrg",
      bossMonsterImageUrl: window.bossMonsterImageUrl || "",
      
      // Game state
      graveyard: window.graveyard || {},
      milledCardImages: window.milledCardImages || [],
      
      // Player data
      playerHealths: [],
      playerPoisons: [],
      
      // Flag to indicate this is a valid game state
      isValidGameState: true,
      
      // Timestamp for debugging
      timestamp: new Date().toISOString()
    };
    
    // Capture player health values from DOM when possible
    if (window.playerHealth) {
      for (let i = 1; i <= (window.numberOfPlayersGlobal || 4); i++) {
        const healthDisplay = document.getElementById(`player${i}HealthDisplay`);
        if (healthDisplay) {
          const healthText = healthDisplay.textContent;
          const healthValue = parseInt(healthText.replace("Health: ", ""));
          if (!isNaN(healthValue)) {
            gameState.playerHealths.push(healthValue);
          } else {
            gameState.playerHealths.push(window.playerHealth[i] || 40);
          }
        } else if (window.playerHealth[i] !== undefined) {
          gameState.playerHealths.push(window.playerHealth[i]);
        } else {
          gameState.playerHealths.push(40); // Default health
        }
      }
    } else {
      // If playerHealth is not defined, create default values
      for (let i = 0; i < (window.numberOfPlayersGlobal || 4); i++) {
        gameState.playerHealths.push(40); // Default health
      }
    }
    
    // Ensure we have player poison values
    if (!gameState.playerPoisons.length) {
      for (let i = 0; i < (window.numberOfPlayersGlobal || 4); i++) {
        gameState.playerPoisons.push(0); // Default poison
      }
    }
    
    // Capture log entries if available
    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
      const logEntries = logContainer.querySelectorAll('.log-entry');
      gameState.logEntries = Array.from(logEntries).map(entry => ({
        text: entry.textContent,
        imageUrl: entry.dataset.imageUrl
      })).slice(-20); // Only capture last 20 entries
    }
    
    // If no log entries were found, add a default one
    if (!gameState.logEntries || gameState.logEntries.length === 0) {
      gameState.logEntries = [{
        text: `Game started with ${gameState.numberOfPlayers} players`,
        imageUrl: null
      }];
    }
    
    console.log("Captured game state:", gameState);
    return gameState;
  } catch (error) {
    console.error("Error capturing game state:", error);
    // Return a minimal valid game state in case of error
    return { 
      isValidGameState: true,
      difficulty: "medium",
      numberOfPlayers: window.numberOfPlayersGlobal || 4,
      currentRound: 1,
      monsterHealth: window.monsterHealth || 100,
      monsterInfect: 0,
      playerHealths: Array(window.numberOfPlayersGlobal || 4).fill(40),
      playerPoisons: Array(window.numberOfPlayersGlobal || 4).fill(0),
      logEntries: [{
        text: "Game started",
        imageUrl: null
      }],
      timestamp: new Date().toISOString()
    };
  }
}

// Apply received game state
function applyGameState(gameState) {
  try {
    console.log("Applying game state:", gameState);
    
    // Check if we received a valid game state
    if (!gameState || !gameState.isValidGameState) {
      console.error("Invalid game state received:", gameState);
      showMessage("Error: Invalid game state received");
      return false;
    }
    
    // Set game as started
    window.startedGame = true;
    
    // Set difficulty if provided
    if (gameState.difficulty) {
      window.difficulty = gameState.difficulty;
      if (typeof window.setDifficultyAtStart === 'function') {
        window.setDifficultyAtStart(gameState.difficulty);
      }
    }
    
    // Set number of players
    if (gameState.numberOfPlayers) {
      window.numberOfPlayersGlobal = gameState.numberOfPlayers;
      if (typeof window.createPlayerHealthBoxes === 'function') {
        window.createPlayerHealthBoxes(gameState.numberOfPlayers);
      }
    }
    
    // Apply monster health
    if (gameState.monsterHealth !== undefined) {
      window.monsterHealth = gameState.monsterHealth;
      if (typeof window.updateMonsterHealth === 'function') {
        window.updateMonsterHealth();
      }
    }
    
    // Apply monster infect
    if (gameState.monsterInfect !== undefined) {
      window.monsterInfect = gameState.monsterInfect;
      if (typeof window.updateMonsterInfect === 'function') {
        window.updateMonsterInfect();
      }
    }
    
    // Apply monster hand size
    if (gameState.monsterHandSize !== undefined) {
      window.monsterHandSize = gameState.monsterHandSize;
      window.monsterStartingHandSize = gameState.monsterStartingHandSize || gameState.monsterHandSize;
      window.modifiedMonsterHandSize = gameState.modifiedMonsterHandSize || gameState.monsterHandSize;
      if (typeof window.updateMonsterHandSize === 'function') {
        window.updateMonsterHandSize();
      }
    }
    
    // Apply monster land count
    if (gameState.monsterLandCount !== undefined) {
      window.currentMonsterLands = gameState.monsterLandCount;
      if (typeof window.updateMonsterLandCountByAmount === 'function') {
        window.updateMonsterLandCountByAmount(0); // Just update display
      }
    }
    
    // Apply current round
    if (gameState.currentRound !== undefined) {
      window.currentRound = gameState.currentRound;
      if (typeof window.updateRound === 'function') {
        window.updateRound();
      }
    }
    
    // Apply cards in monster deck
    if (gameState.cardsInMonsterDeck !== undefined) {
      window.cardsInMonsterDeck = gameState.cardsInMonsterDeck;
      const deckSizeElement = document.getElementById('deckSize');
      if (deckSizeElement) {
        deckSizeElement.textContent = gameState.cardsInMonsterDeck;
      }
    }
    
    // Apply cards in monster graveyard
    if (gameState.cardsInMonsterGraveyard !== undefined) {
      window.cardsInMonsterGraveyard = gameState.cardsInMonsterGraveyard;
    }
    
    // Apply graveyard data
    if (gameState.graveyard) {
      window.graveyard = gameState.graveyard;
      if (typeof window.updateGraveyardTable === 'function') {
        window.updateGraveyardTable();
      }
    }
    
    // Apply player health values
    if (gameState.playerHealths && Array.isArray(gameState.playerHealths) && gameState.playerHealths.length > 0) {
      // Initialize playerHealth object if it doesn't exist
      if (!window.playerHealth) {
        window.playerHealth = {};
      }
      
      gameState.playerHealths.forEach((health, index) => {
        const playerNumber = index + 1;
        window.playerHealth[playerNumber] = health;
        
        const healthDisplay = document.getElementById(`player${playerNumber}HealthDisplay`);
        if (healthDisplay) {
          healthDisplay.textContent = `Health: ${health}`;
        }
      });
    } else {
      // Create default player health values if none provided
      window.playerHealth = {};
      for (let i = 1; i <= (gameState.numberOfPlayers || 4); i++) {
        window.playerHealth[i] = 40;
      }
    }
    
    // Apply monster color if provided
    if (gameState.monsterColor) {
      window.scryfallMonsterColors = gameState.monsterColor;
      if (typeof window.displayColorRectangle === 'function') {
        window.displayColorRectangle();
      }
    }
    
    // Apply boss monster image if provided
    if (gameState.bossMonsterImageUrl) {
      window.bossMonsterImageUrl = gameState.bossMonsterImageUrl;
      
      // Find the monster image container
      const monsterImageContainer = document.getElementById("monsterImageContainer");
      if (monsterImageContainer) {
        // Clear any existing content
        monsterImageContainer.innerHTML = "";
        
        // Create image element
        let imgElement = document.createElement("img");
        imgElement.src = gameState.bossMonsterImageUrl;
        imgElement.alt = "Boss Monster";
        imgElement.style.maxWidth = "100%";
        imgElement.style.maxHeight = "100%";
        
        monsterImageContainer.appendChild(imgElement);
      }
    }
    
    // Apply log entries if available
    if (gameState.logEntries && Array.isArray(gameState.logEntries) && gameState.logEntries.length > 0) {
      // Clear existing log
      const logContainer = document.getElementById('logContainer');
      if (logContainer) {
        logContainer.innerHTML = '';
        
        // Add each log entry
        gameState.logEntries.forEach(entry => {
          if (typeof window.addLog === 'function') {
            window.addLog(entry.text, entry.imageUrl);
          }
        });
      }
    }
    
    // Initialize other game elements
    if (typeof window.readActionJsonFiles === 'function') {
      window.readActionJsonFiles();
    }
    
    // Show player turn indicator
    if (typeof window.showPlayerTurnIndicator === 'function') {
      window.showPlayerTurnIndicator();
    }
    
    // Hide the starting screen
    const startingScreen = document.querySelector(".starting-screen");
    if (startingScreen) {
      startingScreen.style.display = "none";
    }
    
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
    
    console.log("Game state applied successfully");
    return true;
  } catch (error) {
    console.error('Error applying game state:', error);
    showMessage('Error applying game state: ' + error.message);
    return false;
  }
}

// Add a helper function to update player health without triggering sync
function updatePlayerHealth(playerNumber, healthValue) {
  try {
    const healthElement = document.getElementById(`player${playerNumber}Health`);
    if (healthElement) {
      healthElement.textContent = healthValue;
    }
  } catch (error) {
    console.error(`Error updating player ${playerNumber} health:`, error);
  }
}

// Add a helper function to update player poison without triggering sync
function updatePlayerPoison(playerNumber, poisonValue) {
  try {
    const poisonElement = document.getElementById(`player${playerNumber}Poison`);
    if (poisonElement) {
      poisonElement.textContent = poisonValue;
    }
  } catch (error) {
    console.error(`Error updating player ${playerNumber} poison:`, error);
  }
}

// Add a helper function to add log entries without triggering sync
function addLogWithoutSync(text, imageUrl) {
  try {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = text;
    
    if (imageUrl) {
      logEntry.dataset.imageUrl = imageUrl;
      logEntry.style.cursor = 'pointer';
      logEntry.addEventListener('click', function() {
        openPopup(imageUrl);
      });
    }
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  } catch (error) {
    console.error('Error adding log entry:', error);
  }
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
  
  // Stop periodic sync
  stopPeriodicSync();
  
  // Remove room code display
  const roomCodeDisplay = document.getElementById('roomCodeDisplay');
  if (roomCodeDisplay) {
    roomCodeDisplay.textContent = '';
  }
  
  // Hide multiplayer controls
  const multiplayerControls = document.getElementById('multiplayerControls');
  if (multiplayerControls) {
    multiplayerControls.style.display = 'none';
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

// Force a full sync of the game state
function forceFullSync() {
  if (!syncEnabled || !socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("Cannot force sync - not connected");
    return;
  }
  
  // Ensure game is initialized
  ensureGameInitialized();
  
  // Capture full game state
  const fullState = captureFullGameState();
  
  // Send full state to server
  socket.send(JSON.stringify({
    type: 'game_update',
    gameState: fullState,
    action: 'Force full sync'
  }));
  
  console.log("Forced full sync of game state");
}

// Capture a more comprehensive game state
function captureFullGameState() {
  // Start with the basic game state
  const gameState = captureGameState();
  
  // Add additional state information
  try {
    // Capture all DOM elements with IDs
    const allElements = document.querySelectorAll('[id]');
    const domState = {};
    
    allElements.forEach(el => {
      if (el.id && (el.tagName === 'DIV' || el.tagName === 'SPAN') && el.innerText) {
        domState[el.id] = el.innerText;
      }
    });
    
    gameState.domState = domState;
    
    // Capture all global variables that might be relevant
    const globalVars = {};
    const relevantVars = [
      'monsterHealth', 'monsterInfect', 'monsterHandSize', 'currentRound',
      'difficulty', 'numberOfPlayersGlobal', 'startedGame', 'playerHealth',
      'cardsInMonsterDeck', 'cardsInMonsterGraveyard', 'currentMonsterLands',
      'graveyard', 'milledCardImages'
    ];
    
    relevantVars.forEach(varName => {
      if (typeof window[varName] !== 'undefined') {
        if (typeof window[varName] === 'object') {
          globalVars[varName] = JSON.parse(JSON.stringify(window[varName]));
        } else {
          globalVars[varName] = window[varName];
        }
      }
    });
    
    gameState.globalVars = globalVars;
    
    // Add a timestamp
    gameState.fullSyncTimestamp = new Date().toISOString();
  } catch (error) {
    console.error("Error capturing full game state:", error);
  }
  
  return gameState;
}

// Initialize game state for multiplayer if not already initialized
function ensureGameInitialized() {
  if (!window.startedGame) {
    console.warn("Game not started, initializing with defaults for multiplayer");
    window.startedGame = true;
  }
  
  if (!window.monsterHealth) {
    console.warn("Monster health not initialized, setting default");
    window.monsterHealth = 100;
  }
  
  if (!window.numberOfPlayersGlobal) {
    console.warn("Number of players not initialized, setting default");
    window.numberOfPlayersGlobal = 4;
  }
  
  if (!window.playerHealth) {
    console.warn("Player health not initialized, creating defaults");
    window.playerHealth = {};
    for (let i = 1; i <= window.numberOfPlayersGlobal; i++) {
      window.playerHealth[i] = 40;
    }
  }
  
  if (!window.currentRound) {
    console.warn("Current round not initialized, setting default");
    window.currentRound = 1;
  }
  
  if (!window.difficulty) {
    console.warn("Difficulty not initialized, setting default");
    window.difficulty = "medium";
    if (typeof window.setDifficultyAtStart === 'function') {
      window.setDifficultyAtStart("medium");
    }
  }
  
  // Create player health boxes if they don't exist
  const playerHealthContainer = document.getElementById('playerHealthContainer');
  if (playerHealthContainer && playerHealthContainer.children.length === 0) {
    console.warn("Player health boxes not created, creating them");
    if (typeof window.createPlayerHealthBoxes === 'function') {
      window.createPlayerHealthBoxes(window.numberOfPlayersGlobal);
    }
  }
  
  console.log("Game initialization ensured for multiplayer");
}

// Update the createMultiplayerRoom function to ensure game is initialized
window.createMultiplayerRoom = function() {
  ensureGameInitialized();
  createRoom();
};

// Export functions
window.joinMultiplayerRoom = joinRoom;
window.disconnectMultiplayer = disconnectMultiplayer;
window.syncGameState = syncGameState;
window.forceSyncFromHost = forceSyncFromHost;
window.forceFullSync = forceFullSync;



























