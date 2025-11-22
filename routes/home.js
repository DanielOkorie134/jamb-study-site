const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');

// GET /
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().sort('name');
    
    let continueStudying = null;
    let overallProgress = 0;

    if (req.session.userId) {
      // Get last accessed topic
      const lastProgress = await Progress.findOne({ user: req.session.userId })
        .sort('-lastAccessed')
        .populate('topic')
        .populate({
          path: 'topic',
          populate: { path: 'subject' }
        });

      if (lastProgress && lastProgress.topic) {
        continueStudying = {
          topic: lastProgress.topic,
          subject: lastProgress.topic.subject
        };
      }

      // Calculate overall progress
      const totalTopics = await Topic.countDocuments();
      const completedTopics = await Progress.countDocuments({
        user: req.session.userId,
        completed: true
      });
      
      overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    }

    res.render('home', {
      title: 'JAMB Study Hub',
      subjects,
      continueStudying,
      overallProgress
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

module.exports = router;
