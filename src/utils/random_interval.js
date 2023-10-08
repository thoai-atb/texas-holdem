function setRandomInterval(intervalFunction, minDelay, maxDelay) {
  let outerFunction = () => {
    let delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    let timeout = setTimeout(outerFunction, delay)
    intervalFunction(timeout)
  }
  outerFunction()
}

// Zesta's idea to have chips playing sound effect
// if (config.Server.CHIPS_SOUND_EFFECT_RANDOM_INTERVAL > 0)
//   setRandomInterval(
//     () => {
//       io.sockets.emit("sound_effect", "chipsCollect");
//     },
//     1000,
//     config.Server.CHIPS_SOUND_EFFECT_RANDOM_INTERVAL
//   );

module.exports = { setRandomInterval };