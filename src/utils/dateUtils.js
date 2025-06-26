import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  addWeeks,
  addMonths as addMonthsFn,
  setHours,
  setMinutes,
  parseISO
} from 'date-fns';

// Get calendar days for a given month
export const getCalendarDays = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

// Format date to display
export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  return format(date, formatStr);
};

// Check if a date is in the current month
export const isCurrentMonth = (date, currentMonth) => {
  return isSameMonth(date, currentMonth);
};

// Check if a date is today
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

// Navigate to next month
export const nextMonth = (date) => {
  return addMonths(date, 1);
};

// Navigate to previous month
export const prevMonth = (date) => {
  return subMonths(date, 1);
};

// Get events for a specific day
export const getEventsForDay = (events, day) => {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= dayStart && eventDate <= dayEnd;
  });
};

// Generate recurring event instances
export const generateRecurringEvents = (event, startDate, endDate) => {
  if (!event.recurrence) {
    return [event];
  }

  const instances = [];
  let currentDate = new Date(event.date);
  
  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      instances.push({
        ...event,
        date: format(currentDate, 'yyyy-MM-dd\'T\'HH:mm:ss'),
        isRecurring: true,
        originalEventId: event.id,
        instanceId: `${event.id}-${format(currentDate, 'yyyy-MM-dd')}`
      });
    }
    
    switch (event.recurrence.type) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        if (event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.length > 0) {
          // Find the next day that matches one of the selected days of the week
          let found = false;
          let tempDate = addDays(currentDate, 1);
          const daysChecked = 0;
          
          while (!found && daysChecked < 7) {
            const dayOfWeek = format(tempDate, 'EEEE').toLowerCase();
            if (event.recurrence.daysOfWeek.includes(dayOfWeek)) {
              currentDate = tempDate;
              found = true;
            } else {
              tempDate = addDays(tempDate, 1);
            }
          }
          
          if (!found) {
            currentDate = addWeeks(currentDate, 1);
          }
        } else {
          currentDate = addWeeks(currentDate, 1);
        }
        break;
      case 'monthly':
        currentDate = addMonthsFn(currentDate, 1);
        break;
      case 'custom':
        if (event.recurrence.interval) {
          switch (event.recurrence.intervalType) {
            case 'days':
              currentDate = addDays(currentDate, event.recurrence.interval);
              break;
            case 'weeks':
              currentDate = addWeeks(currentDate, event.recurrence.interval);
              break;
            case 'months':
              currentDate = addMonthsFn(currentDate, event.recurrence.interval);
              break;
            default:
              currentDate = addDays(currentDate, 1);
          }
        } else {
          currentDate = addDays(currentDate, 1);
        }
        break;
      default:
        currentDate = addDays(currentDate, 1);
    }
  }
  
  return instances;
};

// Check for event conflicts
export const checkEventConflict = (events, newEvent) => {
  const newEventStart = parseISO(newEvent.date);
  const newEventEnd = newEvent.endTime ? parseISO(newEvent.endTime) : setHours(setMinutes(newEventStart, 59), 23);
  
  return events.some(event => {
    if (event.id === newEvent.id) return false; // Skip the event being edited
    
    const eventStart = parseISO(event.date);
    const eventEnd = event.endTime ? parseISO(event.endTime) : setHours(setMinutes(eventStart, 59), 23);
    
    return (
      (newEventStart >= eventStart && newEventStart <= eventEnd) ||
      (newEventEnd >= eventStart && newEventEnd <= eventEnd) ||
      (newEventStart <= eventStart && newEventEnd >= eventEnd)
    );
  });
}; 