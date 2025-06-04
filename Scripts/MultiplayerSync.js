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
function applyGameState(state) {
  // Update monster stats
  window.monsterHealth = state.monsterHealth;
  window.monsterInfect = state.monsterInfect;
  window.cardsInMonsterDeck = state.cardsInMonsterDeck;
  window.cardsInMonsterGraveyard = state.cardsInMonsterGraveyard;
  window.monsterHandSize = state.monsterHandSize;
  window.monsterLandCount = state.monsterLandCount;
  window.graveyard = state.graveyard;
  window.currentRound = state.currentRound;
  window.numberOfPlayersGlobal = state.numberOfPlayersGlobal;
  window.difficultyLevel = state.difficultyLevel;
  window.scryfallMonsterColors = state.scryfallMonsterColors;
  
  // Update UI
  window.updateMonsterHealth();
  window.updateMonsterInfect();
  window.updateMonsterHandSize();
  window.updateMonsterLandCountByAmount(0);
  window.updateGraveyardTable();
  
  // Update player health boxes
  if (state.playerHealths) {
    state.playerHealths.forEach(player => {
      const box = document.getElementById(player.id);
      if (box) {
        box.querySelector('.health-value').textContent = player.health;
        box.querySelector('.poison-value').textContent = player.poison;
      }
    });
  }
  
  // Update log (only if there are new entries)
  if (state.logEntries && state.logEntries.length > 0) {
    const logContainer = document.getElementById('logContainer');
    const currentEntries = logContainer.querySelectorAll('.log-entry').length;
    
    // Only update if there are more entries in the received state
    if (state.logEntries.length > currentEntries) {
      // Add only new entries
      for (let i = currentEntries; i < state.logEntries.length; i++) {
        const entry = state.logEntries[i];
        addLogWithoutSync(entry.text, entry.imageUrl);
      }
    }
  }
  
  // Store as last synced state
  lastSyncedState = state;
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

// Display room code in UI
function displayRoomCode(code) {
  // Create or update room code display
  let roomCodeDisplay = document.getElementById('roomCodeDisplay');
  
  if (!roomCodeDisplay) {
    roomCodeDisplay = document.createElement('div');
    roomCodeDisplay.id = 'roomCodeDisplay';
    roomCodeDisplay.className = 'room-code-display';
    roomCodeDisplay.style.position = 'fixed';
    roomCodeDisplay.style.top = '10px';
    roomCodeDisplay.style.right = '10px';
    roomCodeDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    roomCodeDisplay.style.color = 'white';
    roomCodeDisplay.style.padding = '10px';
    roomCodeDisplay.style.borderRadius = '5px';
    roomCodeDisplay.style.zIndex = '1000';
    document.body.appendChild(roomCodeDisplay);
  }
  
  roomCodeDisplay.innerHTML = `
    <div class="room-code-content">
      <h3 style="margin: 0 0 5px 0; font-size: 14px;">Room Code</h3>
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">${code}</div>
      <button id="copyRoomCode" style="padding: 5px; cursor: pointer;">Copy</button>
    </div>
  `;
  
  // Add copy button functionality
  document.getElementById('copyRoomCode').addEventListener('click', () => {
    navigator.clipboard.writeText(code)
      .then(() => showMessage('Room code copied to clipboard'))
      .catch(err => console.error('Failed to copy room code:', err));
  });
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

// Export functions
window.createMultiplayerRoom = createRoom;
window.joinMultiplayerRoom = joinRoom;
window.disconnectMultiplayer = disconnectMultiplayer;
window.syncGameState = syncGameState;


