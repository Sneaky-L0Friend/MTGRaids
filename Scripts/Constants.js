// Version information
const APP_VERSION = "1.0.15";

// Initialize global variables
window.easyActionsJson = null;
window.mediumActionsJson = null;
window.hardActionsJson = null;
window.startedGame = false;

const EASY_MODE_MODIFIERS = {
  healthMultiplier: 20,
  // Add other modifiers as needed
};
const MEDIUM_MODE_MODIFIERS = {
  healthMultiplier: 25,
  // Add other modifiers as needed
};
const HARD_MODE_MODIFIERS = {
  healthMultiplier: 30,
  // Add other modifiers as needed
};

const colorMap = {
  1: "white",
  2: "blue",
  3: "black",
  4: "red",
  5: "green",
  6: "white-blue",
  7: "blue-black",
  8: "black-red",
  9: "red-green",
  10: "green-white",
  11: "white-black",
  12: "blue-red",
  13: "black-green",
  14: "red-white",
  15: "green-blue",
  16: "white-blue-black",
  17: "blue-black-red",
  18: "black-red-green",
  19: "red-green-white",
  20: "green-white-blue",
  21: "white-black-green",
  22: "blue-red-white",
  23: "black-green-blue",
  24: "red-white-black",
  25: "green-blue-red",
  26: "white-blue-black-red-green",
  // Add more mappings as needed
};
const scryfallColorMap = {
  1: "w", // White
  2: "u", // Blue
  3: "b", // Black
  4: "r", // Red
  5: "g", // Green
  6: "wu", // Azorius
  7: "ub", // Dimir
  8: "br", // Rakdos
  9: "rg", // Gruul
  10: "gw", // Selesnya
  11: "wb", // Orzhov
  12: "ur", // Izzet
  13: "bg", // Golgari
  14: "rw", // Boros
  15: "gu", // Simic
  16: "wub", // Esper
  17: "ubr", // Grixis
  18: "brg", // Jund
  19: "rgw", // Naya
  20: "gwu", // Bant
  21: "wbg", // Abzan
  22: "urw", // Jeskai
  23: "bgu", // Sultai
  24: "rwb", // Mardu
  25: "gur", // Temur
  26: "wubrg", // Five-color
  // Add more mappings as needed
};
const colorMapForLinkImage = {
  1: "https://scryfall.com/search?q=commander%3Aw",
  2: "https://scryfall.com/search?q=commander%3Au",
  3: "https://scryfall.com/search?q=commander%3Ab",
  4: "https://scryfall.com/search?q=commander%3Ar",
  5: "https://scryfall.com/search?q=commander%3Ag",
  6: "https://scryfall.com/search?q=commander%3Awu",
  7: "https://scryfall.com/search?q=commander%3Aub",
  8: "https://scryfall.com/search?q=commander%3Abr",
  9: "https://scryfall.com/search?q=commander%3Arg",
  10: "https://scryfall.com/search?q=commander%3Agw",
  11: "https://scryfall.com/search?q=commander%3Awb",
  12: "https://scryfall.com/search?q=commander%3Aur",
  13: "https://scryfall.com/search?q=commander%3Abg",
  14: "https://scryfall.com/search?q=commander%3Arw",
  15: "https://scryfall.com/search?q=commander%3Agu",
  16: "https://scryfall.com/search?q=commander%3Awub",
  17: "https://scryfall.com/search?q=commander%3Aubr",
  18: "https://scryfall.com/search?q=commander%3Abrg",
  19: "https://scryfall.com/search?q=commander%3Argw",
  20: "https://scryfall.com/search?q=commander%3Agwu",
  21: "https://scryfall.com/search?q=commander%3Awbg",
  22: "https://scryfall.com/search?q=commander%3Aurw",
  23: "https://scryfall.com/search?q=commander%3Abgu",
  24: "https://scryfall.com/search?q=commander%3Arwb",
  25: "https://scryfall.com/search?q=commander%3Agur",
  26: "https://scryfall.com/search?q=commander%3Awubrg",
};

// Define color range for monster selection
const colorRange = [
  { range: [1, 5], probability: 30 }, // Single colors
  { range: [6, 15], probability: 30 }, // Two colors
  { range: [16, 25], probability: 30 }, // Three colors
  { range: [26, 26], probability: 10 }, // Five colors
];

// Initialize version display when the page loads
document.addEventListener("DOMContentLoaded", function() {
  // Set the version number in the UI
  const versionElement = document.getElementById("versionInfo");
  if (versionElement) {
    versionElement.textContent = `v${APP_VERSION}`;
  }
});











