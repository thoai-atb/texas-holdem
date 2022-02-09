function generateBotName() {
  var name = "Bot ";
  var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var numbers = "0123456789";

  name += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 2; i++)
    name += numbers.charAt(Math.floor(Math.random() * numbers.length));

  return name;
}

module.exports = {
  generateBotName,
};
