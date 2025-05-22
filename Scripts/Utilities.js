// Make the refreshPage function globally available
window.refreshPage = function() {
  location.reload();
};

function strikeOutMonsterAction() {
  if (!window.startedGame) {
    showErrorMessage("Please Start the Game First");
    return;
  }
  
  // Strike out the action display
  const actionElement = document.getElementById("action");
  if (actionElement) {
    actionElement.style.textDecoration = "line-through";
  }
  
  // Strike out the most recent log entry that matches the current action
  const diceLog = document.getElementById("diceLog");
  if (!diceLog) {
    console.error("Dice log element not found");
    return;
  }
  
  const logEntries = diceLog.getElementsByClassName("logEntry");
  // Use the already declared actionElement variable
  const currentAction = actionElement ? actionElement.innerText : "";

  // Check if there are log entries
  if (logEntries.length > 0) {
    // Find and strike out the most recent log entry that contains the action
    for (let i = logEntries.length - 1; i >= 0; i--) {
      const entry = logEntries[i];
      if (
        entry && 
        !entry.innerText.includes("ROUND") &&
        !entry.innerText.includes("HP") &&
        entry.innerText.includes(currentAction.substring(0, 30)) // Match first part of action
      ) {
        entry.style.textDecoration = "line-through";
        break; // Stop after striking out the first matching entry
      }
    }
  }
}

function removeImage(img) {
  const container = img.parentNode;
  container.removeChild(img);
}

// Remove duplicate showErrorMessage - use the one from Logging.js instead
// function showErrorMessage(message) {
//   // Create a new error message element
//   const errorMessageElement = document.createElement("div");
//   errorMessageElement.className = "errorMessage";
//   errorMessageElement.textContent = message;
//
//   // Append the error message element to the body
//   document.body.appendChild(errorMessageElement);
//
//   // Display the error message
//   errorMessageElement.style.display = "block";
//
//   // Hide the error message after 5 seconds
//   setTimeout(function () {
//     errorMessageElement.style.display = "none";
//     // Remove the error message element from the DOM after fading out
//     errorMessageElement.remove();
//   }, 5000);
// }

// Remove duplicate readActionJsonFiles - use the one from MTGRaidBase.js instead
// function readActionJsonFiles() {
//   const filePath = "Actions/EasyActions.json";
//   const filePathM = "Actions/MediumActions.json";
//   const filePathH = "Actions/HardActions.json";
//   const options = {
//     method: "GET",
//     mode: "no-cors",
//   };
//
//   // Fetch the JSON file
//   fetch(filePath, options)
//     .then((response) => response.json())
//     .then((jsonData) => {
//       console.log("JSON data:", jsonData);
//       easyActionsJson = jsonData;
//     })
//     .catch((error) => console.error("Error fetching JSON:", error));
//
//   fetch(filePathM, options)
//     .then((response) => response.json())
//     .then((jsonData) => {
//       console.log("JSON data:", jsonData);
//       mediumActionsJson = jsonData;
//     })
//     .catch((error) => console.error("Error fetching JSON:", error));
//
//   fetch(filePathH, options)
//     .then((response) => response.json())
//     .then((jsonData) => {
//       console.log("JSON data:", jsonData);
//       hardActionsJson = jsonData;
//     })
//     .catch((error) => console.error("Error fetching JSON:", error));
// }

// Make strikeOutMonsterAction globally available
window.strikeOutMonsterAction = strikeOutMonsterAction;
window.removeImage = removeImage;





