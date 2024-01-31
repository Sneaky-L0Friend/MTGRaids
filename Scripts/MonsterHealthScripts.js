let monsterHealth = 0;
let totalRoundLifeChange = 0;

function updateMonsterHealth() {
    const monsterHealthElement = document.getElementById("number");
    monsterHealthElement.innerText = `Monster Health: ${monsterHealth}`;
    if (window.startedGame) {
        addLog(`TOTAL MONSTER HP CHANGED THIS ROUND: ${totalRoundLifeChange > 0 ? '+' : ''}${totalRoundLifeChange} TO ${monsterHealth}`);
    }
}

function increaseNumber(numberToIncreaseBy) {
    monsterHealth = monsterHealth + numberToIncreaseBy;
    totalRoundLifeChange = totalRoundLifeChange + numberToIncreaseBy;
    updateMonsterHealth();
}

function decreaseNumber(numberToDecreaseBy) {
    monsterHealth = Math.max(0, monsterHealth - numberToDecreaseBy);
    totalRoundLifeChange = totalRoundLifeChange - numberToDecreaseBy;
    updateMonsterHealth();
}