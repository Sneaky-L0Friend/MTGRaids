let currentRound = 1;
let totalDiceRolls = 0;
let numberOfDiceRolled = 0;
let lifeMultiplier;
let gameCanStart = false;
let log = [];
let bossMonsterImageUrl = "";
let monsterHandSize = 8;
let modifiedMonsterHandSize = 0;
let monsterStartingHandSize = 8;
let modifiersToUse;
let listRolledFrom;
let playerNumberSpecific = false;
let numberOfPlayersGlobal;
let currentMonsterLands = 1;

function takeMonsterAction() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  if (currentRound == 1) {
    showErrorMessage("Monster cannot take actions on Round 1");
    return;
  }
  const drValue = Math.floor(currentRound / 2); // Calculate DR value
  if (numberOfDiceRolled == drValue) {
    showErrorMessage("Monster cannot take further actions, increase round");
    return;
  }
  const randomValue = Math.random(); // Random value between 0 and 1
  let baseProbability;
  let additionalProbability;
  let easyProbability;
  if (modifiersToUse == EASY_MODE_MODIFIERS) {
    console.log("easy mode selected");
    baseProbability =
      1 / (1 + Math.exp(-modifiersToUse.modifier1 / (currentRound * 1.5)));
    additionalProbability =
      1 *
      (1 / (1 + Math.exp(-modifiersToUse.modifier2))) *
      modifiersToUse.modifier3;
    easyProbability = baseProbability;
  } else {
    baseProbability =
      1 / (1 + Math.exp(-modifiersToUse.modifier1 / (currentRound * 1.5)));
    additionalProbability =
      (1 - baseProbability) *
      (1 / (1 + Math.exp(-modifiersToUse.modifier2))) *
      modifiersToUse.modifier3;
    easyProbability = additionalProbability;
  }

  // Randomly selects the Easy, Medium or Hard Action list based on previous formulas and modifiers
  let randomlyRolledList;
  if (randomValue < easyProbability) {
    randomlyRolledList = easyActionsJson;
    listRolledFrom = "E";
  } else if (randomValue < baseProbability + additionalProbability) {
    randomlyRolledList = mediumActionsJson;
    listRolledFrom = "M";
  } else {
    randomlyRolledList = hardActionsJson;
    listRolledFrom = "H";
  }
  const actionElement = document.getElementById("action");
  if(listRolledFrom == "H" && currentRound <= 5 && (modifiersToUse != HARD_MODE_MODIFIERS)) {
    actionElement.innerText = "ROLLED HARD BEFORE ROUND 5, REROLLING.";
    addLog(
      `${totalDiceRolls}. Action result: [${listRolledFrom}] ${actionElement.innerText}`,
    );
    takeMonsterAction();
    return;
  }
  const result = Math.floor(Math.random() * randomlyRolledList.Actions.length); // Generate a random number on the rolled List

  // console.log(randomValue);
  // console.log(modifiersToUse);
  // console.log("baseProbability: " + baseProbability);
  // console.log("additionalProbability: " + additionalProbability);
  // console.log('easyProbability: ' + easyProbability);

  ++totalDiceRolls;
  ++numberOfDiceRolled;
  const diceRolledThisRound = Math.floor(currentRound / 2); // Calculate Dice rolled this round value;
  playerNumberSpecific = false;
  if (randomlyRolledList.Actions[result].includes("${numberOfPlayers}")) {
    playerNumberSpecific = true;
  }

  actionElement.innerText = randomlyRolledList.Actions[result]
  .replaceAll("${diceRolledThisRound}", diceRolledThisRound)
  .replaceAll("${currentRound}", currentRound)
  .replaceAll("${diceRolledThisRound+1}", diceRolledThisRound + 1)
  .replaceAll("${diceRolledThisRound+2}", diceRolledThisRound + 2)
  .replaceAll("${currentRound+1}", currentRound + 1)
  .replaceAll("${numberOfPlayers}", numberOfPlayersGlobal);
  
  addLog(
    `${totalDiceRolls}. Action result: [${listRolledFrom}] ${actionElement.innerText}`,
    );
    checkForMinions(randomlyRolledList.Actions[result]);
    checkIfHealthNeedsModification(randomlyRolledList.Actions[result]);

  if (randomlyRolledList.Actions[result].includes("one more action")) {
    numberOfDiceRolled--;
    return;
  }
  updateRound();
}

function updateRound() {
  const roundElement = document.getElementById("round");
  const round2Element = document.getElementById("rounds");
  roundElement.innerText = `Round: ${currentRound}`;
  const drValue = Math.floor(currentRound / 2); // Calculate DR value
  round2Element.innerText = `Rolls this turn:  ${numberOfDiceRolled} / ${drValue}`;
  totalRoundLifeChange = 0;
}

function increaseRound() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  currentRound++;
  numberOfDiceRolled = 0;
  // Create a new log entry
  addLog(`ROUND ${currentRound}`);
  updateRound();
  updateMonsterHandSize();
  updateMonsterLandCountByAmount(1);
}

