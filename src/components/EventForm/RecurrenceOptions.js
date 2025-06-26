import React, { useState, useEffect } from 'react';

const RecurrenceOptions = ({ recurrence, onChange }) => {
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [interval, setInterval] = useState(1);
  const [intervalType, setIntervalType] = useState('days');

  // Initialize form data when editing a recurrence
  useEffect(() => {
    if (recurrence) {
      setRecurrenceType(recurrence.type || 'daily');
      setDaysOfWeek(recurrence.daysOfWeek || []);
      setInterval(recurrence.interval || 1);
      setIntervalType(recurrence.intervalType || 'days');
    }
  }, [recurrence]);

  // Update parent component when recurrence options change
  useEffect(() => {
    const recurrenceData = {
      type: recurrenceType,
      daysOfWeek: recurrenceType === 'weekly' ? daysOfWeek : [],
      interval: recurrenceType === 'custom' ? interval : null,
      intervalType: recurrenceType === 'custom' ? intervalType : null,
    };
    
    onChange(recurrenceData);
  }, [recurrenceType, daysOfWeek, interval, intervalType, onChange]);

  const handleRecurrenceTypeChange = (e) => {
    setRecurrenceType(e.target.value);
  };

  const handleDayOfWeekChange = (e) => {
    const day = e.target.value;
    if (e.target.checked) {
      setDaysOfWeek([...daysOfWeek, day]);
    } else {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    }
  };

  const handleIntervalChange = (e) => {
    setInterval(parseInt(e.target.value, 10) || 1);
  };

  const handleIntervalTypeChange = (e) => {
    setIntervalType(e.target.value);
  };

  return (
    <div className="recurrence-options">
      <div className="form-group">
        <label>Recurrence Type</label>
        <select value={recurrenceType} onChange={handleRecurrenceTypeChange}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {recurrenceType === 'weekly' && (
        <div className="form-group">
          <label>Days of the Week</label>
          <div className="days-of-week">
            {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
              <label key={day} className="day-checkbox">
                <input
                  type="checkbox"
                  value={day}
                  checked={daysOfWeek.includes(day)}
                  onChange={handleDayOfWeekChange}
                />
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </label>
            ))}
          </div>
        </div>
      )}

      {recurrenceType === 'custom' && (
        <div className="form-group custom-recurrence">
          <label>Repeat every</label>
          <div className="custom-interval">
            <input
              type="number"
              min="1"
              value={interval}
              onChange={handleIntervalChange}
            />
            <select value={intervalType} onChange={handleIntervalTypeChange}>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceOptions; 