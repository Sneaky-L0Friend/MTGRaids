window.startedGame = false;

function refreshPage() {
    location.reload();
  }

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
      if (!mostRecentLog.innerText.includes("ROUND") && !mostRecentLog.innerText.includes("HP")) {
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

  function addLog(logText) {
    const logEntry = document.createElement("div");
    logEntry.className = "logEntry";
    logEntry.textContent = logText;
  
    // Get the dice log container
    const diceLog = document.getElementById("diceLog");
  
    // Append the new log entry to the top of the log
    diceLog.insertAdjacentElement("beforeend", logEntry);
    diceLog.scrollTop = diceLog.scrollHeight;
    diceLog.style.display = "block";
  }