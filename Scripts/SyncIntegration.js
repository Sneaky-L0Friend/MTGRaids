// SyncIntegration.js - Integrates sync functionality with game actions

// Store original functions
const originalFunctions = {};

// List of functions to wrap with sync
const functionsToSync = [
  // Monster state functions
  'updateMonsterHealth',
  'updateMonsterInfect',
  'updateMonsterHandSize',
  'updateMonsterLandCountByAmount',
  'millMonster',
  'drawMonster',
  'nextRound',
  
  // Player state functions
  'decreasePlayerHealth',
  'increasePlayerHealth',
  'decreasePlayerPoison',
  'increasePlayerPoison',
  
  // Game state functions
  'updateRound',
  'increaseRound',
  'decreaseRound',
  'takeMonsterAction',
  'revealTopCard',
  
  // Card management functions
  'addCardToGraveyard',
  'updateGraveyardTable',
  
  // UI update functions
  'createPlayerHealthBoxes',
  'modifyPlayerHealthFromMonster',
  
  // Game flow functions
  'startGame',
  'endGame',
  'resetGame'
];

// Wrap each function to add sync after execution
function wrapWithSync() {
  functionsToSync.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      // Store original function
      originalFunctions[funcName] = window[funcName];
      
      // Replace with wrapped version
      window[funcName] = function(...args) {
        // Call original function
        const result = originalFunctions[funcName].apply(this, args);
        
        // Sync game state
        if (window.syncGameState) {
          window.syncGameState(`${funcName}(${args.join(', ')})`);
        }
        
        return result;
      };
      console.log(`Wrapped function: ${funcName} with sync`);
    } else {
      console.warn(`Function ${funcName} not found for sync wrapping`);
    }
  });
  
  // Special handling for addLog
  if (typeof window.addLog === 'function') {
    originalFunctions.addLog = window.addLog;
    
    window.addLog = function(text, imageUrl) {
      // Call original function
      const result = originalFunctions.addLog.call(this, text, imageUrl);
      
      // Sync game state
      if (window.syncGameState) {
        window.syncGameState(`Log: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`);
      }
      
      return result;
    };
    console.log("Wrapped addLog function with sync");
  }
  
  // Special handling for saveGameState
  if (typeof window.saveGameState === 'function') {
    originalFunctions.saveGameState = window.saveGameState;
    
    window.saveGameState = function() {
      // Call original function
      const result = originalFunctions.saveGameState.call(this);
      
      // Sync game state
      if (window.syncGameState) {
        window.syncGameState("Game state saved");
      }
      
      return result;
    };
    console.log("Wrapped saveGameState function with sync");
  }
  
  // Special handling for loadGameState
  if (typeof window.loadGameState === 'function') {
    originalFunctions.loadGameState = window.loadGameState;
    
    window.loadGameState = function() {
      // Call original function
      const result = originalFunctions.loadGameState.call(this);
      
      // Sync game state after a short delay to allow loading to complete
      if (window.syncGameState) {
        setTimeout(() => {
          window.syncGameState("Game state loaded");
        }, 500);
      }
      
      return result;
    };
    console.log("Wrapped loadGameState function with sync");
  }
}

// Initialize sync integration when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure all game functions are loaded
  setTimeout(wrapWithSync, 1000);
  console.log("SyncIntegration initialized");
});

// Add a function to manually wrap functions if they're loaded later
window.initializeSyncIntegration = function() {
  wrapWithSync();
  console.log("SyncIntegration manually initialized");
};
