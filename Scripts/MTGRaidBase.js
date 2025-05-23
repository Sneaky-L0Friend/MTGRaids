// Remove this line since it's already declared in Logging.js
// let log = []; 

let currentRound = 1;
let totalDiceRolls = 0;
let numberOfDiceRolled = 0;
let lifeMultiplier;
let gameCanStart = false;
// log is now defined in Logging.js
let bossMonsterImageUrl = "";
let monsterHandSize = 8;
let modifiedMonsterHandSize = 0;
let monsterStartingHandSize = 8;
let modifiersToUse;
let listRolledFrom;
let playerNumberSpecific = false;
let numberOfPlayersGlobal;
let currentMonsterLands = 1;
let cardsInMonsterDeck = 99;
let cardsInMonsterGraveyard = -1;
let scryfallMonsterColors;
let currentRandomCardUrl;
let currentRandomCardName;
let hasCardBeenMilled = true;
let hasCardBeenDrawn = true;
let hasRevealedTopCard = false;
let cardTypeRevealed = "";
let difficulty = "medium"; // Default difficulty

// Add this array to store milled card images
let milledCardImages = [];

// Percentage for millings:
let creaturePercent = 30;
let instantPercent = 10;
let sorceryPercent = 7;
let enchantmentPercent = 5;
let landPercent = 37;
let artifactPercent = 9;
let planeswalkerPercent = 1;
let graveyard = {
  "Creature": 0,
  "Artifact": 0,
  "Enchantment": 0,
  "Instant": 0,
  "Sorcery": 0,
  "Planeswalker": 0,
  "Land": 0
};

function takeMonsterAction() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  
  // Reset any previous strike-through styling
  let actionElement = document.getElementById("action");
  if (actionElement) {
    actionElement.style.textDecoration = "none";
  }
  
  if (currentRound == 1) {
    showErrorMessage("Monster cannot take actions on Round 1");
    return;
  }
  
  if (cardsInMonsterDeck == 0) {
    addLog("YOU WON VIA MILLING! CONGRATS");
    monsterHealth = 0;
    updateMonsterHealth();
    openPopup("./FunStuff/yRMCDs.gif");
    disableAllButtonsExceptRestart();
    return;
  }

  const drValue = Math.floor(currentRound / 2); // Calculate DR value
  if (numberOfDiceRolled == drValue) {
    showErrorMessage("Monster cannot take further actions, increase round");
    return;
  }

  // Calculate probabilities based on modifiers
  const baseProbability = 0.5; // 50% chance for medium actions
  const additionalProbability = 0.3; // 30% chance for hard actions
  const easyProbability = 0.2; // 20% chance for easy actions

  // Determine which modifiers to use based on difficulty
  if (difficulty === "easy") {
    modifiersToUse = EASY_MODE_MODIFIERS;
  } else if (difficulty === "medium") {
    modifiersToUse = MEDIUM_MODE_MODIFIERS;
  } else {
    modifiersToUse = HARD_MODE_MODIFIERS;
  }

  // Apply modifiers to probabilities
  const randomValue = Math.random() * 100;

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
  
  if (listRolledFrom == "H" && currentRound <= 5 && (modifiersToUse != HARD_MODE_MODIFIERS)) {
    // Just reroll without logging the message
    takeMonsterAction();
    return;
  }
  
  // Make sure randomlyRolledList.Actions exists and has elements
  if (!randomlyRolledList || !randomlyRolledList.Actions || randomlyRolledList.Actions.length === 0) {
    console.error("Action list is empty or undefined:", randomlyRolledList);
    actionElement.innerText = "ERROR: Could not load actions. Please restart the game.";
    return;
  }
  
  const result = Math.floor(Math.random() * randomlyRolledList.Actions.length); // Generate a random number on the rolled List

  ++totalDiceRolls;
  ++numberOfDiceRolled;
  const diceRolledThisRound = Math.floor(currentRound / 2); // Calculate Dice rolled this round value;
  playerNumberSpecific = false;
  
  if (randomlyRolledList.Actions[result].includes("${numberOfPlayers}")) {
    playerNumberSpecific = true;
  }

  // Debug logging
  console.log("Action selected:", randomlyRolledList.Actions[result]);
  console.log("Current round:", currentRound);
  console.log("Dice rolled this round:", diceRolledThisRound);
  console.log("Number of players:", numberOfPlayersGlobal);

  actionElement.innerText = randomlyRolledList.Actions[result]
    .replaceAll("${diceRolledThisRound}", diceRolledThisRound)
    .replaceAll("${currentRound}", currentRound)
    .replaceAll("${diceRolledThisRound+1}", diceRolledThisRound + 1)
    .replaceAll("${diceRolledThisRound+2}", diceRolledThisRound + 2)
    .replaceAll("${currentRound+1}", currentRound + 1)
    .replaceAll("${numberOfPlayers}", numberOfPlayersGlobal);

  // Highlight the action to make it more visible
  actionElement.style.backgroundColor = "#ff9800";
  setTimeout(() => {
    actionElement.style.backgroundColor = "#333";
  }, 1000);

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
  roundElement.innerText = `Turn: ${currentRound}`;
  const drValue = Math.floor(currentRound / 2); // Calculate DR value
  round2Element.innerText = `Actions this turn:  ${numberOfDiceRolled} / ${drValue}`;
  
  // Add player turn indicator
  if (numberOfDiceRolled >= drValue && currentRound > 1) {
    showPlayerTurnIndicator();
  } else {
    hidePlayerTurnIndicator();
  }
  
  totalRoundLifeChange = 0;
  hasCardBeenDrawn = true;
}

function showPlayerTurnIndicator() {
  let indicator = document.getElementById("playerTurnIndicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "playerTurnIndicator";
    indicator.className = "player-turn-indicator";
    indicator.innerHTML = "PLAYERS' TURN";
    document.body.appendChild(indicator);
  }
  indicator.style.display = "block";
}

function hidePlayerTurnIndicator() {
  const indicator = document.getElementById("playerTurnIndicator");
  if (indicator) {
    indicator.style.display = "none";
  }
}

