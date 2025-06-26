import React, { useState, useEffect } from 'react';
import { useEvents } from '../context/EventContext';

const EventSearch = ({ onFilteredEventsChange }) => {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Get unique categories from events
  const categories = ['all', ...new Set(events.map(event => event.color || 'blue'))];

  // Filter events based on search term and category
  useEffect(() => {
    let filtered = [...events];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.color === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(term) || 
          (event.description && event.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredEvents(filtered);
    onFilteredEventsChange(filtered);
  }, [searchTerm, selectedCategory, events, onFilteredEventsChange]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="event-search">
      <div className="search-input">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="category-filter">
        <label htmlFor="category-select">Filter by category:</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="search-results">
        <p>{filteredEvents.length} events found</p>
      </div>
    </div>
  );
};

export default EventSearch; 