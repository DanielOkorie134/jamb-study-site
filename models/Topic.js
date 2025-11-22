const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  detailedNotes: {
    type: String,
    required: true
  },
  examples: [{
    title: String,
    content: String,
    solution: String
  }],
  exercises: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  pastQuestions: [{
    year: Number,
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for subject and slug
topicSchema.index({ subject: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
