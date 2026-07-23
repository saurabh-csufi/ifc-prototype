import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { DashboardState, DashboardAction, StateEntity } from '../types';
import { INDICATORS } from '../config/indicators';
import { DEFAULT_STATE, fetchStatesList } from '../config/states';

const initialState: DashboardState = {
  selectedState: DEFAULT_STATE,
  selectedTheme: 'Education',
  visibleIndicatorIds: new Set(INDICATORS.map(i => i.id)),
  statesList: [],
  statesLoading: true,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, selectedState: action.payload };
    case 'SET_THEME':
      return { ...state, selectedTheme: action.payload };
    case 'TOGGLE_INDICATOR': {
      const next = new Set(state.visibleIndicatorIds);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return { ...state, visibleIndicatorIds: next };
    }
    case 'SET_VISIBLE_INDICATORS':
      return { ...state, visibleIndicatorIds: action.payload };
    case 'SET_STATES_LIST':
      return { ...state, statesList: action.payload, statesLoading: false };
    case 'SET_STATES_LOADING':
      return { ...state, statesLoading: action.payload };
    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  selectState: (entity: StateEntity) => void;
  toggleIndicator: (id: string) => void;
  selectAllIndicators: () => void;
  deselectAllIndicators: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    fetchStatesList().then(states => {
      dispatch({ type: 'SET_STATES_LIST', payload: states });
    });
  }, []);

  const selectState = (entity: StateEntity) => {
    dispatch({ type: 'SET_STATE', payload: entity });
  };

  const toggleIndicator = (id: string) => {
    dispatch({ type: 'TOGGLE_INDICATOR', payload: id });
  };

  const selectAllIndicators = () => {
    dispatch({
      type: 'SET_VISIBLE_INDICATORS',
      payload: new Set(INDICATORS.map(i => i.id)),
    });
  };

  const deselectAllIndicators = () => {
    dispatch({ type: 'SET_VISIBLE_INDICATORS', payload: new Set() });
  };

  return (
    <DashboardContext.Provider
      value={{ state, dispatch, selectState, toggleIndicator, selectAllIndicators, deselectAllIndicators }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
