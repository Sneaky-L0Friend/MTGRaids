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