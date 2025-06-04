// SyncIntegration.js - Integrates sync functionality with game actions

// Store original functions
const originalFunctions = {};

// Flag to prevent recursive sync calls
let isCurrentlySyncing = false;

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
        // Skip sync if we're already in a sync operation
        const shouldSync = !isCurrentlySyncing;
        
        // Call original function
        const result = originalFunctions[funcName].apply(this, args);
        
        // Only sync if we're not already in a sync operation
        if (shouldSync && window.syncGameState) {
          let actionDescription = `${funcName}`;
          
          // Add more context for specific functions
          if (funcName === 'updateMonsterLandCountByAmount' && args.length > 0) {
            actionDescription = `Land count changed by ${args[0]}`;
          } else if (funcName === 'increaseMonsterHealth' || funcName === 'decreaseMonsterHealth') {
            actionDescription = `Monster health ${funcName.includes('increase') ? 'increased' : 'decreased'} by ${args[0]}`;
          } else if (args.length > 0) {
            actionDescription += `(${args.join(', ')})`;
          }
          
          // Use setTimeout to break the potential call stack
          setTimeout(() => {
            // Set syncing flag before calling syncGameState
            isCurrentlySyncing = true;
            try {
              window.syncGameState(actionDescription);
            } finally {
              // Reset syncing flag after sync is complete
              isCurrentlySyncing = false;
            }
          }, 0);
        }
        
        return result;
      };
      console.log(`Wrapped function: ${funcName} with sync`);
    } else {
      console.warn(`Function ${funcName} not found for sync wrapping`);
    }
  });
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






