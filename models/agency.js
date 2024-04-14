const mongoose = require('mongoose')

const agencySchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    label: { type: String, unique: true },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
)

module.exports = mongoose.model('agency', agencySchema)
