const names = require("../assets/first-names.json");
const greetingPhrases = require("../assets/greeting-phrases.json");
const foldPhrases = require("../assets/fold-phrases.json");
const winPhrases = require("../assets/win-phrases.json");
const randomPhrases = require("../assets/random-phrases.json");
const betPhrases = require("../assets/bet-phrases.json");
const raisePhrases = require("../assets/raise-phrases.json");

function generateBotNameDeprecated() {
  var name = "Bot ";
  var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var numbers = "0123456789";

  name += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 2; i++)
    name += numbers.charAt(Math.floor(Math.random() * numbers.length));

  return name;
}

function generateBotName() {
  var name = "";
  var random = Math.floor(Math.random() * names.length);
  name += names[random];
  return name;
}

function getRandomPhrasesIn(phraseCollection) {
  var random = Math.floor(Math.random() * phraseCollection.length);
  return phraseCollection[random];
}

function getRandomPhrase(collectionName) {
  if (collectionName === "greeting-phrases")
    return getRandomPhrasesIn(greetingPhrases);
  else if (collectionName === "fold-phrases")
    return getRandomPhrasesIn(foldPhrases);
  else if (collectionName === "win-phrases")
    return getRandomPhrasesIn(winPhrases);
  else if (collectionName === "bet-phrases")
    return getRandomPhrasesIn(betPhrases);
  else if (collectionName === "raise-phrases")
    return getRandomPhrasesIn(raisePhrases);
  return getRandomPhrasesIn(randomPhrases);
}

module.exports = {
  generateBotName,
  getRandomPhrase,
};
