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

// Start multiplayer game
function startMultiplayerGame(difficulty, playerCount) {
  // Close the dialog
  closeMultiplayerDialog();
  
  // Start the game first
  window.startGame(difficulty, playerCount);
  
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

// Make functions globally available
window.showCreateRoomDialog = showCreateRoomDialog;
window.closeCreateRoomDialog = closeCreateRoomDialog;
window.showJoinRoomDialog = showJoinRoomDialog;
window.closeJoinRoomDialog = closeJoinRoomDialog;
window.startMultiplayerGame = startMultiplayerGame;
window.startMultiplayerGameWithDifficulty = startMultiplayerGameWithDifficulty;
window.finalizeMultiplayerGameStart = finalizeMultiplayerGameStart;
window.joinExistingRoom = joinExistingRoom;
window.showMessage = showMessage;
window.closePlayerCountDialog = closePlayerCountDialog;





