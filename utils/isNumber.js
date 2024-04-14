const isNumber = (value) => {
  const parsedValue = parseFloat(value)
  return (
    !isNaN(parsedValue) &&
    isFinite(parsedValue) &&
    parsedValue >= 0 &&
    parsedValue.toString() === value.toString()
  )
}

module.exports = isNumber
