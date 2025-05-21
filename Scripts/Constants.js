// Version information
const APP_VERSION = "1.0.19";

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
  // Four-color combinations
  26: "white-blue-black-red", // Not-Green (Artifice)
  27: "blue-black-red-green", // Not-White (Chaos)
  28: "black-red-green-white", // Not-Blue (Aggression)
  29: "red-green-white-blue", // Not-Black (Altruism)
  30: "green-white-blue-black", // Not-Red (Growth)
  // Five-color
  31: "white-blue-black-red-green",
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
  // Four-color combinations
  26: "wubr", // Not-Green (Artifice)
  27: "ubrg", // Not-White (Chaos)
  28: "brgw", // Not-Blue (Aggression)
  29: "rgwu", // Not-Black (Altruism)
  30: "gwub", // Not-Red (Growth)
  // Five-color
  31: "wubrg", // Five-color
};
const colorMapForLinkImage = {
  1: "https://scryfall.com/card/one/10/elesh-norn-mother-of-machines",
  2: "https://scryfall.com/card/ima/62/jin-gitaxias-core-augur",
  3: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  4: "https://scryfall.com/card/mom/169/urabrask-the-great-work",
  5: "https://scryfall.com/card/mom/213/vorinclex-the-grand-evolution",
  6: "https://scryfall.com/card/bro/238b/urza-planeswalker",
  7: "https://scryfall.com/card/ltc/60/lord-of-the-nazg%C3%BBl",
  8: "https://scryfall.com/card/clu/205/rakdos-the-showstopper",
  9: "https://scryfall.com/card/bng/156/xenagos-god-of-revels",
  10: "https://scryfall.com/card/clb/275/gluntch-the-bestower",
  11: "https://scryfall.com/card/woe/202/eriette-of-the-charmed-apple",
  12: "https://scryfall.com/card/war/208/niv-mizzet-reborn",
  13: "https://scryfall.com/card/ltr/230/shelob-child-of-ungoliant",
  14: "https://scryfall.com/card/mat/36/nahiri-forged-in-fury",
  15: "https://scryfall.com/card/mat/35/kiora-sovereign-of-the-deep",
  16: "https://scryfall.com/card/cmm/363/yennett-cryptic-sovereign",
  17: "https://scryfall.com/card/cmm/349/nekusar-the-mindrazer",
  18: "https://scryfall.com/card/ncc/6/the-beamtown-bullies",
  19: "https://scryfall.com/card/xln/222/gishath-suns-avatar",
  20: "https://scryfall.com/card/me1/150/phelddagrif",
  21: "https://scryfall.com/card/onc/1/ixhel-scion-of-atraxa",
  22: "https://scryfall.com/card/bot/13/optimus-prime-hero-optimus-prime-autobot-leader",
  23: "https://scryfall.com/card/cmd/210/the-mimeoplasm",
  24: "https://scryfall.com/card/c17/36/edgar-markov",
  25: "https://scryfall.com/card/rex/16/owen-grady-raptor-trainer",
  26: "https://scryfall.com/card/c16/50/yidris-maelstrom-wielder",
  27: "https://scryfall.com/card/gpt/110/dune-brood-nephilim",
  28: "https://scryfall.com/card/otc/236/omnath-locus-of-rage",
  29: "https://scryfall.com/card/2xm/190/atraxa-praetors-voice",
  30: "https://scryfall.com/card/2xm/192/breya-etherium-shaper",
  31: "https://scryfall.com/card/cmm/361/the-ur-dragon",
  32: "https://scryfall.com/card/emn/6/emrakul-the-promised-end",
};

// Define color range for monster selection
const colorRange = [
  { range: [1, 5], probability: 25 },   // Single colors
  { range: [6, 15], probability: 25 },  // Two colors
  { range: [16, 25], probability: 25 }, // Three colors
  { range: [26, 30], probability: 15 }, // Four colors
  { range: [31, 31], probability: 10 }, // Five colors
];

// Initialize version display when the page loads
document.addEventListener("DOMContentLoaded", function() {
  // Set the version number in the UI
  const versionElement = document.getElementById("versionInfo");
  if (versionElement) {
    versionElement.textContent = `v${APP_VERSION}`;
  }
});













