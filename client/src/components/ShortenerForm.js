import React, { useState } from 'react';

const ShortenerForm = ({ onShorten }) => {
  const [longUrl, setLongUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ensureProtocol = (value) => {
    if (!/^https?:\/\//i.test(value)) {
      return `http://${value}`;
    }
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const trimmed = longUrl.trim();

    if (!trimmed) {
      setError('Please enter a URL');
      return;
    }

    const candidate = ensureProtocol(trimmed);

    // Basic validation to avoid HTML5 native URL validation issues
    try {
      // eslint-disable-next-line no-new
      new URL(candidate);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      await onShorten(candidate);
      setLongUrl(''); // Clear form on success
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shortener-form">
      <div className="form-group">
        <input
          type="text"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Enter a URL (e.g., google.com or https://...)"
          disabled={loading}
          className="url-input"
        />
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default ShortenerForm;

