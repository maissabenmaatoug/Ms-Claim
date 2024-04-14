const mongoose = require('mongoose')

const affectedCoverageSchema = new mongoose.Schema({
  evaluation: {
    type: Number,
    required: true,
  },
  settledAmount: {
    type: Number,
    default: 0,
  },
  claim: { type: mongoose.Schema.Types.ObjectId, ref: 'claim' },
  coverage: { type: mongoose.Schema.Types.ObjectId, ref: 'coverage' },
})

module.exports = mongoose.model('affectedCoverage', affectedCoverageSchema)
