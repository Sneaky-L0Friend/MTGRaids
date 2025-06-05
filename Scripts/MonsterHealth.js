let monsterHealth = 0;
let monsterInfect = 0;
let totalRoundHealthChange = 0;
let totalRoundInfectChange = 0;


function updateMonsterHealth() {
  const monsterHealthElement = document.getElementById("number");
  if (!monsterHealthElement) {
    console.error("Monster health element not found!");
    return;
  }

  monsterHealthElement.innerText = `Monster Health: ${monsterHealth}`;

  // Check if addLog is defined before calling it
  if (window.startedGame && typeof window.addLog === 'function') {
    window.addLog(
      `TOTAL MONSTER HEALTH CHANGED THIS TURN: ${totalRoundHealthChange > 0 ? "+" : ""}${totalRoundHealthChange} TO ${monsterHealth}`,
    );
  } else if (window.startedGame) {
    console.log(`TOTAL MONSTER HEALTH CHANGED THIS TURN: ${totalRoundHealthChange > 0 ? "+" : ""}${totalRoundHealthChange} TO ${monsterHealth}`);
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

  const monsterInfectElement = document.getElementById("numberInfect");
  if (!monsterInfectElement) {
    console.error("Monster infect element not found!");
    return;
  }

  monsterInfectElement.innerText = `Infect: ${monsterInfect}`;

  // Check if addLog is defined before calling it
  if (window.startedGame && typeof window.addLog === 'function') {
    window.addLog(
      `TOTAL MONSTER INFECT CHANGED THIS TURN: ${totalRoundInfectChange > 0 ? "+" : ""}${totalRoundInfectChange} TO ${monsterInfect}`,
    );
  } else if (window.startedGame) {
    console.log(`TOTAL MONSTER INFECT CHANGED THIS TURN: ${totalRoundInfectChange > 0 ? "+" : ""}${totalRoundInfectChange} TO ${monsterInfect}`);
  }
}

function changeMonsterInfect(numberToChangeBy) {
  monsterInfect = monsterInfect + numberToChangeBy;
  totalRoundInfectChange = totalRoundInfectChange + numberToChangeBy;
  updateMonsterInfect();
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
