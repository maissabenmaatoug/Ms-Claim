const mongoose = require('mongoose')

const involvedPartySchema = new mongoose.Schema({
  role: {
    type: String,
    enum: [
      'Pedestrian',
      'InsuredDriver',
      'AdverseDriver',
      'Passenger',
      'Witness',
      'Garage',
      'Inspector',
      'Agent',
    ],
    required: true,
  },
  partyUid: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('involvedParty', involvedPartySchema)
