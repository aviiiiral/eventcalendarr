import React from 'react';
import { useDrag } from 'react-dnd';
import { format } from 'date-fns';

const EventItem = ({ event, onClick }) => {
  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { event },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Format event time for display
  const eventTime = event.date ? format(new Date(event.date), 'h:mm a') : '';
  
  // Determine event classes
  const eventClasses = [
    'event-item',
    event.color || '',
    isDragging ? 'dragging' : '',
    event.isRecurring ? 'recurring' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={drag}
      className={eventClasses}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="event-time">{eventTime}</div>
      <div className="event-title">{event.title}</div>
    </div>
  );
};

export default EventItem; 