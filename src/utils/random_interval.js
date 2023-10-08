function setRandomInterval(intervalFunction, minDelay, maxDelay) {
  let outerFunction = () => {
    let delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    let timeout = setTimeout(outerFunction, delay)
    intervalFunction(timeout)
  }
  outerFunction()
}

module.exports = { setRandomInterval };