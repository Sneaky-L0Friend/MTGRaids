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
function startMultiplayerGame() {
  closeCreateRoomDialog();
  
  // Create difficulty selection dialog
  const difficultyDialog = document.createElement('div');
  difficultyDialog.className = 'modal';
  difficultyDialog.style.display = 'block';
  
  difficultyDialog.innerHTML = `
    <div class="modal-content">
      <h3>Select Difficulty</h3>
      <div class="button-container" style="justify-content: space-around;">
        <button onclick="startMultiplayerGameWithDifficulty('easy')">Easy</button>
        <button onclick="startMultiplayerGameWithDifficulty('medium')">Medium</button>
        <button onclick="startMultiplayerGameWithDifficulty('hard')">Hard</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(difficultyDialog);
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

