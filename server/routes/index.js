const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const HEAD_TIMEOUT_MS = 3000;

const tryHead = (targetUrl) =>
  new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.request(
        targetUrl,
        { method: 'HEAD', timeout: HEAD_TIMEOUT_MS },
        (res) => {
          // Any response counts as reachable
          res.destroy();
          resolve(true);
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.end();
    } catch (err) {
      resolve(false);
    }
  });

router.get('/link-not-found', (req, res) => {
  res
    .status(404)
    .send('Link not found or unreachable. Please check the URL and try again.');
});

// GET /:shortCode - Redirect to original URL
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const original = url.longUrl;

    const candidates = [];

    if (/^https?:\/\//i.test(original)) {
      candidates.push(original);
    } else {
      candidates.push(`https://${original}`, `http://${original}`);
    }
    let target = null;
    for (const candidate of candidates) {
      // Prefer HTTPS first, then HTTP fallback
      const reachable = await tryHead(candidate);
      if (reachable) {
        target = candidate;
        break;
      }
    }

    if (target) {
      return res.redirect(target);
    }

    // If neither HTTPS nor HTTP responds, redirect to internal broken page
    return res.redirect('/link-not-found');
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

