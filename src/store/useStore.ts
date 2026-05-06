import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BookedLesson } from '../types';

interface AppState {
  bookedLessons: BookedLesson[];
  userTimezone: string;
  addLesson: (lesson: BookedLesson) => void;
  removeLesson: (id: string) => void;
  setUserTimezone: (timezone: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      bookedLessons: [],
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      addLesson: (lesson) =>
        set((state) => ({
          bookedLessons: [...state.bookedLessons, lesson],
        })),
      removeLesson: (id) =>
        set((state) => ({
          bookedLessons: state.bookedLessons.filter((l) => l.id !== id),
        })),
      setUserTimezone: (timezone) => set({ userTimezone: timezone }),
    }),
    {
      name: 'ai-english-tutor-storage',
    }
  )
);
