const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');

// GET /subjects/:slug
router.get('/:slug', async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    
    if (!subject) {
      return res.status(404).render('404', { title: 'Subject Not Found' });
    }

    const topics = await Topic.find({ subject: subject._id }).sort('order');

    let progressData = [];
    let subjectProgress = 0;

    if (req.session.userId) {
      // Get progress for all topics in this subject
      const topicIds = topics.map(t => t._id);
      const userProgress = await Progress.find({
        user: req.session.userId,
        topic: { $in: topicIds }
      });

      // Create a map for quick lookup
      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.topic.toString()] = p.completed;
      });

      progressData = topics.map(topic => ({
        ...topic.toObject(),
        completed: progressMap[topic._id.toString()] || false
      }));

      // Calculate subject progress
      const completedCount = userProgress.filter(p => p.completed).length;
      subjectProgress = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;
    } else {
      progressData = topics.map(topic => ({
        ...topic.toObject(),
        completed: false
      }));
    }

    res.render('subject', {
      title: subject.name,
      subject,
      topics: progressData,
      subjectProgress
    });
  } catch (error) {
    console.error('Subject page error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

module.exports = router;
