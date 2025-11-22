const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const { requireAuth } = require('../middleware/auth');

// GET /topics/:id
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('subject');
    
    if (!topic) {
      return res.status(404).render('404', { title: 'Topic Not Found' });
    }

    let isCompleted = false;
    let progress = null;

    if (req.session.userId) {
      // Get or create progress
      progress = await Progress.findOne({
        user: req.session.userId,
        topic: topic._id
      });

      if (!progress) {
        progress = new Progress({
          user: req.session.userId,
          topic: topic._id
        });
        await progress.save();
      } else {
        // Update last accessed
        progress.lastAccessed = new Date();
        await progress.save();
      }

      isCompleted = progress.completed;
    }

    // Get previous and next topics
    const allTopics = await Topic.find({ subject: topic.subject._id }).sort('order');
    const currentIndex = allTopics.findIndex(t => t._id.toString() === topic._id.toString());
    
    const previousTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

    res.render('topic', {
      title: topic.title,
      topic,
      isCompleted,
      previousTopic,
      nextTopic
    });
  } catch (error) {
    console.error('Topic page error:', error);
    res.status(500).render('error', { title: 'Error', error });
  }
});

// POST /topics/:id/complete
router.post('/:id/complete', requireAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.session.userId,
      topic: req.params.id
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    progress.completed = !progress.completed;
    progress.completedAt = progress.completed ? new Date() : null;
    await progress.save();

    res.json({ success: true, completed: progress.completed });
  } catch (error) {
    console.error('Complete topic error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// POST /topics/:id/time
router.post('/:id/time', requireAuth, async (req, res) => {
  try {
    const { timeSpent } = req.body;
    
    const progress = await Progress.findOne({
      user: req.session.userId,
      topic: req.params.id
    });

    if (progress) {
      progress.timeSpent += parseInt(timeSpent) || 0;
      await progress.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Time tracking error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;