function decreaseRound() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  currentRound = Math.max(1, currentRound - 1);
  addLog(`ROUND ${currentRound}`);
  updateRound();
  updateMonsterHandSize();
  updateMonsterLandCountByAmount(-1);
}

function checkInput() {
  var numberInput = document.getElementById("myTextbox").value;

  // Check if the input is a number
  if (!isNaN(numberInput) && numberInput !== "") {
    gameCanStart = true;
  } else {
    gameCanStart = false;
  }
}

function pickMonster() {
  // Generate a random number between 1 and 100 (inclusive)
  const randomNumber = Math.floor(Math.random() * 100) + 1;

  // Calculate the selected range based on probabilities
  let selectedRange;
  let cumulativeProbability = 0;

  for (const { range, probability } of colorRange) {
    cumulativeProbability += probability;
    if (randomNumber <= cumulativeProbability) {
      selectedRange = range;
      break;
    }
  }

  // Pick a random number within the selected range
  const pickedNumber =
    Math.floor(Math.random() * (selectedRange[1] - selectedRange[0] + 1)) +
    selectedRange[0];

  const startElement = document.getElementById("startEasy");
  var imgElement = document.createElement("img");

  // Set the image source
  imgElement.src = `BossMonsters/${pickedNumber}.jpeg`;
  bossMonsterImageUrl = imgElement.src;
  // Set styling for the image
  imgElement.style.width = "1100px";
  imgElement.style.height = "550px";
  imgElement.style.margin = "20px";

  // Replace the div with the image
  startElement.replaceWith(imgElement);
  return pickedNumber;
}

function addMinions(numberOfImages, imageNumber) {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  const container = document.getElementById("imageContainer");
  console.log("Add " + numberOfImages + ", Image number " + imageNumber);
  for (let i = 0; i < numberOfImages; i++) {
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";

    const img = document.createElement("img");
    img.src = `Minions/${imageNumber}.jpeg`;
    img.alt = "Image " + (i + 1); // Alt text for accessibility

    img.style.width = "290px";
    img.style.height = "160px";

    const imageText = document.createElement("div");
    imageText.className = "image-text";
    if (playerNumberSpecific) {
      console.log("player number specific add minion");
      imageText.textContent =
        listRolledFrom == "M"
          ? `${currentRound + 1}/${currentRound + 1}`
          : "2/2";
      imageText.textContent = imageNumber == 4 ? `5/1` : imageText.textContent;
    } else {
      if (listRolledFrom == "E") {
        switch (numberOfImages) {
          case 1:
            imageText.textContent = `${currentRound + 1}/${currentRound + 1}`;
            break;
          case 2:
            imageText.textContent = `${Math.floor(
              currentRound / 2,
            )}/${Math.floor(currentRound / 2)}`;
            break;
          case 3:
            imageText.textContent = "1/1";
            break;
          default:
            imageText.textContent = "1/1";
            break;
        }
      } else if (listRolledFrom == "M") {
        switch (numberOfImages) {
          case 1:
            imageText.textContent = `${currentRound + 1}/${currentRound + 1}`;
            break;
          case 4:
            imageText.textContent = `${Math.floor(
              currentRound / 2,
            )}/${Math.floor(currentRound / 2)}`;
            break;
          default:
            imageText.textContent = "1/1";
            break;
        }
      } else if (listRolledFrom == "H") {
        switch (numberOfImages) {
          case 2:
            imageText.textContent = `${currentRound + 1}/${currentRound + 1}`;
            break;
          case 4:
            imageText.textContent = `${Math.floor(
              currentRound / 2,
            )}/${Math.floor(currentRound / 2)}`;
            break;
          default:
            imageText.textContent = "1/1";
            break;
        }
      } else {
        imageText.textContent = "1/1";
      }
    }
    imageText.contentEditable = true;

    img.addEventListener("click", function () {
      removeImage(imageContainer);
    });

    imageContainer.appendChild(img);
    imageContainer.appendChild(imageText);
    container.appendChild(imageContainer);
  }
}

function setDifficultyAtStart(difficulty) {
  switch (difficulty) {
    case "easy":
      modifiersToUse = EASY_MODE_MODIFIERS;
      lifeMultiplier = 20;
      break;
    case "medium":
      modifiersToUse = MEDIUM_MODE_MODIFIERS;
      lifeMultiplier = 25;
      break;
    case "hard":
      modifiersToUse = HARD_MODE_MODIFIERS;
      lifeMultiplier = 30;
      break;
  }
}

function displayColorRectangle() {
  const colorRectangle = document.getElementById("colorRectangle");
  const pickedNumber = pickMonster();

  // Set the background color of the rectangle based on the chosen number
  const colorName = colorMap[pickedNumber];

  if (colorName.includes("-")) {
    const colors = colorName.split("-");
    const widthPercentage = 100 / colors.length;
    const gradientColors = colors.map(
      (color, index) =>
        `${color.toLowerCase()} ${widthPercentage * index}% ${
          widthPercentage * (index + 1)
        }%`,
    );
    colorRectangle.style.background = `linear-gradient(to right, ${gradientColors.join(
      ", ",
    )})`;
  } else {
    // Handle single-color scenarios
    colorRectangle.style.background = colorName.toLowerCase();
  }
  colorRectangle.style.display = "block";
}

