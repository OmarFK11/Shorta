const express = require('express');
const router = express.Router();
const Url = require('../models/Url');

const checkSafeBrowsing = require('../utils/safeBrowsing');
// Generate a random short code
// (62)⁴ = 56800235584
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < 6; i++) {
    shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortCode;
};

const normalizeUrl = (value) => {
  if (!value) return '';

  let url = value.trim();

  // If scheme is missing, add https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    // Parse the URL to ensure it’s valid
    const parsed = new URL(url);
    return parsed.href; // always returns a fully normalized URL
  } catch (err) {
    // Invalid URL input
    return null;
  }
};

// POST /api/shorten - Create a shortened URL
router.post('/shorten', async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }
    // console.log("long: " + longUrl);
    const normalizedUrl = normalizeUrl(longUrl);

    // Validate URL format
    let parsedUrl;
    // console.log("nor: " + normalizedUrl);
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // 🚫 Block dangerous protocols
    const allowedProtocols = ['http:', 'https:'];

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return res.status(400).json({
        error: 'Unsupported URL protocol'
      });
    }
    // console.log("parsed: " + parsedUrl);
    const isSafe = await checkSafeBrowsing(normalizedUrl);

    if (!isSafe) {
      return res.status(400).json({
        error: 'This URL has been flagged as unsafe or malicious'
      });
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

