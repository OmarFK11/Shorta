import React from 'react';

const LinkList = ({ links, onRemove }) => {
  if (!links || links.length === 0) {
    return (
      <div className="link-list">
        <p>No shortened links yet. Create one above!</p>
      </div>
    );
  }

  // Use backend URL for short links (where the redirect handler is)
  const backendUrl = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'http://localhost:5000';
  const baseUrl = backendUrl;

  const copyToClipboard = (shortCode) => {
    const shortUrl = `${baseUrl}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl).then(() => {
      alert('Short URL copied to clipboard!');
    });
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to delete this shortened URL?')) {
      onRemove(id);
    }
  };

  return (
    <div className="link-list">
      <h2>Your Shortened Links</h2>
      <ul className="links">
        {links.map((link) => (
          <li key={link._id} className="link-item">
            <div className="link-content">
              <div className="link-info">
                <p className="long-url">{link.longUrl}</p>
                <p className="short-url">
                  <a href={`${baseUrl}/${link.shortCode}`} target="_blank" rel="noopener noreferrer">
                    {baseUrl}/{link.shortCode}
                  </a>
                </p>
              </div>
              <div className="link-actions">
                <button
                  onClick={() => copyToClipboard(link.shortCode)}
                  className="copy-btn"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleRemove(link._id)}
                  className="remove-btn"
                  title="Delete this URL"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LinkList;