// Make these functions globally available
window.showPlayerTurnIndicator = showPlayerTurnIndicator;
window.hidePlayerTurnIndicator = hidePlayerTurnIndicator;

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
  hidePlayerTurnIndicator();
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
  let numberInput = document.getElementById("myTextbox").value;
  const textbox = document.getElementById("myTextbox");
  
  // Check if the input is a valid number
  if (!isNaN(numberInput) && numberInput !== "" && (numberInput > 0 && numberInput <= 12)) {
    gameCanStart = true;
    textbox.style.borderColor = "#4CAF50"; // Green border for valid input
  } else {
    gameCanStart = false;
    textbox.style.borderColor = "#F44336"; // Red border for invalid input
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

  // Find the element to replace
  const monsterImageContainer = document.getElementById("monsterImageContainer");
  if (!monsterImageContainer) {
    console.error("Monster image container not found!");
    return pickedNumber;
  }
  
  // Clear any existing content
  monsterImageContainer.innerHTML = "";
  
  // Create image element
  let imgElement = document.createElement("img");
  imgElement.src = `BossMonsters/${pickedNumber}.jpeg`;
  bossMonsterImageUrl = imgElement.src;
  imgElement.alt = "Boss Monster";
  
  // Create anchor element with proper link
  let anchorElement = document.createElement("a");
  
  // Make sure we have a valid link for this monster
  if (colorMapForLinkImage[pickedNumber]) {
    anchorElement.href = colorMapForLinkImage[pickedNumber];
  } else {
    // Default link if specific one not found
    anchorElement.href = "https://scryfall.com/search?q=commander%3A" + (scryfallColorMap[pickedNumber] || "wubrg");
  }
  
  anchorElement.target = "_blank";
  anchorElement.appendChild(imgElement);
  
  // Add the anchor element to the container
  monsterImageContainer.appendChild(anchorElement);
  
  // Set the scryfall monster colors
  scryfallMonsterColors = scryfallColorMap[pickedNumber];
  console.log("scryfall colors: " + scryfallMonsterColors);
  
  // Ensure scryfallMonsterColors has a default value if undefined
  if (!scryfallMonsterColors) {
    console.warn("scryfallColorMap missing entry for number:", pickedNumber);
    scryfallMonsterColors = "wubrg"; // Default to all colors if missing
  }

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

    img.style.width = "12vw";
    img.style.height = "12vh";

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

function setDifficultyAtStart(difficultyLevel) {
  difficulty = difficultyLevel; // Set the global difficulty variable
  
  switch (difficultyLevel) {
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
  if (!colorRectangle) {
    console.error("Color rectangle element not found!");
    return null;
  }
  
  colorRectangle.style.display = "block";
  const pickedNumber = pickMonster();
  console.log(pickedNumber);
  // Set the background color of the rectangle based on the chosen number
  const colorName = colorMap[pickedNumber];
  console.log(colorName);
  if (colorName && colorName.includes("-")) {
    const colors = colorName.split("-");
    const widthPercentage = 100 / colors.length;
    const gradientColors = colors.map(
      (color, index) =>
        `${color.toLowerCase()} ${widthPercentage * index}% ${widthPercentage * (index + 1)}%`,
    );
    colorRectangle.style.background = `linear-gradient(to right, ${gradientColors.join(", ")})`;
  } else if (colorName) {
    // Handle single-color scenarios
    colorRectangle.style.background = colorName.toLowerCase();
  } else {
    // Fallback if colorName is undefined
    colorRectangle.style.background = "gray";
    console.warn("Color not found for number:", pickedNumber);
  }
  
  return pickedNumber;
}

function updateMonsterHandSize() {
  const monsterHandDiv = document.getElementById("monsterHand");
  if (!monsterHandDiv) {
    console.error("Monster hand element not found!");
    return;
  }
  
  monsterHandSize =
    monsterStartingHandSize -
    Math.floor(currentRound / 2) +
    modifiedMonsterHandSize;
  monsterHandDiv.innerText = `Hand: ${monsterHandSize}`;
  monsterHandDiv.style.display = "block";
  
  // Show the buttons
  const buttonContainers = document.querySelectorAll("#monsterHandButtons");
  buttonContainers.forEach(container => {
    if (container) {
      container.style.display = "block";
    }
  });
}

function updateMonsterHandSizeByAmount(amount) {
  const monsterHandDiv = document.getElementById("monsterHand");
  modifiedMonsterHandSize = modifiedMonsterHandSize + amount;
  monsterHandSize =
    monsterStartingHandSize -
    Math.floor(currentRound / 2) +
    modifiedMonsterHandSize;
  monsterHandDiv.innerText = `Hand: ${monsterHandSize}`;
  monsterHandDiv.style.display = "block";
}

function updateMonsterLandCountByAmount(amount) {
  const monsterLandDiv = document.getElementById("monsterLand");
  if (!monsterLandDiv) {
    console.error("Monster land element not found!");
    return;
  }
  
  currentMonsterLands = currentMonsterLands + amount;
  monsterLandDiv.innerText = `Lands: ${currentMonsterLands}`;
  monsterLandDiv.style.display = "block";
  
  // Show the buttons
  const buttonContainers = document.querySelectorAll("#monsterLandButtons");
  buttonContainers.forEach(container => {
    if (container) {
      container.style.display = "block";
    }
  });
}

function startGame(difficultyLevel, playerCount) {
  // Validate input if using custom player count
  if (playerCount === 0) {
    const inputValue = document.getElementById("myTextbox").value;
    if (!inputValue || isNaN(inputValue) || inputValue <= 0 || inputValue > 12) {
      showErrorMessage("Please enter a valid number of players (1-12)");
      return;
    }
  }
  
  // Set difficulty at start
  setDifficultyAtStart(difficultyLevel);
  
  // Hide the starting screen
  const startingScreen = document.querySelector(".starting-screen");
  if (startingScreen) {
    startingScreen.style.display = "none";
  }
  
  // Hide the load game button from the bottom of the screen
  const loadGameButton = document.querySelector("button[onclick='loadGameState()']");
  if (loadGameButton && loadGameButton !== document.getElementById("homeLoadGameButton")) {
    loadGameButton.style.display = "none";
  }
  
  // Show the top section container
  const topSectionContainer = document.querySelector(".top-section-container");
  if (topSectionContainer) {
    topSectionContainer.style.display = "flex";
  }
  
  // Show dice log
  const diceLog = document.getElementById("diceLog");
  if (diceLog) {
    diceLog.style.display = "block";
  }
  
  // Show game action buttons
  const gameActionButtons = document.getElementById("gameActionButtons");
  if (gameActionButtons) {
    gameActionButtons.style.display = "block";
  }
  
  // Show monster controls
  const monsterControls = document.getElementById("monsterControls");
  if (monsterControls) {
    monsterControls.style.display = "flex";
  }
  
  // Show turn and infect controls
  const turnInfectControls = document.getElementById("turnInfectControls");
  if (turnInfectControls) {
    turnInfectControls.style.display = "flex";
  }
  
  // Show monster stats container
  const monsterStatsContainer = document.querySelector(".monster-stats-container");
  if (monsterStatsContainer) {
    monsterStatsContainer.style.display = "flex";
  }
  
  // Show graveyard table
  const graveyardTable = document.getElementById("graveyardTable");
  if (graveyardTable) {
    graveyardTable.style.display = "table";
  }
  
  // Show view graveyard button
  const viewGraveyardButton = document.getElementById("viewGraveyardButton");
  if (viewGraveyardButton) {
    viewGraveyardButton.style.display = "block";
  }
  
  // Set game started flag
  window.startedGame = true;
  
  // Get the number of players
  let value = playerCount === 0 ? document.getElementById("myTextbox").value : playerCount;
  numberOfPlayersGlobal = parseInt(value);
  monsterHealth = numberOfPlayersGlobal * lifeMultiplier;
  monsterInfect = numberOfPlayersGlobal * 7;
  updateMonsterHealth();
  updateMonsterInfect();
  createPlayerHealthBoxes(numberOfPlayersGlobal);

  // Pick a monster and display color rectangle
  displayColorRectangle();
  
  // Update monster stats
  updateMonsterHandSize();
  updateMonsterLandCountByAmount(0);
  
  // Initialize other game elements
  readActionJsonFiles();
  updateGraveyardTable();
  addLog(`ROUND ${currentRound}`);
  
  // Show player turn indicator
  showPlayerTurnIndicator();
}

// Make startGame globally available
window.startGame = startGame;

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
        (howManyToMake == 2 && listRolledFrom == "M") ||
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
  let regex = /\d+/;
  let number = action.match(regex);
  // Converting the extracted number from string to integer
  let amountToChangeHealth = parseInt(number);
  if (action.includes("The Raid Monster deals")) {
    modifyPlayerHealthFromMonster(amountToChangeHealth);
  } else if (action.includes("drains")) {
    // Extracting the number from the string
    modifyPlayerHealthFromMonster(amountToChangeHealth);
    increaseMonsterHealth(amountToChangeHealth * numberOfPlayersGlobal);
  } else if (action.includes("gains")) {
    increaseMonsterHealth(amountToChangeHealth);
  }
}

function pickRandomCardType(isMill) {
  // Calculate total percentage
  let totalPercent = creaturePercent + instantPercent + sorceryPercent + enchantmentPercent + landPercent + artifactPercent + planeswalkerPercent;
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();

  // Determine which type of card was chosen based on the random number
  let chosenType;
  if (randomNumber < creaturePercent / totalPercent) {
    chosenType = "Creature";
    creaturePercent = isMill ? creaturePercent - 1 : creaturePercent;
  } else if (randomNumber < (creaturePercent + instantPercent) / totalPercent) {
    chosenType = "Instant";
    instantPercent = isMill ? instantPercent - 1 : instantPercent;
  } else if (randomNumber < (creaturePercent + instantPercent + sorceryPercent) / totalPercent) {
    chosenType = "Sorcery";
    sorceryPercent = isMill ? sorceryPercent - 1 : sorceryPercent;
  } else if (randomNumber < (creaturePercent + instantPercent + sorceryPercent + enchantmentPercent) / totalPercent) {
    chosenType = "Enchantment";
    enchantmentPercent = isMill ? enchantmentPercent - 1 : enchantmentPercent;
  } else if (randomNumber < (creaturePercent + instantPercent + sorceryPercent + enchantmentPercent + landPercent) / totalPercent) {
    chosenType = "Land";
    landPercent = isMill ? landPercent - 1 : landPercent;
  } else if (randomNumber < (creaturePercent + instantPercent + sorceryPercent + enchantmentPercent + landPercent + artifactPercent) / totalPercent) {
    chosenType = "Artifact";
    artifactPercent = isMill ? artifactPercent - 1 : artifactPercent;
  } else {
    chosenType = "Planeswalker";
    planeswalkerPercent = isMill ? planeswalkerPercent - 1 : planeswalkerPercent;
  }
  return chosenType;
}

function showLoadingSpinner() {
  // Create spinner if it doesn't exist
  let spinner = document.getElementById('loadingSpinner');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'loading-spinner';
    document.body.appendChild(spinner);
  }
  spinner.style.display = 'block';
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
}

