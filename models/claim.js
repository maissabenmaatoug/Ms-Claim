const mongoose = require('mongoose')

const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: true,
    unique: true,
  },
  occurrenceDate: {
    type: Date,
    required: true,
  },
  reportingDate: {
    type: Date,
    required: true,
  },
  reportingType: {
    type: String,
    enum: ['FirstPartyClaim', 'ThirdPartyClaim'],
    required: true,
  },
  responsability: {
    type: String,
    enum: [
      'FullResponsibility',
      'PartialResponsibility',
      'NoResponsibility',
      'UnderInvestigation',
    ],
    required: true,
  },
  damageType: {
    type: String,
    enum: ['MaterialDamage', 'BodilyInjury'],
    required: true,
  },
  daaq: {
    type: String,
  },
  flagFraud: {
    type: Boolean,
  },

  status: {
    type: String,
    enum: [
      'OPEN',
      'AWAITING_ASSIGNMENT',
      'AWAITING_INSPECTION',
      'AWAITING_DOCUMENTATION',
      'UNDER_REVIEW',
      'AWAITING_EXPERT_ASSESSMENT',
      'AWAITING_GARAGE_ASSESSMENT',
      'AWAITING_PHOTO_EVIDENCE',
      'AWAITING_EXPERT_REPORT',
      'PENDING_APPROVAL',
      'SETTLED',
      'CLOSED',
    ],
    required: true,
    default: 'OPEN',
  },
  claimAmount: {
    type: Number,
    required: true,
  },
  recourseAmount: {
    type: Number,
    default: 0,
  },
  inspectionMissions: [{ type: mongoose.Schema.Types.ObjectId }],
  affectedCoverages: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'affectedCoverage' },
  ],
  reportingAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agency',
    required: true,
  },
  involvedParties: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'involvedParty' },
  ],
  involvedCars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'involvedCar' }],
  involvedPolicies: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'involvedPolicy' },
  ],
})

module.exports = mongoose.model('claim', claimSchema)
