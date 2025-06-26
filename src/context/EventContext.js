import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define the initial state
const initialState = {
  events: [],
  loading: false,
  error: null,
};

// Define action types
export const ActionTypes = {
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Create the reducer
const eventReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    case ActionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case ActionTypes.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Create the context
export const EventContext = createContext();

// Create the provider component
export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Load events from localStorage on initial render
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      parsedEvents.forEach(event => {
        dispatch({ type: ActionTypes.ADD_EVENT, payload: event });
      });
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(state.events));
  }, [state.events]);

  // Create actions
  const addEvent = (event) => {
    dispatch({ type: ActionTypes.ADD_EVENT, payload: { ...event, id: Date.now().toString() } });
  };

  const updateEvent = (event) => {
    dispatch({ type: ActionTypes.UPDATE_EVENT, payload: event });
  };

  const deleteEvent = (eventId) => {
    dispatch({ type: ActionTypes.DELETE_EVENT, payload: eventId });
  };

  const setLoading = (isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  return (
    <EventContext.Provider
      value={{
        events: state.events,
        loading: state.loading,
        error: state.error,
        addEvent,
        updateEvent,
        deleteEvent,
        setLoading,
        setError,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

// Create a custom hook for using the event context
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}; 