function millMonster() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  if (cardsInMonsterDeck == 0) {
    addLog("YOU WON VIA MILLING! CONGRATS");
    monsterHealth = 0;
    updateMonsterHealth();
    openPopup("./FunStuff/yRMCDs.gif");
    disableAllButtonsExceptRestart();
    return;
  }
  
  // Disable mill button while processing
  const millButton = document.getElementById('millButton');
  if (millButton) millButton.disabled = true;
  
  // Show loading spinner
  showLoadingSpinner();
  
  let cardMilled;
  let cardImageUrl = null;
  let cardName = null;
  
  // If a card has been revealed but not yet milled or drawn
  if (!hasCardBeenMilled && !hasCardBeenDrawn && cardTypeRevealed !== "") {
    // Use the already revealed card
    cardMilled = cardTypeRevealed;
    cardImageUrl = currentRandomCardUrl;
    cardName = currentRandomCardName;
    cardTypeRevealed = "";
    
    // Process immediately for revealed cards
    cardsInMonsterDeck -= 1;
    graveyard[cardMilled]++;
    hasCardBeenMilled = true;
    
    // Store the milled card image
    if (cardImageUrl) {
      milledCardImages.push({
        url: cardImageUrl,
        name: cardName,
        type: cardMilled
      });
    }
    
    // Format: "MONSTER MILLED: [Type] - [CardName]. CARDS LEFT: [Count]"
    addLog("MONSTER MILLED: " + cardMilled + " - " + cardName + ". CARDS LEFT: " + cardsInMonsterDeck, cardImageUrl);
    
    updateGraveyardTable();
    if (millButton) millButton.disabled = false;
    hideLoadingSpinner();
    return;
  }
  
  // Pick a new random card type for new cards
  cardMilled = pickRandomCardType(true);
  
  // Check if scryfallMonsterColors is defined
  if (!scryfallMonsterColors) {
    addLog("ERROR: Monster colors not defined. Please restart the game.");
    if (millButton) millButton.disabled = false;
    hideLoadingSpinner();
    return;
  }
  
  // Create URL for Scryfall API based on card type
  let randomCardUrl;
  if (cardMilled == "Land") {
    randomCardUrl = "https://api.scryfall.com/cards/random?q=commander%3A" + scryfallMonsterColors + "+t%3Aland+-layout%3A%22modal_dfc%22+legal%3Acommander";
  } else {
    randomCardUrl = "https://api.scryfall.com/cards/random?q=t%3A" + cardMilled + "+commander%3A" + scryfallMonsterColors + "+legal%3Acommander";
  }
  
  // For new cards, fetch from API
  getRandomCardImageUrl(randomCardUrl)
    .then(result => {
      if (millButton) millButton.disabled = false;
      hideLoadingSpinner(); // Hide spinner when done
      
      cardsInMonsterDeck -= 1;
      graveyard[cardMilled]++;
      hasCardBeenMilled = true;
      
      if (result && result.imageUrl) {
        // Store the milled card image
        milledCardImages.push({
          url: result.imageUrl,
          name: result.cardName,
          type: cardMilled
        });
        
        // Format: "MONSTER MILLED: [Type] - [CardName]. CARDS LEFT: [Count]"
        addLog("MONSTER MILLED: " + cardMilled + " - " + result.cardName + ". CARDS LEFT: " + cardsInMonsterDeck, result.imageUrl);
        openPopup(result.imageUrl);
      } else {
        // Fallback if image fetch fails
        addLog("MONSTER MILLED: " + cardMilled + ". CARDS LEFT: " + cardsInMonsterDeck);
      }
      
      updateGraveyardTable();
    })
    .catch(error => {
      console.error("Error fetching milled card:", error);
      if (millButton) millButton.disabled = false;
      hideLoadingSpinner(); // Hide spinner on error
      
      // Still mill the card even if image fetch fails
      cardsInMonsterDeck -= 1;
      graveyard[cardMilled]++;
      hasCardBeenMilled = true;
      addLog("MONSTER MILLED: " + cardMilled + ". CARDS LEFT: " + cardsInMonsterDeck);
      updateGraveyardTable();
    });
}

