const names = require("../assets/first-names.json");
const greetings = require("../assets/greetings.json");

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

function getRandomGreetings() {
  var message = "";
  var random = Math.floor(Math.random() * greetings.length);
  message += greetings[random];
  return message;
}

module.exports = {
  generateBotName,
  getRandomGreetings,
};
