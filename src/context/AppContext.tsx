import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SetupConfig {
  parentAName: string;
  parentBName: string;
  children: string[];
  currency: string;
  startYear: number;
  weekStart: 'sunday' | 'monday';
  isConfigured: boolean;
}

export interface CustodySlot {
  earlyMorning: 'A' | 'B';
  morning: 'A' | 'B';
  afternoon: 'A' | 'B';
  night: 'A' | 'B';
}

export interface CustodyException {
  id: string;
  date: string;
  slots: CustodySlot;
  reason: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paidBy: 'A' | 'B';
  splitA: number;
  splitB: number;
}

export interface ChildSupport {
  id: string;
  month: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  paymentMethod: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface Task {
  id: string;
  title: string;
  assignedTo: 'A' | 'B' | 'both';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface Note {
  id: string;
  date: string;
  author: 'A' | 'B';
  content: string;
  tags: string[];
}

interface AppState {
  setup: SetupConfig;
  recurringSchedule: Record<string, CustodySlot>; // day-of-week -> slot
  exceptions: CustodyException[];
  expenses: Expense[];
  childSupport: ChildSupport[];
  tasks: Task[];
  notes: Note[];
}

interface AppContextType extends AppState {
  updateSetup: (config: Partial<SetupConfig>) => void;
  setRecurringSchedule: (day: string, slot: CustodySlot) => void;
  addException: (exception: CustodyException) => void;
  removeException: (id: string) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  addChildSupport: (entry: ChildSupport) => void;
  updateChildSupport: (id: string, updates: Partial<ChildSupport>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
}

const defaultSlot: CustodySlot = { earlyMorning: 'A', morning: 'A', afternoon: 'A', night: 'A' };

const defaultSchedule: Record<string, CustodySlot> = {
  monday: { earlyMorning: 'A', morning: 'A', afternoon: 'A', night: 'A' },
  tuesday: { earlyMorning: 'A', morning: 'A', afternoon: 'A', night: 'A' },
  wednesday: { earlyMorning: 'A', morning: 'A', afternoon: 'A', night: 'A' },
  thursday: { earlyMorning: 'B', morning: 'B', afternoon: 'B', night: 'B' },
  friday: { earlyMorning: 'B', morning: 'B', afternoon: 'B', night: 'B' },
  saturday: { earlyMorning: 'B', morning: 'B', afternoon: 'B', night: 'B' },
  sunday: { earlyMorning: 'B', morning: 'B', afternoon: 'B', night: 'B' },
};

const initialState: AppState = {
  setup: {
    parentAName: 'Parent A',
    parentBName: 'Parent B',
    children: ['Child'],
    currency: '$',
    startYear: 2026,
    weekStart: 'monday',
    isConfigured: false,
  },
  recurringSchedule: defaultSchedule,
  exceptions: [],
  expenses: [],
  childSupport: [],
  tasks: [],
  notes: [],
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('coparent-data');
    return saved ? JSON.parse(saved) : initialState;
  });

  const persist = useCallback((newState: AppState) => {
    setState(newState);
    localStorage.setItem('coparent-data', JSON.stringify(newState));
  }, []);

  const updateSetup = (config: Partial<SetupConfig>) => {
    persist({ ...state, setup: { ...state.setup, ...config, isConfigured: true } });
  };

  const setRecurringSchedule = (day: string, slot: CustodySlot) => {
    persist({ ...state, recurringSchedule: { ...state.recurringSchedule, [day]: slot } });
  };

  const addException = (exception: CustodyException) => {
    persist({ ...state, exceptions: [...state.exceptions, exception] });
  };

  const removeException = (id: string) => {
    persist({ ...state, exceptions: state.exceptions.filter(e => e.id !== id) });
  };

  const addExpense = (expense: Expense) => {
    persist({ ...state, expenses: [...state.expenses, expense] });
  };

  const removeExpense = (id: string) => {
    persist({ ...state, expenses: state.expenses.filter(e => e.id !== id) });
  };

  const addChildSupport = (entry: ChildSupport) => {
    persist({ ...state, childSupport: [...state.childSupport, entry] });
  };

  const updateChildSupport = (id: string, updates: Partial<ChildSupport>) => {
    persist({
      ...state,
      childSupport: state.childSupport.map(cs => cs.id === id ? { ...cs, ...updates } : cs),
    });
  };

  const addTask = (task: Task) => {
    persist({ ...state, tasks: [...state.tasks, task] });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    persist({
      ...state,
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  };

  const removeTask = (id: string) => {
    persist({ ...state, tasks: state.tasks.filter(t => t.id !== id) });
  };

  const addNote = (note: Note) => {
    persist({ ...state, notes: [...state.notes, note] });
  };

  const removeNote = (id: string) => {
    persist({ ...state, notes: state.notes.filter(n => n.id !== id) });
  };

  return (
    <AppContext.Provider value={{
      ...state, updateSetup, setRecurringSchedule, addException, removeException,
      addExpense, removeExpense, addChildSupport, updateChildSupport,
      addTask, updateTask, removeTask, addNote, removeNote,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
