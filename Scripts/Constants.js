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
const colorMapForLinkImage = {
  1: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  2: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  3: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  4: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  5: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  6: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  7: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  8: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  9: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  10: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  11: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  12: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  13: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  14: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  15: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  16: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  17: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  18: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  19: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  20: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  21: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  22: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  23: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  24: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  25: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  26: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  27: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  28: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  29: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  30: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  31: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
  32: "https://scryfall.com/card/jmp/278/sheoldred-whispering-one",
};

// Define probability ranges for slecting the color at beginning of game
const colorRange = [
  { range: [1, 5], probability: 20 }, // 1-5: 20% probability
  { range: [6, 15], probability: 30 }, // 6-15: 30% probability
  { range: [16, 25], probability: 40 }, // 16-25: 40% probability
  { range: [26, 30], probability: 7 }, // 26-27: 7% probability
  { range: [31, 32], probability: 3 }, // 26-27: 3% probability
];
