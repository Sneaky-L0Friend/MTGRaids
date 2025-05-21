window.startedGame = false;
window.easyActionsJson;
window.mediumActionsJson;
window.hardActionsJson;

const EASY_MODE_MODIFIERS = {
  modifier1: 10,
  modifier2: 1,
  modifier3: 0.8, // Must be between 0-1
};
// Difficulty modifiers for medium mode
const MEDIUM_MODE_MODIFIERS = {
  modifier1: 5,
  modifier2: 2,
  modifier3: 0.6, // Must be between 0-1
};
// Difficulty modifiers for hard mode
const HARD_MODE_MODIFIERS = {
  modifier1: 0,
  modifier2: 10,
  modifier3: 0, // Must be between 0-1
};

const colorMap = {
  1: "White",
  2: "Blue",
  3: "Black",
  4: "Red",
  5: "Green",
  6: "White-Blue",
  7: "Blue-Black",
  8: "Black-Red",
  9: "Red-Green",
  10: "White-Green",
  11: "White-Black",
  12: "Blue-Red",
  13: "Black-Green",
  14: "Red-White",
  15: "Blue-Green",
  16: "White-Blue-Black",
  17: "Blue-Black-Red",
  18: "Black-Red-Green",
  19: "Red-Green-White",
  20: "White-Green-Blue",
  21: "White-Black-Green",
  22: "Blue-Red-White",
  23: "Black-Green-Blue",
  24: "Red-White-Black",
  25: "Green-Blue-Red",
  26: "Blue-Black-Red-Green",
  27: "White-Black-Red-Green",
  28: "White-Blue-Red-Green",
  29: "White-Blue-Black-Green",
  30: "White-Blue-Black-Red",
  31: "White-Blue-Black-Green-Red",
  32: "Grey",
};
const scryfallColorMap = {
  1: "W",
  2: "U",
  3: "B",
  4: "R",
  5: "G",
  6: "WU",
  7: "UB",
  8: "BR",
  9: "RG",
  10: "WG",
  11: "WB",
  12: "UR",
  13: "BG",
  14: "RW",
  15: "UG",
  16: "WUB",
  17: "UBR",
  18: "BRG",
  19: "RGW",
  20: "WGU",
  21: "WBG",
  22: "URW",
  23: "BGU",
  24: "RWB",
  25: "GUR",
  26: "UBRG",
  27: "WBRG",
  28: "WURG",
  29: "WUBG",
  30: "WUBR",
  31: "WUBRG",
  32: "C",
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

// Define probability ranges for slecting the color at beginning of game
const colorRange = [
  { range: [1, 5], probability: 20 }, // 1-5: 20% probability
  { range: [6, 15], probability: 30 }, // 6-15: 30% probability
  { range: [16, 25], probability: 40 }, // 16-25: 40% probability
  { range: [26, 30], probability: 7 }, // 26-27: 7% probability
  { range: [31, 32], probability: 3 }, // 26-27: 3% probability
];

// Version information
const APP_VERSION = "1.0.06";

// Initialize version display when the page loads
document.addEventListener("DOMContentLoaded", function() {
  // Set the version number in the UI
  const versionElement = document.getElementById("versionInfo");
  if (versionElement) {
    versionElement.textContent = `v${APP_VERSION}`;
  }
});