function openPopup(imageSrc) {
  let overlay = document.getElementById('overlay');
  let popup = document.getElementById('popup');
  let popupImage = document.getElementById('popupImage');
  popupImage.src = imageSrc;
  overlay.style.display = 'block';
  popup.style.display = 'block';
  // Prevent closing the popup when clicking inside it

  document.addEventListener('click', closePopup);
}

function closePopup() {
  let overlay = document.getElementById('overlay');
  let popup = document.getElementById('popup');
  let isClickInsidePopup = event.target === popup || popup.contains(event.target);

  // Close the popup only if the click is not inside the popup
  if (isClickInsidePopup) {
    overlay.style.display = 'none';
    popup.style.display = 'none';
    document.removeEventListener('click', closePopup);
  }
}

function updateGraveyardTable() {
  const table = document.getElementById('graveyardTable');
  cardsInMonsterGraveyard++;
  table.innerHTML = `
  <caption>Monster's Graveyard: ${cardsInMonsterGraveyard}</caption>
    <tr>
      <th>Card Type</th>
      <th>Count</th>
    </tr>
    ${Object.entries(graveyard).map(([type, count]) => `
      <tr>
        <td>${type}</td>
        <td>${count}</td>
      </tr>
    `).join('')}
  `;
}

async function getRandomCardImageUrl(url) {
  try {
    showLoadingSpinner(); // Show spinner before fetch
    const response = await fetch(url);
    if (!response.ok) {
      hideLoadingSpinner(); // Hide spinner on error
      throw new Error('Network response was not ok: ' + response.status);
    }
    const cardData = await response.json();
    
    // Store the card name for later use
    const cardName = cardData.name || "Unknown Card";
    
    // Check if the response has the expected structure
    if (!cardData.image_uris || !cardData.image_uris.normal) {
      // Try alternative image path for double-faced cards
      if (cardData.card_faces && cardData.card_faces[0] && cardData.card_faces[0].image_uris) {
        hideLoadingSpinner(); // Hide spinner before returning
        return { 
          imageUrl: cardData.card_faces[0].image_uris.normal,
          cardName: cardName
        };
      }
      hideLoadingSpinner(); // Hide spinner on error
      throw new Error('Invalid card data structure');
    }
    
    hideLoadingSpinner(); // Hide spinner before returning
    return { 
      imageUrl: cardData.image_uris.normal,
      cardName: cardName
    };
  } catch (error) {
    console.error('Error fetching card:', error);
    hideLoadingSpinner(); // Ensure spinner is hidden on error
    return null;
  }
}

