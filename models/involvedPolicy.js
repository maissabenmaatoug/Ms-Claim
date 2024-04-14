const mongoose = require('mongoose')

const involvedPolicySchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['InsuredPolicy', 'AdversePolicy'],
    required: true,
  },
  goodUid: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('involvedPolicy', involvedPolicySchema)
