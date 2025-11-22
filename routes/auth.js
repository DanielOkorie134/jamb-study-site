const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /register
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('register', { title: 'Register', error: null });
});

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.render('register', { 
        title: 'Register', 
        error: 'All fields are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', { 
        title: 'Register', 
        error: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.render('register', { 
        title: 'Register', 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('register', { 
        title: 'Register', 
        error: 'Username or email already exists' 
      });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Log in the user
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { 
      title: 'Register', 
      error: 'An error occurred during registration' 
    });
  }
});

// GET /login
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login', error: null });
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', { 
        title: 'Login', 
        error: 'All fields are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid email or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log in the user
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { 
      title: 'Login', 
      error: 'An error occurred during login' 
    });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
