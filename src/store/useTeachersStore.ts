import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeacherListing } from '../types';
import seedData from '../data/teachers.json';

const SEED_TEACHERS: TeacherListing[] = (seedData as Omit<TeacherListing, 'status' | 'submittedAt'>[]).map((t) => ({
  ...t,
  status: 'approved' as const,
  submittedAt: '2026-01-01T00:00:00Z',
  approvedAt: '2026-01-01T00:00:00Z',
}));

interface TeachersState {
  teachers: TeacherListing[];
  addTeacher: (t: TeacherListing) => void;
  approveTeacher: (id: string) => void;
  rejectTeacher: (id: string) => void;
  updateTeacher: (id: string, data: Partial<TeacherListing>) => void;
  getTeacherByUserId: (userId: string) => TeacherListing | undefined;
  getApproved: () => TeacherListing[];
  getPending: () => TeacherListing[];
}

export const useTeachersStore = create<TeachersState>()(
  persist(
    (set, get) => ({
      teachers: SEED_TEACHERS,

      addTeacher: (t) =>
        set((state) => ({
          teachers: [...state.teachers, t],
        })),

      approveTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === id ? { ...t, status: 'approved', approvedAt: new Date().toISOString() } : t
          ),
        })),

      rejectTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === id ? { ...t, status: 'rejected', rejectedAt: new Date().toISOString() } : t
          ),
        })),

      updateTeacher: (id, data) =>
        set((state) => ({
          teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      getTeacherByUserId: (userId) => get().teachers.find((t) => t.userId === userId),

      getApproved: () => get().teachers.filter((t) => t.status === 'approved'),

      getPending: () => get().teachers.filter((t) => t.status === 'pending'),
    }),
    { name: 'ai-tutor-teachers' }
  )
);
