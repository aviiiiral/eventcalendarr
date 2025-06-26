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
  const [isRecurringInstance, setIsRecurringInstance] = useState(false);
  const [originalEventId, setOriginalEventId] = useState(null);

  // Initialize form data when editing an event
  useEffect(() => {
    if (selectedEvent) {
      try {
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
        
        // Check if this is a recurring instance
        if (selectedEvent.isRecurring && selectedEvent.originalEventId) {
          setIsRecurringInstance(true);
          setOriginalEventId(selectedEvent.originalEventId);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        // Fallback to current date if parsing fails
        setFormData(prev => ({
          ...prev,
          date: new Date(),
          endTime: null
        }));
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
    
    try {
      const eventToCheck = {
        ...formData,
        date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: formData.endTime ? format(formData.endTime, "yyyy-MM-dd'T'HH:mm:ss") : null,
      };
      
      const conflict = checkEventConflict(events, eventToCheck);
      setHasConflict(conflict);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
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
    
    try {
      const eventData = {
        ...formData,
        date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: formData.endTime ? format(formData.endTime, "yyyy-MM-dd'T'HH:mm:ss") : null,
      };
      
      // If this is a recurring instance, ask if they want to edit just this instance or all instances
      if (isRecurringInstance) {
        const confirmEdit = window.confirm(
          'This is a recurring event. Do you want to edit only this instance? ' +
          'Click OK to edit only this instance, or Cancel to edit all instances.'
        );
        
        if (confirmEdit) {
          // Create a new non-recurring event for this instance
          const newEvent = {
            ...eventData,
            id: Date.now().toString(), // Generate a new ID
            isRecurring: false,
            recurrence: null,
            originalEventId: null
          };
          
          // Add as a new event
          addEvent(newEvent);
          
          // Delete this instance from the original recurring event
          // This would require more complex logic to actually remove just one instance
          // For now, we'll just add the new event
        } else {
          // Find the original event to update all instances
          const originalEvent = events.find(e => e.id === originalEventId);
          if (originalEvent) {
            const updatedEvent = {
              ...originalEvent,
              title: eventData.title,
              description: eventData.description,
              color: eventData.color,
              date: eventData.date,
              endTime: eventData.endTime,
              recurrence: eventData.recurrence
            };
            
            // Update the original event
            updateEvent(updatedEvent);
          } else {
            alert('Could not find the original event to update.');
          }
        }
      } else {
        // Normal event update/add
        if (formData.id) {
          updateEvent(eventData);
        } else {
          addEvent(eventData);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('There was an error saving your event. Please try again.');
    }
  };

  const handleDelete = () => {
    if (isRecurringInstance) {
      const confirmDelete = window.confirm(
        'This is a recurring event. Do you want to delete only this instance? ' +
        'Click OK to delete only this instance, or Cancel to delete all instances.'
      );
      
      if (confirmDelete) {
        // This would require more complex logic to actually remove just one instance
        // For now, we'll just close the form
        alert('Deleting a single instance of a recurring event is not supported yet.');
        onClose();
      } else {
        // Delete the original recurring event
        if (window.confirm('Are you sure you want to delete all instances of this recurring event?')) {
          deleteEvent(originalEventId);
          onClose();
        }
      }
    } else {
      // Normal event deletion
      if (window.confirm('Are you sure you want to delete this event?')) {
        deleteEvent(formData.id);
        onClose();
      }
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form">
        <h2>{formData.id ? 'Edit Event' : 'Add Event'}</h2>
        {isRecurringInstance && (
          <div className="recurring-warning">
            This is part of a recurring event series.
          </div>
        )}
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