const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Score = require('../models/Score');
const { requireAuth } = require('../middleware/auth');

// GET /mock-exam
router.get('/', requireAuth, async (req, res) => {
  try {
    const subjects = await Subject.find().sort('name');
    res.render('mockExam', {
      title: 'Mock Exam',
      subjects
    });
  } catch (error) {
    console.error('Mock exam page error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

// GET /mock-exam/:slug
router.get('/:slug', requireAuth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    
    if (!subject) {
      return res.status(404).render('404', { title: 'Subject Not Found' });
    }

    // Get all topics for this subject
    const topics = await Topic.find({ subject: subject._id });

    // Collect all exercises and past questions
    let questions = [];
    topics.forEach(topic => {
      // Add exercises
      topic.exercises.forEach((exercise, index) => {
        questions.push({
          _id: `${topic._id}_ex_${index}`,
          topicId: topic._id,
          topicTitle: topic.title,
          question: exercise.question,
          options: exercise.options,
          correctAnswer: exercise.correctAnswer,
          explanation: exercise.explanation,
          type: 'exercise'
        });
      });

      // Add past questions
      topic.pastQuestions.forEach((pq, index) => {
        questions.push({
          _id: `${topic._id}_pq_${index}`,
          topicId: topic._id,
          topicTitle: topic.title,
          question: pq.question,
          options: pq.options,
          correctAnswer: pq.correctAnswer,
          explanation: pq.explanation,
          type: 'past',
          year: pq.year
        });
      });
    });

    // Shuffle and select 40 questions (typical JAMB format)
    questions = questions.sort(() => Math.random() - 0.5).slice(0, 40);

    res.render('mockExamStart', {
      title: `${subject.name} Mock Exam`,
      subject,
      questions,
      duration: 60 // 60 minutes
    });
  } catch (error) {
    console.error('Mock exam start error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

// POST /mock-exam/:slug/submit
router.post('/:slug/submit', requireAuth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const { answers, timeSpent, questions } = req.body;

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided' });
    }

    // Grade the exam
    let score = 0;
    const detailedAnswers = [];

    questions.forEach((question, index) => {
      const userAnswer = parseInt(answers[index]);
      const correctAnswer = parseInt(question.correctAnswer);
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) score++;

      detailedAnswers.push({
        questionId: question._id,
        userAnswer: isNaN(userAnswer) ? -1 : userAnswer,
        correctAnswer,
        isCorrect
      });
    });

    const percentage = Math.round((score / questions.length) * 100);

    // Save score
    const scoreDoc = new Score({
      user: req.session.userId,
      subject: subject._id,
      score,
      totalQuestions: questions.length,
      percentage,
      answers: detailedAnswers,
      timeSpent: parseInt(timeSpent) || 0
    });

    await scoreDoc.save();

    res.json({ 
      success: true, 
      scoreId: scoreDoc._id,
      score,
      totalQuestions: questions.length,
      percentage
    });
  } catch (error) {
    console.error('Mock exam submit error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'An error occurred while submitting your exam',
      details: error.message 
    });
  }
});

// GET /mock-exam/results/:scoreId
router.get('/results/:scoreId', requireAuth, async (req, res) => {
  try {
    const score = await Score.findById(req.params.scoreId)
      .populate('subject')
      .populate('user');

    if (!score || score.user._id.toString() !== req.session.userId.toString()) {
      return res.status(404).render('404', { title: 'Results Not Found' });
    }

    // Get the questions again to show details
    const topics = await Topic.find({ subject: score.subject._id });
    
    // Rebuild questions array
    let allQuestions = [];
    topics.forEach(topic => {
      topic.exercises.forEach((exercise, index) => {
        allQuestions.push({
          _id: `${topic._id}_ex_${index}`,
          topicId: topic._id,
          topicTitle: topic.title,
          question: exercise.question,
          options: exercise.options,
          correctAnswer: exercise.correctAnswer,
          explanation: exercise.explanation
        });
      });

      topic.pastQuestions.forEach((pq, index) => {
        allQuestions.push({
          _id: `${topic._id}_pq_${index}`,
          topicId: topic._id,
          topicTitle: topic.title,
          question: pq.question,
          options: pq.options,
          correctAnswer: pq.correctAnswer,
          explanation: pq.explanation,
          year: pq.year
        });
      });
    });

    // Match questions with answers
    const questionsWithAnswers = score.answers.map(answer => {
      const question = allQuestions.find(q => q._id === answer.questionId);
      return {
        ...question,
        userAnswer: answer.userAnswer,
        isCorrect: answer.isCorrect
      };
    });

    // Analyze strengths and weaknesses
    const topicPerformance = {};
    questionsWithAnswers.forEach(q => {
      if (!topicPerformance[q.topicTitle]) {
        topicPerformance[q.topicTitle] = { correct: 0, total: 0 };
      }
      topicPerformance[q.topicTitle].total++;
      if (q.isCorrect) topicPerformance[q.topicTitle].correct++;
    });

    const strengths = [];
    const weaknesses = [];

    Object.entries(topicPerformance).forEach(([topic, perf]) => {
      const percentage = (perf.correct / perf.total) * 100;
      if (percentage >= 70) {
        strengths.push({ topic, percentage: Math.round(percentage) });
      } else if (percentage < 50) {
        weaknesses.push({ topic, percentage: Math.round(percentage) });
      }
    });

    res.render('mockResults', {
      title: 'Exam Results',
      score,
      questions: questionsWithAnswers,
      strengths,
      weaknesses
    });
  } catch (error) {
    console.error('Mock results error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

module.exports = router;