function updateMonsterHandSize() {
  const monsterHandDiv = document.getElementById("monsterHand");
  monsterHandSize =
    monsterStartingHandSize -
    Math.floor(currentRound / 2) +
    modifiedMonsterHandSize;
  monsterHandDiv.innerText = `Monster Hand Size: ${monsterHandSize}`;

  monsterHandDiv.style.display = "flex";
}

function updateMonsterHandSizeByAmount(amount) {
  const monsterHandDiv = document.getElementById("monsterHand");
  modifiedMonsterHandSize = modifiedMonsterHandSize + amount;
  monsterHandSize =
    monsterStartingHandSize -
    Math.floor(currentRound / 2) +
    modifiedMonsterHandSize;
  monsterHandDiv.innerText = `Monster Hand Size: ${monsterHandSize}`;

  monsterHandDiv.style.display = "flex";
}

function updateMonsterLandCountByAmount(amount) {
  const monsterLandDiv = document.getElementById("monsterLand");
  currentMonsterLands = currentMonsterLands + amount;
  monsterLandDiv.innerText = `Monster Land Count: ${currentMonsterLands}`;

  monsterLandDiv.style.display = "flex";
}

function startGame(difficulty) {
  if (!gameCanStart) {
    showErrorMessage("Enter Number of Players to Start ");
    return;
  }

  setDifficultyAtStart(difficulty);

  window.startedGame = true;
  var startEasy = document.getElementById("startEasy");
  var startMedium = document.getElementById("startMedium");
  var startHard = document.getElementById("startHard");
  var textBox = document.getElementById("myTextbox");
  var monsterHandButton = document.getElementById("monsterHandButtons");
  var monsterLandButton = document.getElementById("monsterLandButtons");
  textBox.style.display = "none";
  playerLabel.style.display = "none";
  startEasy.style.display = "none";
  startMedium.style.display = "none";
  startHard.style.display = "none";
  monsterLandButton.style.display = "grid";
  monsterHandButton.style.display = "grid";

  // Get the number of players
  var value = textBox.value;
  numberOfPlayersGlobal = value;
  monsterHealth = value * lifeMultiplier;
  monsterInfect = value * 7;
  updateMonsterHealth();
  updateMonsterInfect();
  createPlayerHealthBoxes(value);

  displayColorRectangle();
  updateMonsterHandSize();
  updateMonsterLandCountByAmount(0);
  readActionJsonFiles();
  addLog(`ROUND ${currentRound}`);
}

function checkForMinions(action) {
  //TODO: SMH Just do it based on the index used...no need to string compare
  if (action.includes("Monster creates")) {
    //make minions
    //TODO: SMH Just do it based on the index used...no need to string compare
    let howManyToMake = action.includes(
      "Monster creates 1",
    )
      ? 1
      : action.includes("Monster creates 2")
        ? 2
        : action.includes("Monster creates 3")
          ? 3
          : 4;
    howManyToMake = playerNumberSpecific
      ? numberOfPlayersGlobal
      : howManyToMake;
    // Set the image source
    if (playerNumberSpecific) {
      if (action.includes("5/1")) {
        addMinions(howManyToMake, 4);
      } else {
        addMinions(howManyToMake, 1);
      }
    } else {
      if (
        howManyToMake == 1 &&
        (listRolledFrom == "E" || listRolledFrom == "M")
      ) {
        addMinions(howManyToMake, 1);
      }
      if (howManyToMake == 3 && listRolledFrom == "E") {
        addMinions(howManyToMake, 2);
      } else if (howManyToMake == 2 && listRolledFrom == "H") {
        addMinions(howManyToMake, 1);
      } else if (
        (howManyToMake == 2 && listRolledFrom == "E") ||
        (howManyToMake == 3 && listRolledFrom == "M") ||
        (howManyToMake == 4 && listRolledFrom == "M") ||
        (howManyToMake == 4 && listRolledFrom == "H")
      ) {
        addMinions(howManyToMake, 2);
      }
    }
  }
}

function checkIfHealthNeedsModification(action) {
  var regex = /\d+/;
  var number = action.match(regex);
  // Converting the extracted number from string to integer
  var amountToChangeHealth = parseInt(number);
  if(action.includes("The Raid Monster deals")) {
    modifyPlayerHealthFromMonster(amountToChangeHealth);
  } else if(action.includes("drains")) {
    // Extracting the number from the string
    modifyPlayerHealthFromMonster(amountToChangeHealth);
    increaseMonsterHealth(amountToChangeHealth*numberOfPlayersGlobal);
  } else if(action.includes("gains")) {
    increaseMonsterHealth(amountToChangeHealth);
  }
}
