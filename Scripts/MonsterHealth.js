let monsterHealth = 0;
let monsterInfect = 0;
let totalRoundLifeChange = 0;
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
      `TOTAL MONSTER HP CHANGED THIS ROUND: ${totalRoundLifeChange > 0 ? "+" : ""}${totalRoundLifeChange} TO ${monsterHealth}`,
    );
  } else if (window.startedGame) {
    console.log(`TOTAL MONSTER HP CHANGED THIS ROUND: ${totalRoundLifeChange > 0 ? "+" : ""}${totalRoundLifeChange} TO ${monsterHealth}`);
  }
}

function increaseMonsterHealth(numberToIncreaseBy) {
  monsterHealth = monsterHealth + numberToIncreaseBy;
  totalRoundLifeChange = totalRoundLifeChange + numberToIncreaseBy;
  updateMonsterHealth();
}

function decreaseMonsterHealth(numberToDecreaseBy) {
  monsterHealth = Math.max(0, monsterHealth - numberToDecreaseBy);
  totalRoundLifeChange = totalRoundLifeChange - numberToDecreaseBy;
  updateMonsterHealth();
}

function updateMonsterInfect() {
  const monsterHealthElement = document.getElementById("numberInfect");
  if (!monsterHealthElement) {
    console.error("Monster infect element not found!");
    return;
  }
  
  monsterHealthElement.innerText = `Infect: ${monsterInfect}`;
  
  // Check if addLog is defined before calling it
  if (window.startedGame && typeof window.addLog === 'function') {
    window.addLog(
      `TOTAL MONSTER INFECT CHANGED THIS ROUND: ${totalRoundInfectChange > 0 ? "+" : ""}${totalRoundInfectChange} TO ${monsterInfect}`,
    );
  } else if (window.startedGame) {
    console.log(`TOTAL MONSTER INFECT CHANGED THIS ROUND: ${totalRoundInfectChange > 0 ? "+" : ""}${totalRoundInfectChange} TO ${monsterInfect}`);
  }
}

function changeMonsterInfect(numberToChangeBy) {
  monsterInfect = monsterInfect + numberToChangeBy;
  totalRoundInfectChange = totalRoundInfectChange + numberToChangeBy; // Fixed: was using totalRoundLifeChange
  updateMonsterInfect();
}




