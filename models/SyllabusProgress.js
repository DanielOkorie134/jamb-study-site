const mongoose = require('mongoose');

const syllabusProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  syllabusSection: {
    type: String,
    required: true
  },
  syllabusItem: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one record per user/subject/section/item combination
syllabusProgressSchema.index({ 
  user: 1, 
  subject: 1, 
  syllabusSection: 1, 
  syllabusItem: 1 
}, { unique: true });

module.exports = mongoose.model('SyllabusProgress', syllabusProgressSchema);
