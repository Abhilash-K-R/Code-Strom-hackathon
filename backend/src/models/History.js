const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: String,
      default: () => 'Today',
    },
    time: {
      type: String,
      required: true,
      default: '09:00 AM',
    },
    slot: {
      type: String,
      default: 'Morning Medicines',
    },
    medicines: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['TAKEN', 'LATE', 'MISSED'],
      default: 'TAKEN',
    },
    takenAt: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Format output for JSON
historySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('History', historySchema);