function revealTopCard() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  
  if(hasCardBeenMilled || hasCardBeenDrawn) {
    let randomTopCardId = document.getElementById('randomTopCardId');
    randomTopCardId.disabled = true;
    showLoadingSpinner(); // Show loading spinner
    
    cardTypeRevealed = pickRandomCardType(false);
    
    // Check if scryfallMonsterColors is defined
    if (!scryfallMonsterColors) {
      addLog("ERROR: Monster colors not defined. Please restart the game.");
      randomTopCardId.disabled = false;
      hideLoadingSpinner(); // Hide spinner on error
      return;
    }
    
    let randomCardUrl;
    if (cardTypeRevealed == "Land") {
      randomCardUrl = "https://api.scryfall.com/cards/random?q=commander%3A" + scryfallMonsterColors + "+t%3Aland+-layout%3A%22modal_dfc%22+legal%3Acommander";
    } else {
      randomCardUrl = "https://api.scryfall.com/cards/random?q=t%3A" + cardTypeRevealed + "+commander%3A" + scryfallMonsterColors + "+legal%3Acommander";
    }
    
    getRandomCardImageUrl(randomCardUrl)
      .then(result => {
        randomTopCardId.disabled = false;
        hideLoadingSpinner(); // Hide spinner when done
        
        if (result && result.imageUrl) {
          // Format: "MONSTER REVEALED: [Type] - [CardName]"
          // Remove the "CARDS LEFT" part for revealed cards
          addLog("MONSTER REVEALED: " + cardTypeRevealed + " - " + result.cardName, result.imageUrl);
          // Store both the image URL and card name
          currentRandomCardUrl = result.imageUrl;
          currentRandomCardName = result.cardName;
          openPopup(currentRandomCardUrl);
        }
      })
      .catch(error => {
        console.error("Error fetching card:", error);
        addLog("ERROR: Failed to fetch card. Please try again.");
        randomTopCardId.disabled = false;
        hideLoadingSpinner(); // Hide spinner on error
      });
      
    hasCardBeenMilled = false;
    hasCardBeenDrawn = false;
  } else {
    openPopup(currentRandomCardUrl);
    return;
  }
}

// Add this new function to disable all buttons except restart
function disableAllButtonsExceptRestart() {
  // Get all buttons on the page
  const allButtons = document.querySelectorAll('button');
  
  // Disable all buttons except the refresh/restart button
  allButtons.forEach(button => {
    if (button.id !== 'refreshButton') {
      button.disabled = true;
      button.style.opacity = '0.5';
      button.style.cursor = 'not-allowed';
    }
  });
}

// Make sure action JSON files are loaded properly
function readActionJsonFiles() {
  console.log("Reading action JSON files...");
  
  // Load Easy Actions
  fetch("./Actions/EasyActions.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Easy actions loaded:", data);
      window.easyActionsJson = data;
    })
    .catch(error => {
      console.error("Error loading easy actions:", error);
    });
    
  // Load Medium Actions
  fetch("./Actions/MediumActions.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Medium actions loaded:", data);
      window.mediumActionsJson = data;
    })
    .catch(error => {
      console.error("Error loading medium actions:", error);
    });
    
  // Load Hard Actions
  fetch("./Actions/HardActions.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Hard actions loaded:", data);
      window.hardActionsJson = data;
    })
    .catch(error => {
      console.error("Error loading hard actions:", error);
    });
}

// Make readActionJsonFiles globally available
window.readActionJsonFiles = readActionJsonFiles;

// Add this function to display all milled card images
function viewGraveyard() {
  // Create a modal container
  const modal = document.createElement('div');
  modal.className = 'graveyard-modal';
  
  // Create a close button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    document.body.removeChild(modal);
  };
  
  // Add instructions text
  const instructions = document.createElement('div');
  instructions.className = 'graveyard-instructions';
  instructions.innerHTML = '<p>Click a card to view it larger. <strong>Right-click a card to remove it from the graveyard.</strong></p>';
  instructions.style.color = 'white';
  instructions.style.textAlign = 'center';
  instructions.style.padding = '10px';
  instructions.style.marginTop = '50px';
  instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  instructions.style.borderRadius = '5px';
  
  // Create a container for the images
  const imageContainer = document.createElement('div');
  imageContainer.className = 'graveyard-images';
  
  // Add all milled card images to the container
  if (milledCardImages.length === 0) {
    const noCardsMessage = document.createElement('p');
    noCardsMessage.textContent = 'No cards in graveyard yet.';
    noCardsMessage.style.color = 'white';
    noCardsMessage.style.textAlign = 'center';
    imageContainer.appendChild(noCardsMessage);
  } else {
    // Group cards by type
    const cardsByType = {};
    milledCardImages.forEach(card => {
      if (!cardsByType[card.type]) {
        cardsByType[card.type] = [];
      }
      cardsByType[card.type].push(card);
    });
    
    // Create sections for each card type
    Object.keys(cardsByType).forEach(type => {
      const typeSection = document.createElement('div');
      typeSection.className = 'card-type-section';
      
      const typeHeader = document.createElement('h3');
      typeHeader.textContent = `${type} (${cardsByType[type].length})`;
      typeSection.appendChild(typeHeader);
      
      const typeCards = document.createElement('div');
      typeCards.className = 'type-cards';
      
      cardsByType[type].forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'graveyard-card';
        
        const cardImage = document.createElement('img');
        cardImage.src = card.url;
        cardImage.alt = card.name;
        cardImage.title = card.name;
        cardImage.onclick = function() {
          openPopup(card.url);
        };
        
        // Add right-click event to remove card from graveyard
        cardImage.addEventListener('contextmenu', function(e) {
          e.preventDefault(); // Prevent default context menu
          
          // Remove card from milledCardImages array
          milledCardImages.splice(milledCardImages.findIndex(c => 
            c.url === card.url && c.name === card.name && c.type === card.type), 1);
          
          // Update graveyard count
          graveyard[card.type]--;
          cardsInMonsterGraveyard--;
          
          // Update graveyard table
          updateGraveyardTable();
          
          // Remove the card element from the display
          cardElement.remove();
          
          // Update the type header count
          typeHeader.textContent = `${type} (${cardsByType[type].length - 1})`;
          
          // If this was the last card of this type, remove the section
          if (cardsByType[type].length === 1) {
            typeSection.remove();
          }
          
          // If this was the last card in the graveyard, show "No cards" message
          if (milledCardImages.length === 0) {
            const noCardsMessage = document.createElement('p');
            noCardsMessage.textContent = 'No cards in graveyard yet.';
            noCardsMessage.style.color = 'white';
            noCardsMessage.style.textAlign = 'center';
            imageContainer.innerHTML = '';
            imageContainer.appendChild(noCardsMessage);
          }
          
          // Show a temporary message
          showMessage(`Removed ${card.name} from graveyard`);
        });
        
        cardElement.appendChild(cardImage);
        typeCards.appendChild(cardElement);
      });
      
      typeSection.appendChild(typeCards);
      imageContainer.appendChild(typeSection);
    });
  }
  
  // Add elements to the modal
  modal.appendChild(closeButton);
  modal.appendChild(instructions);
  modal.appendChild(imageContainer);
  
  // Add the modal to the body
  document.body.appendChild(modal);
}

