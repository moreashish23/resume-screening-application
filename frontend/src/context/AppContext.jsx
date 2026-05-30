import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  currentJD: null,
  candidates: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_JD': return { ...state, currentJD: action.payload };
    case 'SET_CANDIDATES': return { ...state, candidates: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_PROGRESS': return { ...state, uploadProgress: action.payload };
    case 'CLEAR_ERROR': return { ...state, error: null };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}