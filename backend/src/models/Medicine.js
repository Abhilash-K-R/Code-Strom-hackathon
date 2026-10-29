const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      default: '',
      trim: true,
    },
    kannadaName: {
      type: String,
      default: '',
      trim: true,
    },
    timing: {
      type: String,
      default: 'After Food',
    },
    dosage: {
      type: String,
      default: '1 Tablet',
    },
    color: {
      type: String,
      default: '#0D9488',
    },
    photo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    },
    slotTime: {
      type: String,
      default: '09:00 AM',
    },
    slotLabel: {
      type: String,
      default: 'Morning Medicines',
    },
    slotId: {
      type: String,
      default: 'slot-morning',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'PENDING', 'TAKEN'],
      default: 'SCHEDULED',
    },
  },
  {
    timestamps: true,
  }
);

// Format output for JSON
medicineSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Medicine', medicineSchema);
