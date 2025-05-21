// Logging functions
let log = [];

function addLog(message, imageUrl) {
  const diceLog = document.getElementById("diceLog");
  if (!diceLog) {
    console.error("Dice log element not found!");
    return;
  }
  
  const logEntry = document.createElement("div");
  logEntry.className = "logEntry";
  
  if (imageUrl) {
    // If an image URL is provided, create a clickable image link
    const logText = document.createElement("span");
    logText.innerText = message;
    logEntry.appendChild(logText);
    
    const imageLink = document.createElement("a");
    imageLink.href = "#";
    imageLink.onclick = function(e) {
      e.preventDefault();
      openPopup(imageUrl);
    };
    
    const imageIcon = document.createElement("img");
    imageIcon.src = "card-icon.png"; // You'll need to add this icon to your project
    imageIcon.alt = "Card";
    imageIcon.className = "card-icon";
    imageIcon.style.width = "16px";
    imageIcon.style.height = "16px";
    imageIcon.style.marginLeft = "5px";
    
    imageLink.appendChild(imageIcon);
    logEntry.appendChild(imageLink);
  } else {
    // Just add the text message
    logEntry.innerText = message;
  }
  
  diceLog.appendChild(logEntry);
  diceLog.scrollTop = diceLog.scrollHeight; // Auto-scroll to bottom
  
  // Also store in log array
  log.push(message);
  
  console.log(message); // Also log to console for debugging
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