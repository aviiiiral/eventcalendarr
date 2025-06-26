import React from 'react';
import { format } from 'date-fns';
import { useDrop } from 'react-dnd';
import { isCurrentMonth, isToday } from '../../utils/dateUtils';
import EventItem from './EventItem';

const CalendarCell = ({ 
  day, 
  currentMonth, 
  events = [], 
  onSelectDate, 
  onEventClick,
  onEventDrop 
}) => {
  const formattedDate = format(day, 'd');
  
  // Set up drag and drop
  const [{ isOver }, drop] = useDrop({
    accept: 'event',
    drop: (item) => {
      onEventDrop(item.event, day);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Determine cell classes
  const cellClasses = [
    'calendar-cell',
    !isCurrentMonth(day, currentMonth) ? 'disabled' : '',
    isToday(day) ? 'today' : '',
    isOver ? 'drag-over' : '',
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      ref={drop}
      className={cellClasses}
      onClick={() => onSelectDate(day)}
    >
      <div className="cell-header">
        <span className="date-number">{formattedDate}</span>
      </div>
      <div className="cell-content">
        {events.map((event) => (
          <EventItem 
            key={event.id || event.instanceId}
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarCell; 