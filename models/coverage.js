const mongoose = require('mongoose')
const CoverageSchema = new mongoose.Schema(
  {
    uid: { type: String, unique: true },
    code: { type: String, unique: true },
    label: { type: String },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
)

module.exports = mongoose.model('coverage', CoverageSchema)
