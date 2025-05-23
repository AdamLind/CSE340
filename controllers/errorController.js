const triggerError = (req, res, next) => {
  // Simulate a server error
  throw new Error("This is a simulated server error!")
}

module.exports = { triggerError }
