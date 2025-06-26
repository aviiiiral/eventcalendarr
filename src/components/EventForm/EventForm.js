import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import { useEvents } from '../../context/EventContext';
import { checkEventConflict } from '../../utils/dateUtils';
import RecurrenceOptions from './RecurrenceOptions';

const EventForm = ({ selectedDate, selectedEvent, onClose }) => {
  const { addEvent, updateEvent, deleteEvent, events } = useEvents();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    date: selectedDate || new Date(),
    endTime: null,
    description: '',
    color: 'blue',
    recurrence: null,
  });
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  // Initialize form data when editing an event
  useEffect(() => {
    if (selectedEvent) {
      const eventDate = parseISO(selectedEvent.date);
      const endTime = selectedEvent.endTime ? parseISO(selectedEvent.endTime) : null;
      
      setFormData({
        id: selectedEvent.id,
        title: selectedEvent.title || '',
        date: eventDate,
        endTime: endTime,
        description: selectedEvent.description || '',
        color: selectedEvent.color || 'blue',
        recurrence: selectedEvent.recurrence || null,
      });
      
      if (selectedEvent.recurrence) {
        setShowRecurrenceOptions(true);
      }
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, [selectedEvent, selectedDate]);

  // Check for conflicts when form data changes
  useEffect(() => {
    if (!formData.title) return;
    
    const eventToCheck = {
      ...formData,
      date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: formData.endTime ? format(formData.endTime, "yyyy-MM-dd'T'HH:mm:ss") : null,
    };
    
    const conflict = checkEventConflict(events, eventToCheck);
    setHasConflict(conflict);
  }, [formData, events]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date,
    });
  };

  const handleEndTimeChange = (date) => {
    setFormData({
      ...formData,
      endTime: date,
    });
  };

  const handleRecurrenceChange = (recurrenceData) => {
    setFormData({
      ...formData,
      recurrence: recurrenceData,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (hasConflict) {
      const confirmSave = window.confirm('This event conflicts with another event. Do you want to save it anyway?');
      if (!confirmSave) return;
    }
    
    const eventData = {
      ...formData,
      date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: formData.endTime ? format(formData.endTime, "yyyy-MM-dd'T'HH:mm:ss") : null,
    };
    
    if (formData.id) {
      updateEvent(eventData);
    } else {
      addEvent(eventData);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(formData.id);
      onClose();
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form">
        <h2>{formData.id ? 'Edit Event' : 'Add Event'}</h2>
        {hasConflict && (
          <div className="conflict-warning">
            Warning: This event conflicts with another event.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date & Time</label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="date-picker"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">End Time (Optional)</label>
            <DatePicker
              selected={formData.endTime}
              onChange={handleEndTimeChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="date-picker"
              placeholderText="Select end time (optional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="color">Event Color</label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="purple">Purple</option>
              <option value="orange">Orange</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={showRecurrenceOptions}
                onChange={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
              />
              Recurring Event
            </label>
          </div>
          
          {showRecurrenceOptions && (
            <RecurrenceOptions
              recurrence={formData.recurrence}
              onChange={handleRecurrenceChange}
            />
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {formData.id ? 'Update Event' : 'Add Event'}
            </button>
            {formData.id && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                Delete Event
              </button>
            )}
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm; 