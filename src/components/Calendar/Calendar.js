import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarDays from './CalendarDays';
import CalendarCell from './CalendarCell';
import { useEvents } from '../../context/EventContext';
import { 
  getCalendarDays, 
  nextMonth, 
  prevMonth, 
  getEventsForDay,
  generateRecurringEvents,
  checkEventConflict
} from '../../utils/dateUtils';

const Calendar = ({ onSelectDate, onEventClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  
  const { events, updateEvent } = useEvents();

  // Update calendar days when month changes
  useEffect(() => {
    setCalendarDays(getCalendarDays(currentMonth));
  }, [currentMonth]);

  // Process events including recurring events
  useEffect(() => {
    if (events.length === 0) {
      setAllEvents([]);
      return;
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    let processedEvents = [];
    
    events.forEach(event => {
      if (event.recurrence) {
        const recurringInstances = generateRecurringEvents(event, monthStart, monthEnd);
        processedEvents = [...processedEvents, ...recurringInstances];
      } else {
        processedEvents.push(event);
      }
    });
    
    setAllEvents(processedEvents);
  }, [events, currentMonth]);

  // Handle month navigation
  const handleNextMonth = () => {
    setCurrentMonth(nextMonth(currentMonth));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth(currentMonth));
  };

  // Handle event drag and drop
  const handleEventDrop = (draggedEvent, targetDate) => {
    // If it's a recurring event instance, ask if they want to edit just this instance or all instances
    if (draggedEvent.isRecurring) {
      const confirmEdit = window.confirm(
        'This is a recurring event. Do you want to move only this instance? ' +
        'Click OK to move only this instance, or Cancel to move all instances.'
      );
      
      if (confirmEdit) {
        // Create a new non-recurring event for this instance
        const eventDate = new Date(draggedEvent.date);
        const targetDateTime = new Date(targetDate);
        
        // Preserve the original time
        targetDateTime.setHours(
          eventDate.getHours(),
          eventDate.getMinutes(),
          eventDate.getSeconds()
        );
        
        const newEvent = {
          ...draggedEvent,
          id: Date.now().toString(), // Generate a new ID
          date: format(targetDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
          isRecurring: false,
          recurrence: null,
          originalEventId: null,
          instanceId: null
        };
        
        // Check for conflicts
        const hasConflict = checkEventConflict(events, newEvent);
        
        if (hasConflict) {
          alert('There is a scheduling conflict with another event at this time.');
          return;
        }
        
        // Add as a new event
        updateEvent(newEvent);
        return;
      } else {
        // Find the original event to update all instances
        const originalEvent = events.find(e => e.id === draggedEvent.originalEventId);
        if (!originalEvent) {
          alert('Could not find the original event to update.');
          return;
        }
        
        // Calculate the time difference between the original date and target date
        const originalDate = new Date(originalEvent.date);
        const targetDateTime = new Date(targetDate);
        
        // Preserve the original time
        targetDateTime.setHours(
          originalDate.getHours(),
          originalDate.getMinutes(),
          originalDate.getSeconds()
        );
        
        const updatedEvent = {
          ...originalEvent,
          date: format(targetDateTime, "yyyy-MM-dd'T'HH:mm:ss")
        };
        
        // Check for conflicts
        const hasConflict = checkEventConflict(events, updatedEvent);
        
        if (hasConflict) {
          alert('There is a scheduling conflict with another event at this time.');
          return;
        }
        
        // Update the original event
        updateEvent(updatedEvent);
        return;
      }
    }
    
    // For non-recurring events, proceed as normal
    const eventDate = new Date(draggedEvent.date);
    const targetDateTime = new Date(targetDate);
    
    // Preserve the original time
    targetDateTime.setHours(
      eventDate.getHours(),
      eventDate.getMinutes(),
      eventDate.getSeconds()
    );
    
    const updatedEvent = {
      ...draggedEvent,
      date: format(targetDateTime, "yyyy-MM-dd'T'HH:mm:ss")
    };
    
    // Check for conflicts
    const hasConflict = checkEventConflict(events, updatedEvent);
    
    if (hasConflict) {
      alert('There is a scheduling conflict with another event at this time.');
      return;
    }
    
    // Update the event
    updateEvent(updatedEvent);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar">
        <CalendarHeader 
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarDays />
        <div className="calendar-grid">
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDay(allEvents, day);
            return (
              <CalendarCell
                key={day.toString()}
                day={day}
                currentMonth={currentMonth}
                events={dayEvents}
                onSelectDate={onSelectDate}
                onEventClick={onEventClick}
                onEventDrop={handleEventDrop}
              />
            );
          })}
        </div>
      </div>
    </DndProvider>
  );
};

export default Calendar; 