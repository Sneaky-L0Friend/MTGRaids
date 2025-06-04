// SyncIntegration.js - Integrates sync functionality with game actions

// Store original functions
const originalFunctions = {};

// List of functions to wrap with sync
const functionsToSync = [
  'updateMonsterHealth',
  'updateMonsterInfect',
  'updateMonsterHandSize',
  'updateMonsterLandCountByAmount',
  'millMonster',
  'drawMonster',
  'nextRound',
  'decreasePlayerHealth',
  'increasePlayerHealth',
  'decreasePlayerPoison',
  'increasePlayerPoison'
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
  }
}

// Initialize sync integration when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure all game functions are loaded
  setTimeout(wrapWithSync, 1000);
});