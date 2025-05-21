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
let hasCardBeenMilled = true;
let hasCardBeenDrawn = true;
let hasRevealedTopCard = false;
let cardTypeRevealed = "";
let difficulty = "medium"; // Default difficulty

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
  
  const actionElement = document.getElementById("action");
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

  // Set the background color of the rectangle based on the chosen number
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
  
  // Hide all start buttons
  const startButtons = document.querySelectorAll(".start-button");
  startButtons.forEach(button => {
    button.style.display = "none";
  });
  
  // Hide the button container
  const buttonContainer = document.querySelector(".button-container");
  if (buttonContainer) {
    buttonContainer.style.display = "none";
  }
  
  // Hide the player entry section
  const displayContainer = document.querySelector(".display-container");
  if (displayContainer) {
    displayContainer.style.display = "none";
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
  
  // Show graveyard table
  const graveyardTable = document.getElementById("graveyardTable");
  if (graveyardTable) {
    graveyardTable.style.display = "table";
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
  let cardMilled;
  if(cardTypeRevealed != "") {
    cardMilled = cardTypeRevealed;
    cardTypeRevealed = "";
  } else {
    cardMilled = pickRandomCardType(true);
  }
  cardsInMonsterDeck -= 1;
  graveyard[cardMilled]++;
  hasCardBeenMilled = true;
  addLog("MONSTER MILLED: " + cardMilled + ". NUMBER OF CARDS LEFT: " + cardsInMonsterDeck);
  updateGraveyardTable();
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
  table.style.display = "block";
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
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.status);
    }
    const cardData = await response.json();
    
    // Check if the response has the expected structure
    if (!cardData.image_uris || !cardData.image_uris.normal) {
      // Try alternative image path for double-faced cards
      if (cardData.card_faces && cardData.card_faces[0] && cardData.card_faces[0].image_uris) {
        return cardData.card_faces[0].image_uris.normal;
      }
      throw new Error('Invalid card data structure');
    }
    
    return cardData.image_uris.normal;
  } catch (error) {
    console.error('Error fetching card:', error);
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
    cardTypeRevealed = pickRandomCardType(false);
    
    // Check if scryfallMonsterColors is defined
    if (!scryfallMonsterColors) {
      addLog("ERROR: Monster colors not defined. Please restart the game.");
      randomTopCardId.disabled = false;
      return;
    }
    
    let randomCardUrl;
    if (cardTypeRevealed == "Land") {
      randomCardUrl = "https://api.scryfall.com/cards/random?q=commander%3A" + scryfallMonsterColors + "+t%3Aland+-layout%3A%22modal_dfc%22+legal%3Acommander";
    } else {
      randomCardUrl = "https://api.scryfall.com/cards/random?q=t%3A" + cardTypeRevealed + "+commander%3A" + scryfallMonsterColors + "+legal%3Acommander";
    }
    
    getRandomCardImageUrl(randomCardUrl)
      .then(imageUrl => {
        randomTopCardId.disabled = false;
        if (imageUrl) {
          addLog("MONSTER REVEALED A(N) " + cardTypeRevealed + ": ", imageUrl);
          // You can use imageUrl here to display the image on your webpage or do further processing
          currentRandomCardUrl = imageUrl;
          openPopup(currentRandomCardUrl);
        }
      })
      .catch(error => {
        console.error("Error fetching card:", error);
        addLog("ERROR: Failed to fetch card. Please try again.");
        randomTopCardId.disabled = false;
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

// Make necessary functions globally available
window.startGame = startGame;
window.checkInput = checkInput;
































