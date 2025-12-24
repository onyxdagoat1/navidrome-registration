require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));

// Configuration
const NAVIDROME_URL = process.env.NAVIDROME_URL;
const ADMIN_USER = process.env.NAVIDROME_ADMIN_USER;
const ADMIN_PASSWORD = process.env.NAVIDROME_ADMIN_PASSWORD;

// Rate limiting
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    success: false, 
    error: 'Too many registration attempts. Please try again later.' 
  }
});

// Helper function to generate Subsonic API authentication
function generateSubsonicAuth(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const token = crypto.createHash('md5')
    .update(password + salt)
    .digest('hex');
  return { salt, token };
}

// Registration endpoint
app.post('/api/register', registerLimiter, async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, and email are required'
      });
    }

    // Username validation (alphanumeric, underscore, hyphen only)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: 'Username must be 3-20 characters (letters, numbers, underscore, hyphen only)'
      });
    }

    // Password strength check
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Generate authentication for admin
    const { salt, token } = generateSubsonicAuth(ADMIN_PASSWORD);

    // Create user via Subsonic API
    const createUserUrl = `${NAVIDROME_URL}/rest/createUser`;
    
    const params = {
      u: ADMIN_USER,
      t: token,
      s: salt,
      v: '1.16.1',
      c: 'NavidromeRegistration',
      f: 'json',
      username: username,
      password: password,
      email: email,
      adminRole: false,
      downloadRole: true,
      uploadRole: true,
      playlistRole: true,
      shareRole: true,
      commentRole: true,
      podcastRole: true,
      streamRole: true,
      jukeboxRole: false,
      settingsRole: false,
      coverArtRole: true
    };

    const response = await axios.get(createUserUrl, { params });

    // Check Subsonic API response
    if (response.data['subsonic-response'].status === 'ok') {
      return res.json({
        success: true,
        message: 'Account created successfully',
        username: username
      });
    } else {
      const error = response.data['subsonic-response'].error;
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to create user'
      });
    }

  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.data?.['subsonic-response']?.error) {
      const subsonicError = error.response.data['subsonic-response'].error;
      return res.status(400).json({
        success: false,
        error: subsonicError.message || 'User creation failed'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Registration service running',
    navidromeUrl: NAVIDROME_URL 
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Registration service running on port ${PORT}`);
  console.log(`Navidrome URL: ${NAVIDROME_URL}`);
});
