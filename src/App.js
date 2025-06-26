import React, { useState, useCallback } from 'react';
import './App.css';
import Calendar from './components/Calendar/Calendar';
import EventForm from './components/EventForm/EventForm';
import EventSearch from './components/EventSearch';
import { EventProvider } from './context/EventContext';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // Handle filtered events change
  const handleFilteredEventsChange = useCallback((events) => {
    setFilteredEvents(events);
  }, []);

  return (
    <EventProvider>
      <div className="App">
        <header className="App-header">
          <h1>Event Calendar</h1>
        </header>
        <main className="App-main">
          <div className="sidebar">
            <EventSearch onFilteredEventsChange={handleFilteredEventsChange} />
            <div className="filtered-events">
              <h3>Events</h3>
              {filteredEvents.length === 0 ? (
                <p>No events found.</p>
              ) : (
                <ul className="event-list">
                  {filteredEvents.map(event => (
                    <li 
                      key={event.id || event.instanceId} 
                      className={`event-list-item ${event.color || ''}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="event-list-title">{event.title}</div>
                      <div className="event-list-date">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="calendar-container">
            <Calendar 
              onSelectDate={handleDateSelect} 
              onEventClick={handleEventClick}
            />
          </div>
          {showEventForm && (
            <EventForm 
              selectedDate={selectedDate} 
              selectedEvent={selectedEvent} 
              onClose={handleCloseForm} 
            />
          )}
        </main>
      </div>
    </EventProvider>
  );
}

export default App;
