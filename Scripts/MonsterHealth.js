let monsterHealth = 0;
let monsterInfect = 0;
let totalRoundLifeChange = 0;
let totalRoundInfectChange = 0;

function updateMonsterHealth() {
    const monsterHealthElement = document.getElementById("number");
    monsterHealthElement.innerText = `Monster Health: ${monsterHealth}`;
    if (window.startedGame) {
        addLog(`TOTAL MONSTER HP CHANGED THIS ROUND: ${totalRoundLifeChange > 0 ? '+' : ''}${totalRoundLifeChange} TO ${monsterHealth}`);
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
    monsterHealthElement.innerText = `Infect: ${monsterInfect}`;
    if (window.startedGame) {
        addLog(`TOTAL MONSTER INFECT CHANGED THIS ROUND: ${totalRoundInfectChange > 0 ? '+' : ''}${totalRoundInfectChange} TO ${monsterInfect}`);
    }
}

function changeMonsterInfect(numberToChangeBy) {
    monsterInfect = monsterInfect + numberToChangeBy;
    totalRoundInfectChange = totalRoundLifeChange + numberToChangeBy;
    updateMonsterInfect();
}