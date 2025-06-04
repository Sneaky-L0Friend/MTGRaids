let monsterHealth = 0;
let monsterInfect = 0;
let totalRoundHealthChange = 0;
let totalRoundInfectChange = 0;

// Flag to prevent recursive sync calls
let isUpdatingMonsterHealth = false;
let isUpdatingMonsterInfect = false;

function updateMonsterHealth() {
  // Prevent recursive calls
  if (isUpdatingMonsterHealth) return;
  
  try {
    isUpdatingMonsterHealth = true;
    
    const monsterHealthElement = document.getElementById("number");
    if (!monsterHealthElement) {
      console.error("Monster health element not found!");
      return;
    }
    
    monsterHealthElement.innerText = `Monster Health: ${monsterHealth}`;
    
    // Check if addLog is defined before calling it
    if (window.startedGame && typeof window.addLog === 'function') {
      window.addLog(
        `TOTAL MONSTER HEALTH CHANGED THIS ROUND: ${totalRoundHealthChange > 0 ? "+" : ""}${totalRoundHealthChange} TO ${monsterHealth}`,
      );
    } else if (window.startedGame) {
      console.log(`TOTAL MONSTER HEALTH CHANGED THIS ROUND: ${totalRoundHealthChange > 0 ? "+" : ""}${totalRoundHealthChange} TO ${monsterHealth}`);
    }
    
    // Sync game state if multiplayer is enabled
    if (typeof window.syncGameState === 'function') {
      // Use setTimeout to break potential call stack
      setTimeout(() => {
        window.syncGameState(`Monster health updated to ${monsterHealth}`);
      }, 0);
    }
  } finally {
    isUpdatingMonsterHealth = false;
  }
}

function increaseMonsterHealth(numberToIncreaseBy) {
  monsterHealth = monsterHealth + numberToIncreaseBy;
  totalRoundHealthChange = totalRoundHealthChange + numberToIncreaseBy;
  updateMonsterHealth();
}

function decreaseMonsterHealth(numberToDecreaseBy) {
  monsterHealth = Math.max(0, monsterHealth - numberToDecreaseBy);
  totalRoundHealthChange = totalRoundHealthChange - numberToDecreaseBy;
  updateMonsterHealth();
}

function updateMonsterInfect() {
  // Prevent recursive calls
  if (isUpdatingMonsterInfect) return;
  
  try {
    isUpdatingMonsterInfect = true;
    
    const monsterInfectElement = document.getElementById("numberInfect");
    if (!monsterInfectElement) {
      console.error("Monster infect element not found!");
      return;
    }
    
    monsterInfectElement.innerText = `Infect: ${monsterInfect}`;
    
    // Check if addLog is defined before calling it
    if (window.startedGame && typeof window.addLog === 'function') {
      window.addLog(
        `TOTAL MONSTER INFECT CHANGED THIS ROUND: ${totalRoundInfectChange > 0 ? "+" : ""}${totalRoundInfectChange} TO ${monsterInfect}`,
      );
    } else if (window.startedGame) {
      console.log(`TOTAL MONSTER INFECT CHANGED THIS ROUND: ${totalRoundInfectChange > 0 ? "+" : ""}${totalRoundInfectChange} TO ${monsterInfect}`);
    }
    
    // Sync game state if multiplayer is enabled
    if (typeof window.syncGameState === 'function') {
      // Use setTimeout to break potential call stack
      setTimeout(() => {
        window.syncGameState(`Monster infect updated to ${monsterInfect}`);
      }, 0);
    }
  } finally {
    isUpdatingMonsterInfect = false;
  }
}

function changeMonsterInfect(numberToChangeBy) {
  monsterInfect = monsterInfect + numberToChangeBy;
  totalRoundInfectChange = totalRoundInfectChange + numberToChangeBy;
  updateMonsterInfect();
  
  // Explicitly sync the infect count change
  if (typeof window.syncGameState === 'function') {
    window.syncGameState(`Monster infect updated to ${monsterInfect}`);
  }
}

function changeMonNsterInfect(numberToChangeBy) {
  monsterInfect = monsterInfect + numberToChangeBy;
  totalRoundInfectChange = totalRoundInfectChange + numberToChangeBy;
  updateMonsterInfect();
}

// Make sure these functions are available globally
window.updateMonsterHealth = updateMonsterHealth;
window.increaseMonsterHealth = increaseMonsterHealth;
window.decreaseMonsterHealth = decreaseMonsterHealth;
window.updateMonsterInfect = updateMonsterInfect;
window.changeMonsterInfect = changeMonsterInfect;