// Make the viewGraveyard function globally available
window.viewGraveyard = viewGraveyard;

// Add keyboard shortcuts for common actions
document.addEventListener('keydown', function(event) {
  if (!window.startedGame) return;
  
  switch(event.key) {
    case 'm': // 'm' for monster action
      takeMonsterAction();
      break;
    case 'r': // 'r' for reveal top card
      revealTopCard();
      break;
    case 'l': // 'l' for mill
      millMonster();
      break;
    case '+': // '+' for increase round
    case '=':
      increaseRound();
      break;
    case '-': // '-' for decrease round
      decreaseRound();
      break;
  }
});

// Add a function to save game state
function saveGameState() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  
  try {
    const gameState = {
      monsterHealth: monsterHealth,
      monsterInfect: monsterInfect,
      currentRound: currentRound,
      numberOfDiceRolled: numberOfDiceRolled,
      cardsInMonsterDeck: cardsInMonsterDeck,
      graveyard: graveyard,
      cardsInMonsterGraveyard: cardsInMonsterGraveyard,
      milledCardImages: milledCardImages, // Save milled card images
      bossMonsterImageUrl: bossMonsterImageUrl,
      scryfallMonsterColors: scryfallMonsterColors,
      difficulty: difficulty,
      playerHealths: [],
      minions: []
    };
    
    // Get player health values - with error handling
    for (let i = 1; i <= numberOfPlayersGlobal; i++) {
      if (playerHealth[i] !== undefined) {
        gameState.playerHealths.push(playerHealth[i]);
      }
    }
    
    // Get minion data
    const minionContainers = document.querySelectorAll('#imageContainer .image-container');
    minionContainers.forEach(container => {
      const img = container.querySelector('img');
      const healthText = container.querySelector('.image-text');
      
      if (img && healthText) {
        const imgSrc = img.src;
        const minionNumber = imgSrc.split('/').pop().split('.')[0];
        
        gameState.minions.push({
          number: minionNumber,
          health: healthText.textContent
        });
      }
    });
    
    // Save to localStorage
    localStorage.setItem('mtgRaidBossGameState', JSON.stringify(gameState));
    showMessage("Game state saved!");
  } catch (error) {
    console.error("Error saving game state:", error);
    showMessage("Failed to save game state");
  }
}

// Add a function to load game state
function loadGameState() {
  try {
    const savedState = localStorage.getItem('mtgRaidBossGameState');
    if (!savedState) {
      showMessage("No saved game found!");
      return;
    }
    
    const gameState = JSON.parse(savedState);
    
    // Set game as started
    window.startedGame = true;
    
    // Hide the starting screen
    const startingScreen = document.querySelector(".starting-screen");
    if (startingScreen) {
      startingScreen.style.display = "none";
    }
    
    // Hide the load game button from the bottom of the screen
    const loadGameButton = document.querySelector("button[onclick='loadGameState()']");
    if (loadGameButton && loadGameButton !== document.getElementById("homeLoadGameButton")) {
      loadGameButton.style.display = "none";
    }
    
    // Show all game UI elements
    // Show the top section container
    const topSectionContainer = document.querySelector(".top-section-container");
    if (topSectionContainer) {
      topSectionContainer.style.display = "flex";
    }
    
    // Show dice log
    const diceLog = document.getElementById("diceLog");
    if (diceLog) {
      diceLog.style.display = "block";
    }
    
    // Show game action buttons
    const gameActionButtons = document.getElementById("gameActionButtons");
    if (gameActionButtons) {
      gameActionButtons.style.display = "block";
    }
    
    // Show monster controls
    const monsterControls = document.getElementById("monsterControls");
    if (monsterControls) {
      monsterControls.style.display = "flex";
    }
    
    // Show turn and infect controls
    const turnInfectControls = document.getElementById("turnInfectControls");
    if (turnInfectControls) {
      turnInfectControls.style.display = "flex";
    }
    
    // Show monster stats container
    const monsterStatsContainer = document.querySelector(".monster-stats-container");
    if (monsterStatsContainer) {
      monsterStatsContainer.style.display = "flex";
    }
    
    // Show graveyard table
    const graveyardTable = document.getElementById("graveyardTable");
    if (graveyardTable) {
      graveyardTable.style.display = "table";
    }
    
    // Show view graveyard button
    const viewGraveyardButton = document.getElementById("viewGraveyardButton");
    if (viewGraveyardButton) {
      viewGraveyardButton.style.display = "block";
    }
    
    // Load basic game state
    monsterHealth = gameState.monsterHealth || 100;
    monsterInfect = gameState.monsterInfect || 0;
    currentRound = gameState.currentRound || 1;
    numberOfDiceRolled = gameState.numberOfDiceRolled || 0;
    cardsInMonsterDeck = gameState.cardsInMonsterDeck || 99;
    difficulty = gameState.difficulty || "medium";
    numberOfPlayersGlobal = gameState.playerHealths ? gameState.playerHealths.length : 4;
    
    // Set difficulty-based variables
    setDifficultyAtStart(difficulty);
    
    // Load graveyard if available
    if (gameState.graveyard) {
      graveyard = gameState.graveyard;
      cardsInMonsterGraveyard = gameState.cardsInMonsterGraveyard || Object.values(graveyard).reduce((a, b) => a + b, 0) - 1;
    }
    
    // Load milled card images if available
    if (gameState.milledCardImages) {
      milledCardImages = gameState.milledCardImages;
    }
    
    // Create player health boxes
    createPlayerHealthBoxes(numberOfPlayersGlobal);
    
    // Update UI elements
    updateMonsterHealth();
    updateMonsterInfect();
    updateRound();
    updateGraveyardTable();
    
    // Load boss monster image if available
    if (gameState.bossMonsterImageUrl) {
      const monsterImageContainer = document.getElementById("monsterImageContainer");
      if (monsterImageContainer) {
        monsterImageContainer.innerHTML = "";
        
        // Create image element
        let imgElement = document.createElement("img");
        imgElement.src = gameState.bossMonsterImageUrl;
        bossMonsterImageUrl = imgElement.src;
        imgElement.alt = "Boss Monster";
        
        // Create anchor element
        let anchorElement = document.createElement("a");
        anchorElement.href = "#"; // Default link
        anchorElement.target = "_blank";
        anchorElement.appendChild(imgElement);
        
        // Add the anchor element to the container
        monsterImageContainer.appendChild(anchorElement);
      }
    }
    
    // Restore monster colors
    if (gameState.scryfallMonsterColors) {
      scryfallMonsterColors = gameState.scryfallMonsterColors;
      
      // Display color rectangle
      const colorRectangle = document.getElementById("colorRectangle");
      if (colorRectangle) {
        colorRectangle.style.display = "block";
        
        // Try to determine the color from the URL
        const urlParts = gameState.bossMonsterImageUrl.split('/');
        const pickedNumber = parseInt(urlParts[urlParts.length - 1].split('.')[0]);
        
        if (pickedNumber && colorMap[pickedNumber]) {
          const colorName = colorMap[pickedNumber];
          if (colorName && colorName.includes("-")) {
            const colors = colorName.split("-");
            const widthPercentage = 100 / colors.length;
            const gradientColors = colors.map(
              (color, index) =>
                `${color.toLowerCase()} ${widthPercentage * index}% ${widthPercentage * (index + 1)}%`,
            );
            colorRectangle.style.background = `linear-gradient(to right, ${gradientColors.join(", ")})`;
          } else if (colorName) {
            colorRectangle.style.background = colorName.toLowerCase();
          }
        }
      }
    }
    
    // Update player health values
    if (gameState.playerHealths && gameState.playerHealths.length > 0) {
      gameState.playerHealths.forEach((health, index) => {
        const playerIndex = index + 1; // Player indices are 1-based
        playerHealth[playerIndex] = health; // Update the playerHealth object
        
        // Update the display
        const healthDisplay = document.getElementById(`player${playerIndex}HealthDisplay`);
        if (healthDisplay) {
          healthDisplay.textContent = `Health: ${health}`;
        }
      });
    }
    
    // Make sure the player health container is visible
    const playerHealthContainer = document.getElementById("playerHealthContainer");
    if (playerHealthContainer) {
      playerHealthContainer.style.display = "flex";
    }
    
    // Restore minions if available
    if (gameState.minions && gameState.minions.length > 0) {
      const container = document.getElementById("imageContainer");
      if (container) {
        // Clear existing minions
        container.innerHTML = "";
        
        // Add saved minions
        gameState.minions.forEach(minion => {
          const imageContainer = document.createElement("div");
          imageContainer.className = "image-container";
          
          const img = document.createElement("img");
          img.src = `Minions/${minion.number}.jpeg`;
          img.alt = "Minion";
          img.style.width = "12vw";
          img.style.height = "12vh";
          
          const imageText = document.createElement("div");
          imageText.className = "image-text";
          imageText.textContent = minion.health;
          imageText.contentEditable = true;
          
          img.addEventListener("click", function () {
            removeImage(imageContainer);
          });
          
          imageContainer.appendChild(img);
          imageContainer.appendChild(imageText);
          container.appendChild(imageContainer);
        });
      }
    }
    
    // Update monster hand and land counts
    updateMonsterHandSize();
    updateMonsterLandCountByAmount(0);
    
    // Initialize other game elements
    readActionJsonFiles();
    
    // Show player turn indicator
    showPlayerTurnIndicator();
    
    showMessage("Game state loaded!");
  } catch (error) {
    console.error("Error loading game state:", error);
    showMessage("Failed to load game state");
  }
}

