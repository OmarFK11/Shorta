
const https = require('https');

const GOOGLE_API_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;

if (!GOOGLE_API_KEY) {
  console.warn('⚠️ GOOGLE_SAFE_BROWSING_KEY is not set');
}

const checkSafeBrowsing = (url) => {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      client: {
        clientId: "url-shortener",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    });

    const req = https.request(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            // Safe if Google returns no matches
            resolve(!json.matches);
          } catch {
            resolve(false);
          }
        });
      }
    );

    req.on("error", () => resolve(false));
    req.write(body);
    req.end();
  });
};

module.exports = checkSafeBrowsing;
