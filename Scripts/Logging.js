// Logging functions
let log = [];

function addLog(message, imageUrl) {
  const diceLog = document.getElementById("diceLog");
  
  // Create log entry
  const logEntry = document.createElement("div");
  logEntry.className = "logEntry";
  
  if (imageUrl) {
    // First try to match the format with "CARDS LEFT"
    let regex = /(MONSTER (?:MILLED): )([^-]+) - ([^.]+)(. CARDS LEFT: \d+)/;
    let match = message.match(regex);
    
    // If no match, try the format without "CARDS LEFT" (for revealed cards)
    if (!match) {
      regex = /(MONSTER (?:REVEALED): )([^-]+) - (.+)/;
      match = message.match(regex);
    }
    
    if (match) {
      // Extract the parts
      const prefix = match[1];         // "MONSTER MILLED: " or "MONSTER REVEALED: "
      const cardType = match[2].trim(); // "Type"
      const cardName = match[3].trim(); // "CardName"
      const suffix = match[4] || "";   // ". CARDS LEFT: Count" or empty for revealed cards
      
      // Create the prefix + type
      const prefixSpan = document.createElement("span");
      prefixSpan.innerText = prefix + cardType + " - ";
      logEntry.appendChild(prefixSpan);
      
      // Create the card name as a clickable link
      const cardLink = document.createElement("a");
      cardLink.href = "#";
      cardLink.innerText = cardName;
      cardLink.style.color = "#4fc3f7";
      cardLink.style.textDecoration = "underline";
      cardLink.onclick = function(e) {
        e.preventDefault();
        openPopup(imageUrl);
      };
      logEntry.appendChild(cardLink);
      
      // Create the suffix (CARDS LEFT part) if it exists
      if (suffix) {
        const suffixSpan = document.createElement("span");
        suffixSpan.innerText = suffix;
        logEntry.appendChild(suffixSpan);
      }
    } else {
      // For other messages with images that don't match either format
      logEntry.innerText = message;
    }
  } else {
    // Just add the text message for entries without images
    logEntry.innerText = message;
  }
  
  diceLog.appendChild(logEntry);
  diceLog.scrollTop = diceLog.scrollHeight; // Auto-scroll to bottom
}

function clearLog() {
  const diceLog = document.getElementById("diceLog");
  if (diceLog) {
    diceLog.innerHTML = "";
  }
  log = [];
}

function showErrorMessage(message) {
  const errorElement = document.getElementById("errorMessage");
  if (!errorElement) {
    console.error("Error message element not found!");
    console.error(message);
    return;
  }
  
  errorElement.innerText = message;
  errorElement.style.display = "block";
  
  // Hide the error message after 3 seconds
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

// Make logging functions globally available
window.addLog = addLog;
window.clearLog = clearLog;
window.showErrorMessage = showErrorMessage;

















