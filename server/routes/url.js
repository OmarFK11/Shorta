const express = require('express');
const router = express.Router();
const Url = require('../models/Url');

// Generate a random short code
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < 6; i++) {
    shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortCode;
};

const normalizeUrl = (value) => {
  if (!/^https?:\/\//i.test(value)) {
    return `http://${value}`;
  }
  return value;
};

// POST /api/shorten - Create a shortened URL
router.post('/shorten', async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }

    const normalizedUrl = normalizeUrl(longUrl);

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL already exists
    let url = await Url.findOne({ longUrl: normalizedUrl });

    if (url) {
      return res.json(url);
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = generateShortCode();
      const existing = await Url.findOne({ shortCode });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create new URL document
    url = new Url({
      longUrl: normalizedUrl,
      shortCode,
    });

    await url.save();
    res.json(url);
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/links - Get all shortened links
router.get('/links', async (req, res) => {
  try {
    const links = await Url.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/links/:id - Delete a shortened URL
router.delete('/links/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const url = await Url.findByIdAndDelete(id);

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully', id });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

