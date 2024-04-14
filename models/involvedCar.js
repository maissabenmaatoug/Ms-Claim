const mongoose = require('mongoose')

const involvedCarSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['INSURED_CAR', 'ADVERSE_CAR'],
    required: true,
  },
  goodUid: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('involvedCar', involvedCarSchema)
