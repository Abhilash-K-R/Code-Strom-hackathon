const mongoose = require('mongoose');

const doseEscalationSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    slotId: {
      type: String,
      required: true,
    },
    slotLabel: {
      type: String,
      default: 'Morning Medicines',
    },
    medicines: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true, // e.g. "09:00 AM"
    },
    escalateAtEpoch: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'TAKEN', 'ESCALATED', 'DISMISSED'],
      default: 'PENDING',
    },
    confirmedAt: {
      type: Date,
    },
    escalatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

doseEscalationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('DoseEscalation', doseEscalationSchema);
