import React, { useState, useEffect } from 'react';
import ShortenerForm from './components/ShortenerForm';
import LinkList from './components/LinkList';
import { getLinks, shortenUrl, deleteLink } from './api/shortenerApi';
import './App.css';

function App() {
  const [links, setLinks] = useState([]);

  const fetchLinks = async () => {
    try {
      const data = await getLinks();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleShorten = async (longUrl) => {
    try {
      await shortenUrl(longUrl);
      fetchLinks(); // Refresh the list after shortening
    } catch (error) {
      console.error('Error shortening URL:', error);
      throw error;
    }
  };

  const handleRemove = async (id) => {
    try {
      await deleteLink(id);
      fetchLinks(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert('Failed to delete URL. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shorta - URL Shortener</h1>
      </header>
      <main>
        <ShortenerForm onShorten={handleShorten} />
        <LinkList links={links} onRemove={handleRemove} />
      </main>
    </div>
  );
}

export default App;

