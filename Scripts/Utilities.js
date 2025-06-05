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
        !entry.innerText.includes("TURN") &&
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

window.strikeOutMonsterAction = strikeOutMonsterAction;
window.removeImage = removeImage;





