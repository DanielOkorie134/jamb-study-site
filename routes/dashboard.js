const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const Score = require('../models/Score');
const { requireAuth } = require('../middleware/auth');

// GET /dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const subjects = await Subject.find().sort('name');
    
    // Calculate progress per subject
    const subjectProgress = [];
    
    for (const subject of subjects) {
      const topics = await Topic.find({ subject: subject._id });
      const topicIds = topics.map(t => t._id);
      
      const completedCount = await Progress.countDocuments({
        user: req.session.userId,
        topic: { $in: topicIds },
        completed: true
      });

      const percentage = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

      subjectProgress.push({
        subject: subject.name,
        slug: subject.slug,
        color: subject.color,
        total: topics.length,
        completed: completedCount,
        percentage
      });
    }

    // Get overall progress
    const totalTopics = await Topic.countDocuments();
    const totalCompleted = await Progress.countDocuments({
      user: req.session.userId,
      completed: true
    });
    const overallProgress = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

    // Get recent scores
    const recentScores = await Score.find({ user: req.session.userId })
      .populate('subject')
      .sort('-completedAt')
      .limit(5);

    // Calculate strengths and weaknesses from all scores
    const allScores = await Score.find({ user: req.session.userId }).populate('subject');
    
    const subjectPerformance = {};
    allScores.forEach(score => {
      const subjectName = score.subject.name;
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = { total: 0, sum: 0 };
      }
      subjectPerformance[subjectName].total++;
      subjectPerformance[subjectName].sum += score.percentage;
    });

    const strengths = [];
    const weaknesses = [];

    Object.entries(subjectPerformance).forEach(([subject, perf]) => {
      const avgPercentage = Math.round(perf.sum / perf.total);
      if (avgPercentage >= 70) {
        strengths.push({ subject, percentage: avgPercentage });
      } else if (avgPercentage < 50) {
        weaknesses.push({ subject, percentage: avgPercentage });
      }
    });

    // Get suggested next topics (incomplete topics from weakest subjects)
    const suggestedTopics = [];
    
    for (const subject of subjects) {
      const topics = await Topic.find({ subject: subject._id }).sort('order').limit(3);
      
      for (const topic of topics) {
        const progress = await Progress.findOne({
          user: req.session.userId,
          topic: topic._id
        });

        if (!progress || !progress.completed) {
          suggestedTopics.push({
            topic: topic.title,
            subject: subject.name,
            topicId: topic._id,
            slug: subject.slug
          });
          
          if (suggestedTopics.length >= 5) break;
        }
      }
      
      if (suggestedTopics.length >= 5) break;
    }

    // Get recent activity
    const recentActivity = await Progress.find({ user: req.session.userId })
      .populate('topic')
      .sort('-lastAccessed')
      .limit(10);

    res.render('dashboard', {
      title: 'Dashboard',
      subjectProgress,
      overallProgress,
      recentScores,
      strengths,
      weaknesses,
      suggestedTopics,
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

module.exports = router;