// Helper function to show temporary messages
function showMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'temp-message';
  messageElement.textContent = message;
  document.body.appendChild(messageElement);
  
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(messageElement), 500);
  }, 2000);
}

// Add a function to clear saved game state
function clearSavedGameState() {
  try {
    // Check if there's a saved game
    const savedState = localStorage.getItem('mtgRaidBossGameState');
    if (!savedState) {
      showMessage("No saved game to clear!");
      return;
    }
    
    // Remove the saved game state
    localStorage.removeItem('mtgRaidBossGameState');
    showMessage("Saved game cleared successfully!");
  } catch (error) {
    console.error("Error clearing game state:", error);
    showMessage("Failed to clear saved game");
  }
}

// Make function globally available
window.clearSavedGameState = clearSavedGameState;

// Make these functions globally available
window.takeMonsterAction = takeMonsterAction;
window.increaseRound = increaseRound;
window.decreaseRound = decreaseRound;
window.millMonster = millMonster;
window.revealTopCard = revealTopCard;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;

// Advanced mill functions
function showAdvancedMillOptions() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  
  const popup = document.getElementById('advancedMillPopup');
  const overlay = document.getElementById('overlay');
  
  popup.style.display = 'block';
  overlay.style.display = 'block';
  
  // Set up event listeners
  document.getElementById('millHalfLibraryBtn').onclick = millHalfLibrary;
  document.getElementById('millUntilTypeBtn').onclick = function() {
    document.getElementById('cardTypeOptions').style.display = 'block';
  };
  document.getElementById('closeAdvancedMillBtn').onclick = function() {
    popup.style.display = 'none';
    overlay.style.display = 'none';
    document.getElementById('cardTypeOptions').style.display = 'none';
  };
  
  // Set up mill until type button with selected options
  const millUntilTypeBtn = document.getElementById('millUntilTypeBtn');
  millUntilTypeBtn.onclick = function() {
    const cardTypeOptions = document.getElementById('cardTypeOptions');
    if (cardTypeOptions.style.display === 'none') {
      cardTypeOptions.style.display = 'block';
    } else {
      // Get selected card type
      const selectedType = document.querySelector('input[name="cardType"]:checked').value;
      // Get selected destination for non-matching cards
      const nonMatchingDest = document.querySelector('input[name="nonMatchingCards"]:checked').value;
      // Execute mill until type
      millUntilCardType(selectedType, nonMatchingDest);
      // Close popup
      popup.style.display = 'none';
      overlay.style.display = 'none';
      cardTypeOptions.style.display = 'none';
    }
  };
}

