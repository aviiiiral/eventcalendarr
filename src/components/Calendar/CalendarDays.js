import React from 'react';

const CalendarDays = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="calendar-days">
      {days.map(day => (
        <div key={day} className="calendar-day-header">
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarDays; 