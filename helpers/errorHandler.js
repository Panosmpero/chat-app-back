const handleError = (res, statusCode, message) => {
  res.status(statusCode).send({
    status: "error",
    statusCode,
    message
  })
}

module.exports = { handleError }
