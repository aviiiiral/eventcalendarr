import React from 'react';
import { format } from 'date-fns';

const CalendarHeader = ({ currentMonth, onPrevMonth, onNextMonth }) => {
  return (
    <div className="calendar-header">
      <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
      <div className="calendar-nav">
        <button onClick={onPrevMonth}>&lt; Prev</button>
        <button onClick={() => onNextMonth()}>Next &gt;</button>
      </div>
    </div>
  );
};

export default CalendarHeader; 