// MultiplayerUI.js - Handles multiplayer UI interactions

// Show/hide dialog functions
function showCreateRoomDialog() {
  document.getElementById('createRoomDialog').style.display = 'block';
}

function closeCreateRoomDialog() {
  document.getElementById('createRoomDialog').style.display = 'none';
}

function showJoinRoomDialog() {
  document.getElementById('joinRoomDialog').style.display = 'block';
}

function closeJoinRoomDialog() {
  document.getElementById('joinRoomDialog').style.display = 'none';
}

// Add this function to close any multiplayer dialog
function closeMultiplayerDialog() {
  // Close create room dialog
  closeCreateRoomDialog();
  
  // Close join room dialog
  closeJoinRoomDialog();
  
  // Close any other modals that might be open
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
}

// Start multiplayer game
function startMultiplayerGame(difficulty, playerCount) {
  // Close the dialog
  closeMultiplayerDialog();
  
  // Start the game first
  window.startGame(difficulty || 'medium', playerCount || 4);
  
  // Wait a moment for game initialization to complete
  setTimeout(() => {
    // Create multiplayer room
    window.createMultiplayerRoom();
  }, 1000); // Wait 1 second for game to initialize
}

function startMultiplayerGameWithDifficulty(difficulty) {
  // Remove difficulty dialog - with null check
  const modalToRemove = document.querySelector('.modal:last-child');
  if (modalToRemove) {
    modalToRemove.remove();
  }
  
  // Create player count dialog
  const playerCountDialog = document.createElement('div');
  playerCountDialog.className = 'modal';
  playerCountDialog.style.display = 'block';
  
  playerCountDialog.innerHTML = `
    <div class="modal-content">
      <h3>Number of Players</h3>
      <input type="number" id="multiplayerPlayerCount" min="1" max="12" value="4">
      <div class="button-container">
        <button onclick="closePlayerCountDialog()">Cancel</button>
        <button onclick="finalizeMultiplayerGameStart('${difficulty}')">Start Game</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(playerCountDialog);
}

function finalizeMultiplayerGameStart(difficulty) {
  const playerCount = parseInt(document.getElementById('multiplayerPlayerCount').value);
  
  // Remove player count dialog - with null check
  const modalToRemove = document.querySelector('.modal:last-child');
  if (modalToRemove) {
    modalToRemove.remove();
  }
  
  // Also remove any other modals that might be open
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
  
  // Hide the multiplayer container
  const multiplayerContainers = document.querySelectorAll('.multiplayer-container');
  multiplayerContainers.forEach(container => {
    container.style.display = 'none';
  });
  
  // Start the game
  startGame(difficulty, playerCount);
  
  // Create multiplayer room
  window.createMultiplayerRoom();
}

// Join existing room
function joinExistingRoom() {
  const roomCode = document.getElementById('roomCodeInput').value.toUpperCase();
  
  if (!roomCode || roomCode.length !== 6) {
    showMessage('Please enter a valid 6-digit room code');
    return;
  }
  
  // Close the dialog
  closeJoinRoomDialog();
  
  // Join the room
  window.joinMultiplayerRoom(roomCode);
}

// Helper function to show temporary messages
function showMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'temp-message';
  messageElement.textContent = message;
  document.body.appendChild(messageElement);
  
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        document.body.removeChild(messageElement);
      }
    }, 500);
  }, 2000);
}

// Add a new function to close the player count dialog
function closePlayerCountDialog() {
  const modalToRemove = document.querySelector('.modal:last-child');
  if (modalToRemove) {
    modalToRemove.remove();
  }
}

// Add a function to create the multiplayer controls
function createMultiplayerControls(roomCode, isHost) {
  const multiplayerControls = document.getElementById('multiplayerControls');
  if (!multiplayerControls) return;
  
  // Clear existing controls
  multiplayerControls.innerHTML = '';
  
  // Create sync button
  const syncButton = document.createElement('button');
  syncButton.id = 'syncButton';
  syncButton.className = 'display-box';
  syncButton.style.backgroundColor = '#2a5d8a';
  syncButton.textContent = 'Sync from Host';
  syncButton.onclick = window.forceSyncFromHost;
  multiplayerControls.appendChild(syncButton);
  
  // Create force full sync button
  const fullSyncButton = document.createElement('button');
  fullSyncButton.id = 'fullSyncButton';
  fullSyncButton.className = 'display-box';
  fullSyncButton.style.backgroundColor = '#2a8a2a';
  fullSyncButton.style.marginTop = '5px';
  fullSyncButton.textContent = 'Force Full Sync';
  fullSyncButton.onclick = window.forceFullSync;
  multiplayerControls.appendChild(fullSyncButton);
  
  // Create room code display
  const roomCodeDisplay = document.createElement('div');
  roomCodeDisplay.id = 'roomCodeDisplay';
  roomCodeDisplay.style.marginTop = '5px';
  roomCodeDisplay.style.fontWeight = 'bold';
  roomCodeDisplay.textContent = `Room Code: ${roomCode}`;
  multiplayerControls.appendChild(roomCodeDisplay);
  
  // Show the controls
  multiplayerControls.style.display = 'block';
}

// Update the room joined function to use the new controls
function roomJoined(roomCode, isHost) {
  // Show success message
  showMessage(`Successfully ${isHost ? 'created' : 'joined'} room: ${roomCode}`);
  
  // Create multiplayer controls
  createMultiplayerControls(roomCode, isHost);
  
  // Close any open dialogs
  closeMultiplayerDialog();
}

// Make functions globally available
window.showCreateRoomDialog = showCreateRoomDialog;
window.closeCreateRoomDialog = closeCreateRoomDialog;
window.showJoinRoomDialog = showJoinRoomDialog;
window.closeJoinRoomDialog = closeJoinRoomDialog;
window.closeMultiplayerDialog = closeMultiplayerDialog;
window.startMultiplayerGame = startMultiplayerGame;
window.startMultiplayerGameWithDifficulty = startMultiplayerGameWithDifficulty;
window.finalizeMultiplayerGameStart = finalizeMultiplayerGameStart;
window.joinExistingRoom = joinExistingRoom;
window.showMessage = showMessage;
window.closePlayerCountDialog = closePlayerCountDialog;
window.createMultiplayerControls = createMultiplayerControls;
window.roomJoined = roomJoined;