function millHalfLibrary() {
  if (cardsInMonsterDeck <= 0) {
    showErrorMessage("No cards left in library");
    return;
  }
  
  // Calculate half the library
  const cardsToMill = Math.ceil(cardsInMonsterDeck / 2);
  showMessage(`Milling ${cardsToMill} cards...`);
  
  // Disable buttons while processing
  document.getElementById('millHalfLibraryBtn').disabled = true;
  document.getElementById('closeAdvancedMillBtn').disabled = true;
  
  // Show loading spinner
  showLoadingSpinner();
  
  // Mill cards one by one without fetching images
  let milledCount = 0;
  let tempGraveyard = {...graveyard};
  let milledTypes = [];
  
  for (let i = 0; i < cardsToMill; i++) {
    if (cardsInMonsterDeck <= 0) break;
    
    // Pick a random card type
    const cardType = pickRandomCardType(true);
    milledTypes.push(cardType);
    tempGraveyard[cardType]++;
    milledCount++;
    cardsInMonsterDeck--;
  }
  
  // Update the actual graveyard with our temporary one
  graveyard = tempGraveyard;
  
  // Create a summary of milled cards
  const summary = Object.entries(tempGraveyard)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');
  
  // Log the mill action
  addLog(`MONSTER MILLED ${milledCount} CARDS (${summary}). CARDS LEFT: ${cardsInMonsterDeck}`);
  
  // Update the graveyard table
  updateGraveyardTable();
  
  // Re-enable buttons
  document.getElementById('millHalfLibraryBtn').disabled = false;
  document.getElementById('closeAdvancedMillBtn').disabled = false;
  
  // Hide loading spinner
  hideLoadingSpinner();
  
  // Close the popup
  document.getElementById('advancedMillPopup').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  
  // Check if library is empty
  if (cardsInMonsterDeck <= 0) {
    addLog("YOU WON VIA MILLING! CONGRATS");
    monsterHealth = 0;
    updateMonsterHealth();
    openPopup("./FunStuff/yRMCDs.gif");
    disableAllButtonsExceptRestart();
  }
}

function millUntilCardType(targetType, nonMatchingDestination) {
  if (cardsInMonsterDeck <= 0) {
    showErrorMessage("No cards left in library");
    return;
  }
  
  showMessage(`Milling until ${targetType} is found...`);
  
  // Disable buttons while processing
  document.getElementById('millUntilTypeBtn').disabled = true;
  document.getElementById('closeAdvancedMillBtn').disabled = true;
  
  // Show loading spinner
  showLoadingSpinner();
  
  let foundTargetType = false;
  let milledCount = 0;
  let tempGraveyard = {...graveyard};
  let nonMatchingCards = [];
  
  // Mill until we find the target type or empty the library
  while (!foundTargetType && cardsInMonsterDeck > 0) {
    // Pick a random card type
    const cardType = pickRandomCardType(false); // Don't modify percentages yet
    milledCount++;
    
    if (cardType === targetType) {
      // Found the target type
      foundTargetType = true;
      tempGraveyard[cardType]++;
      cardsInMonsterDeck--;
      
      // Now fetch the actual card image from Scryfall for the found card
      let randomCardUrl;
      if (cardType === "Land") {
        randomCardUrl = "https://api.scryfall.com/cards/random?q=commander%3A" + scryfallMonsterColors + "+t%3Aland+-layout%3A%22modal_dfc%22+legal%3Acommander";
      } else {
        randomCardUrl = "https://api.scryfall.com/cards/random?q=t%3A" + cardType + "+commander%3A" + scryfallMonsterColors + "+legal%3Acommander";
      }
      
      getRandomCardImageUrl(randomCardUrl)
        .then(result => {
          if (result && result.imageUrl) {
            // Store the milled card image
            milledCardImages.push({
              url: result.imageUrl,
              name: result.cardName,
              type: cardType
            });
            
            // Show the found card
            openPopup(result.imageUrl);
            
            // Format: "FOUND TARGET CARD: [Type] - [CardName]. MILLED [count] CARDS."
            addLog(`FOUND TARGET CARD: ${cardType} - ${result.cardName}. MILLED ${milledCount} CARDS.`, result.imageUrl);
          }
        })
        .catch(error => {
          console.error("Error fetching target card:", error);
        });
    } else {
      // Not the target type
      nonMatchingCards.push(cardType);
      cardsInMonsterDeck--;
      
      if (nonMatchingDestination === "graveyard") {
        tempGraveyard[cardType]++;
      } else {
        // Put back in library (don't decrease cardsInMonsterDeck)
        cardsInMonsterDeck++;
      }
    }
  }
  
  // If we didn't find the target type
  if (!foundTargetType) {
    addLog(`TARGET TYPE ${targetType} NOT FOUND AFTER MILLING ${milledCount} CARDS.`);
    
    // If we're putting non-matching cards in graveyard, update it
    if (nonMatchingDestination === "graveyard") {
      graveyard = tempGraveyard;
    }
    
    // Check if library is empty
    if (cardsInMonsterDeck <= 0) {
      addLog("YOU WON VIA MILLING! CONGRATS");
      monsterHealth = 0;
      updateMonsterHealth();
      openPopup("./FunStuff/yRMCDs.gif");
      disableAllButtonsExceptRestart();
    }
  } else {
    // Update graveyard with our temporary one
    graveyard = tempGraveyard;
    
    // Create a summary of non-matching cards
    if (nonMatchingDestination === "graveyard" && nonMatchingCards.length > 0) {
      const nonMatchingSummary = nonMatchingCards.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const summary = Object.entries(nonMatchingSummary)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');
      
      addLog(`NON-MATCHING CARDS SENT TO GRAVEYARD: ${summary}`);
    } else if (nonMatchingCards.length > 0) {
      addLog(`${nonMatchingCards.length} NON-MATCHING CARDS RETURNED TO LIBRARY`);
    }
  }
  
  // Update the graveyard table
  updateGraveyardTable();
  
  // Re-enable buttons
  document.getElementById('millUntilTypeBtn').disabled = false;
  document.getElementById('closeAdvancedMillBtn').disabled = false;
  
  // Hide loading spinner
  hideLoadingSpinner();
  
  // Close the popup
  document.getElementById('advancedMillPopup').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('cardTypeOptions').style.display = 'none';
}

// Make the function globally available
window.showAdvancedMillOptions = showAdvancedMillOptions;



















































