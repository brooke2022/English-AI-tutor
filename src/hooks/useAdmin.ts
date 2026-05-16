import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

export interface AdminTeacher {
  userId: string;
  country: string;
  countryCode: string;
  intro: string;
  hourlyRate: string | number;
  trialPrice: string | number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  user: { id: string; name: string; email: string; timezone: string; avatarUrl: string | null };
  tags: Array<{ tag: string }>;
}

export function useAdminTeachers(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  return useQuery({
    queryKey: ['admin', 'teachers', status],
    queryFn: () =>
      apiGet<AdminTeacher[]>('/admin/teachers', { params: status ? { status } : undefined }),
  });
}

export function useApproveTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/admin/teachers/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'teachers'] }),
  });
}

export function useRejectTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/admin/teachers/${id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'teachers'] }),
  });
}
