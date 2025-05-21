// Make the refreshPage function globally available
window.refreshPage = function() {
  location.reload();
};

function strikeOutMonsterAction() {
  if (!gameCanStart) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  const diceLog = document.getElementById("diceLog");
  const logEntries = diceLog.getElementsByClassName("logEntry");

  // Check if there are log entries
  if (logEntries.length > 0) {
    // Strike out the most recent log entry
    const mostRecentLog = logEntries[logEntries.length - 1];
    if (
      !mostRecentLog.innerText.includes("ROUND") &&
      !mostRecentLog.innerText.includes("HP")
    ) {
      mostRecentLog.style.textDecoration = "line-through";
    }
  }
}

function removeImage(img) {
  const container = img.parentNode;
  container.removeChild(img);
}

function showErrorMessage(message) {
  // Create a new error message element
  const errorMessageElement = document.createElement("div");
  errorMessageElement.className = "errorMessage";
  errorMessageElement.textContent = message;

  // Append the error message element to the body
  document.body.appendChild(errorMessageElement);

  // Display the error message
  errorMessageElement.style.display = "block";

  // Hide the error message after 5 seconds
  setTimeout(function () {
    errorMessageElement.style.display = "none";
    // Remove the error message element from the DOM after fading out
    errorMessageElement.remove();
  }, 5000);
}

function addLog(logText, imageUrl) {
  const diceLog = document.getElementById("diceLog");
  
  // Create diceLog if it doesn't exist
  if (!diceLog) {
    const newDiceLog = document.createElement("div");
    newDiceLog.id = "diceLog";
    document.body.appendChild(newDiceLog);
  }
  
  const logEntry = document.createElement("div");
  let pTag = document.createElement("p");
  logEntry.className = "logEntry";
  pTag.textContent = logText;
  pTag.style.display = "inline";
  logEntry.appendChild(pTag);
  
  if(imageUrl){
    let aTag = document.createElement("a");
    aTag.target = "_blank";
    aTag.href = imageUrl;
    aTag.textContent = imageUrl;
    aTag.style.display = "inline";
    aTag.style.color = "white";
    logEntry.appendChild(aTag);
  }
  
  // Get the dice log container again (in case it was just created)
  const diceLogElement = document.getElementById("diceLog");
  
  // Append the new log entry to the log
  diceLogElement.insertAdjacentElement("beforeend", logEntry);
  diceLogElement.scrollTop = diceLogElement.scrollHeight;
  diceLogElement.style.display = "block";
}

function readActionJsonFiles() {
  const filePath = "Actions/EasyActions.json";
  const filePathM = "Actions/MediumActions.json";
  const filePathH = "Actions/HardActions.json";
  const options = {
    method: "GET",
    mode: "no-cors",
  };

  // Fetch the JSON file
  fetch(filePath, options)
    .then((response) => response.json())
    .then((jsonData) => {
      console.log("JSON data:", jsonData);
      easyActionsJson = jsonData;
    })
    .catch((error) => console.error("Error fetching JSON:", error));

  fetch(filePathM, options)
    .then((response) => response.json())
    .then((jsonData) => {
      console.log("JSON data:", jsonData);
      mediumActionsJson = jsonData;
    })
    .catch((error) => console.error("Error fetching JSON:", error));

  fetch(filePathH, options)
    .then((response) => response.json())
    .then((jsonData) => {
      console.log("JSON data:", jsonData);
      hardActionsJson = jsonData;
    })
    .catch((error) => console.error("Error fetching JSON:", error));
}



