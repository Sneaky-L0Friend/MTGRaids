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
  'resetGame',
  
  // Additional functions to ensure complete sync
  'updateMonsterLandCountByAmount',
  'changeMonsterInfect',
  'increaseMonsterHealth',
  'decreaseMonsterHealth'
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
        
        // Sync game state with descriptive action
        if (window.syncGameState) {
          let actionDescription = `${funcName}`;
          
          // Add more context for specific functions
          if (funcName === 'updateMonsterLandCountByAmount' && args.length > 0) {
            actionDescription = `Land count changed by ${args[0]}`;
          } else if (funcName === 'increaseMonsterHealth' || funcName === 'decreaseMonsterHealth') {
            actionDescription = `Monster health ${funcName.includes('increase') ? 'increased' : 'decreased'} by ${args[0]}`;
          } else if (args.length > 0) {
            actionDescription += `(${args.join(', ')})`;
          }
          
          window.syncGameState(actionDescription);
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

