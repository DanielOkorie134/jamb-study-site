const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatMessage = require('../models/ChatMessage');
const Subject = require('../models/Subject');
const { requireAuth } = require('../middleware/auth');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for JAMB study assistant
const SYSTEM_PROMPT = `You are a helpful and knowledgeable JAMB (Joint Admissions and Matriculation Board) study assistant for Nigerian students. Your role is to:

1. Help students understand JAMB exam topics in English, Mathematics, Physics, and Chemistry
2. Explain concepts clearly and simply
3. Provide examples and practice questions when helpful
4. Encourage and motivate students
5. Answer questions about JAMB exam format, syllabus, and preparation strategies

Keep your responses concise, clear, and educational. Use simple language that students can easily understand. When explaining complex topics, break them down into smaller, digestible parts.`;

// POST /chatbot/message - Send message and get AI response
router.post('/message', requireAuth, async (req, res) => {
  try {
    const { message, subjectId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'AI service is not configured. Please add GEMINI_API_KEY to your .env file.' 
      });
    }

    // Save user message
    await ChatMessage.create({
      user: req.session.userId,
      role: 'user',
      content: message,
      subject: subjectId || null
    });

    // Get recent chat history for context (last 10 messages)
    const recentMessages = await ChatMessage.find({
      user: req.session.userId
    })
      .sort('-timestamp')
      .limit(10)
      .lean();

    // Build conversation history for Gemini
    const conversationHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    // Get subject context if provided
    let subjectContext = '';
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (subject) {
        subjectContext = `\n\nCurrent subject context: ${subject.name}`;
      }
    }

    // Generate AI response using gemini-2.5-flash (current free tier model)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });
    
    // Build the prompt with context
    const fullPrompt = `${SYSTEM_PROMPT}${subjectContext}\n\nConversation history:\n${conversationHistory.slice(0, -1).map(msg => `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.parts[0].text}`).join('\n')}\n\nStudent: ${message}\n\nAssistant:`;
    
    const result = await model.generateContent(fullPrompt);
    const aiResponse = result.response.text();

    // Save AI response
    await ChatMessage.create({
      user: req.session.userId,
      role: 'assistant',
      content: aiResponse,
      subject: subjectId || null
    });

    res.json({
      success: true,
      message: aiResponse
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// GET /chatbot/history - Get chat history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const messages = await ChatMessage.find({
      user: req.session.userId
    })
      .sort('-timestamp')
      .limit(limit)
      .populate('subject', 'name slug')
      .lean();

    res.json({
      success: true,
      messages: messages.reverse()
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load chat history'
    });
  }
});

// DELETE /chatbot/history - Clear chat history
router.delete('/history', requireAuth, async (req, res) => {
  try {
    await ChatMessage.deleteMany({
      user: req.session.userId
    });

    res.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
});

module.exports = router;
